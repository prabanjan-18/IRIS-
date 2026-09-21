from typing import List, Optional, Literal, Dict
from pydantic import BaseModel, Field

class ChatMessageInput(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class DocumentAttachment(BaseModel):
    filename: str
    fileType: Optional[str] = "Lab Document"
    extractedText: str
    detectedReportType: Optional[str] = None
    pageCount: Optional[int] = 1
    wordCount: Optional[int] = None

class ImageAttachment(BaseModel):
    filename: str
    fileType: Optional[str] = "image/jpeg"
    dataUrl: str # Data URL or base64 string

class ParseDocumentResponse(BaseModel):
    status: str = "success"
    filename: str
    fileType: str
    extractedText: str
    pageCount: int
    wordCount: int
    charCount: int
    preview: str
    detectedReportType: str

class ChatRequest(BaseModel):
    userMessageText: str
    conversationHistory: Optional[List[ChatMessageInput]] = []
    isClinicalMode: Optional[bool] = False
    sessionId: Optional[str] = "default-session"
    model: Optional[str] = None
    userLocation: Optional[Dict[str, float]] = None
    document: Optional[DocumentAttachment] = None
    image: Optional[ImageAttachment] = None

class SourceItem(BaseModel):
    title: str
    url: str
    snippet: str

class StructuredData(BaseModel):
    triageLevel: Literal["self", "caution", "urgent"] = Field(
        ..., description="Triage classification level"
    )
    triageLabel: str = Field(
        ..., description="Short user-facing triage label"
    )
    summary: str = Field(
        ..., description="Detailed clinical or self-care summary response"
    )
    causes: List[str] = Field(
        default_factory=list, description="Potential underlying medical/physiological causes"
    )
    selfCare: List[str] = Field(
        default_factory=list, description="Actionable self-care recommendations"
    )
    whenToSeekCare: List[str] = Field(
        default_factory=list, description="Red-flag symptoms and escalation criteria"
    )
    sources: List[SourceItem] = Field(
        default_factory=list, description="Evidence-based medical references and sources"
    )

class HospitalResult(BaseModel):
    name: str
    address: str
    specialty: Optional[str] = None
    distanceText: Optional[str] = None
    rating: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    placeId: Optional[str] = None
    mapsUrl: str

class ChatResponse(BaseModel):
    id: str
    sender: Literal["assistant"] = "assistant"
    timestamp: str
    text: Optional[str] = None
    reply: Optional[str] = None
    structuredData: Optional[StructuredData] = None
    responseType: Literal["medical", "conversation", "location_request", "hospital_results", "document_analysis", "image_analysis"] = "medical"
    ragContextUsed: Optional[List[str]] = None
    modelUsed: Optional[str] = None
    hospitals: Optional[List[HospitalResult]] = None
    document: Optional[DocumentAttachment] = None
    image: Optional[ImageAttachment] = None

class HealthStatus(BaseModel):
    status: str
    openrouterKeyConfigured: bool
    geminiKeyConfigured: Optional[bool] = False
    primaryModel: str
    fallbackModels: List[str]
    vectorDbStatus: str

class ModelInfo(BaseModel):
    id: str
    name: str
    isFree: bool = True

class HospitalItem(BaseModel):
    name: str
    address: str
    distanceKm: Optional[float] = None
    rating: Optional[float] = None
    userRatingsTotal: Optional[int] = None
    isOpenNow: Optional[bool] = None
    phoneNumber: Optional[str] = None
    isEmergency: bool = False
    googleMapsUrl: str
    facilityType: str = "Hospital"
    lat: Optional[float] = None
    lng: Optional[float] = None

class NearbyHospitalsResponse(BaseModel):
    status: str
    count: int
    source: str
    userLat: float
    userLng: float
    hospitals: List[HospitalItem]

class GoogleUser(BaseModel):
    googleId: str
    email: str
    name: str
    picture: Optional[str] = None

class VerifyTokenRequest(BaseModel):
    token: str

class VerifyTokenResponse(BaseModel):
    user: GoogleUser

class PlacesNearbyRequest(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    query: Optional[str] = "hospital"
    specialty: Optional[str] = None
    radius: Optional[int] = None
    limit: Optional[int] = 5
    is_emergency: bool = False
    area_text: Optional[str] = None

class PlacesNearbyResponse(BaseModel):
    status: str = "ok"
    count: int = 0
    hospitals: List[HospitalResult] = Field(default_factory=list)
    source: str = "places_api"
    center: Optional[Dict[str, float]] = None


