from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class ChatMessageInput(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class ChatRequest(BaseModel):
    userMessageText: str
    conversationHistory: Optional[List[ChatMessageInput]] = []
    isClinicalMode: Optional[bool] = False
    sessionId: Optional[str] = "default-session"
    model: Optional[str] = None

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

class ChatResponse(BaseModel):
    id: str
    sender: Literal["assistant"] = "assistant"
    timestamp: str
    structuredData: StructuredData
    ragContextUsed: Optional[List[str]] = None
    modelUsed: Optional[str] = None

class HealthStatus(BaseModel):
    status: str
    openrouterKeyConfigured: bool
    primaryModel: str
    fallbackModels: List[str]
    vectorDbStatus: str

class ModelInfo(BaseModel):
    id: str
    name: str
    isFree: bool = True
