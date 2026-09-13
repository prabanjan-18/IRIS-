import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from models.schemas import ChatRequest, ChatResponse, HealthStatus, ModelInfo, NearbyHospitalsResponse
from services.openrouter_service import openrouter_service
from services.rag_service import rag_service
from services.location_service import location_service

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

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.userMessageText or not request.userMessageText.strip():
        raise HTTPException(status_code=400, detail="userMessageText cannot be empty")
        
    try:
        history_list = []
        if request.conversationHistory:
            history_list = [{"role": msg.role, "content": msg.content} for msg in request.conversationHistory]
            
        response = await openrouter_service.generate_response(
            user_message_text=request.userMessageText,
            conversation_history=history_list,
            is_clinical_mode=request.isClinicalMode or False,
            session_id=request.sessionId or "default-session",
            requested_model=request.model,
            user_location=request.userLocation
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
