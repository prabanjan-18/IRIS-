import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Path, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from models.schemas import ChatRequest, ChatResponse, HealthStatus, ModelInfo, NearbyHospitalsResponse, ParseDocumentResponse
from services.openrouter_service import openrouter_service
from services.rag_service import rag_service
from services.location_service import location_service
from services.document_service import document_service

app = FastAPI(
    title="IRIS Health & Clinical AI API",
    description="FastAPI Backend powered by OpenRouter free LLM models and RAG conversation memory.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("[IRIS Backend] Starting up server...")
    rag_service.initialize()

@app.get("/api/health", response_model=HealthStatus)
async def health_check():
    has_key = bool(settings.OPENROUTER_API_KEY and settings.OPENROUTER_API_KEY != "your_openrouter_api_key_here")
    vector_status = "active" if rag_service._initialized else "pending"
    
    return HealthStatus(
        status="ok",
        openrouterKeyConfigured=has_key,
        primaryModel=settings.OPENROUTER_PRIMARY_MODEL,
        fallbackModels=settings.fallback_models_list,
        vectorDbStatus=vector_status
    )

def _format_model_name(model_id: str) -> str:
    raw_name = model_id.split("/")[-1].replace(":free", "").replace("-", " ").title()
    return raw_name

@app.get("/api/models")
async def get_available_models():
    all_models = [settings.OPENROUTER_PRIMARY_MODEL] + settings.fallback_models_list
    seen = set()
    models_list = []
    for model_id in all_models:
        if model_id not in seen:
            seen.add(model_id)
            models_list.append(ModelInfo(id=model_id, name=_format_model_name(model_id), isFree=True))
    return models_list

@app.post("/api/documents/parse", response_model=ParseDocumentResponse)
async def parse_document_endpoint(file: UploadFile = File(...)):
    """Accepts PDF, DOCX, DOC, or TXT medical lab reports, extracts readable text, and classifies report type."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")
    
    try:
        content_bytes = await file.read()
        if not content_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        result = document_service.extract_text(content_bytes, file.filename)
        return ParseDocumentResponse(
            status="success",
            filename=result["filename"],
            fileType=result["fileType"],
            extractedText=result["extractedText"],
            pageCount=result["pageCount"],
            wordCount=result["wordCount"],
            charCount=result["charCount"],
            preview=result["preview"],
            detectedReportType=result["detectedReportType"]
        )
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        print(f"[Document API Error] Failed to parse document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to extract text from document: {str(e)}")

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    user_text = (request.userMessageText or "").strip()
    if not user_text and not request.document and not request.image:
        raise HTTPException(status_code=400, detail="Either userMessageText, document, or image must be provided")
    
    if not user_text and request.document:
        user_text = f"Please review and analyze this attached medical report ({request.document.filename}). Summarize key findings, test parameters, and explain any abnormal values."
    elif not user_text and request.image:
        user_text = f"Please carefully review and analyze this uploaded image/screenshot ({request.image.filename}). Describe your observations, clinical interpretations, and recommendations."
        
    try:
        history_list = []
        if request.conversationHistory:
            history_list = [{"role": msg.role, "content": msg.content} for msg in request.conversationHistory]
            
        response = await openrouter_service.generate_response(
            user_message_text=user_text,
            conversation_history=history_list,
            is_clinical_mode=request.isClinicalMode or False,
            session_id=request.sessionId or "default-session",
            requested_model=request.model,
            user_location=request.userLocation,
            document=request.document,
            image=request.image
        )
        return response
    except Exception as e:
        print(f"[API Error] Exception during chat processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/memory/{session_id}")
async def get_session_memory(session_id: str = Path(..., description="Session identifier")):
    memories = rag_service.retrieve_relevant_memory(session_id, query="health symptoms query context", top_k=10)
    return {"sessionId": session_id, "memoryCount": len(memories), "memories": memories}

@app.delete("/api/memory/{session_id}")
async def clear_session_memory(session_id: str = Path(..., description="Session identifier")):
    success = rag_service.clear_memory(session_id)
    return {"sessionId": session_id, "cleared": success}

@app.get("/api/nearby-hospitals", response_model=NearbyHospitalsResponse)
async def nearby_hospitals_endpoint(lat: float, lng: float, radius: int = 10000):
    try:
        return await location_service.get_nearby_hospitals(lat=lat, lng=lng, radius_meters=radius)
    except Exception as e:
        print(f"[API Error] Failed to fetch nearby hospitals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    server_port = int(os.environ.get("PORT", settings.PORT))
    server_host = os.environ.get("HOST", settings.HOST)
    uvicorn.run("main:app", host=server_host, port=server_port, reload=False)
