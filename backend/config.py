import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    OPENROUTER_API_KEY: str = "your_openrouter_api_key_here"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_PRIMARY_MODEL: str = "openrouter/free"
    
    # Active Verified Free Models
    MODEL_OPENROUTER_FREE: str = "openrouter/free"
    MODEL_MINIMAX_M3: str = "minimax/minimax-m3:free"
    MODEL_NEMOTRON_LIGHTNING: str = "nvidia/nemotron-3.5-lightning:free"
    MODEL_NEMOTRON_SUPER: str = "nvidia/nemotron-3-super-120b-a12b:free"
    MODEL_LFM_2_5: str = "liquid/lfm-2.5-2.6b:free"
    MODEL_GEMMA_4_31B: str = "google/gemma-4-31b-it:free"
    MODEL_GEMMA_4_26B: str = "google/gemma-4-26b-a4b-it:free"
    MODEL_GLM_5_2: str = "z-ai/glm-5.2:free"
    MODEL_MINIMAX_M2_7: str = "minimax/minimax-m2.7:free"
    MODEL_NEMOTRON_NANO: str = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
    MODEL_LING_3_0: str = "inclusionai/ling-3.0-flash-fin:free"
    MODEL_DOTS_3: str = "dots-studio/dots-3-note-preview:free"

    HOST: str = "127.0.0.1"
    PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    VECTOR_DB_DIR: str = "./chroma_db"
    MAX_RAG_CONTEXT_TURNS: int = 4

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def all_models_list(self) -> List[str]:
        models = [
            self.OPENROUTER_PRIMARY_MODEL,
            self.MODEL_OPENROUTER_FREE,
            self.MODEL_MINIMAX_M3,
            self.MODEL_NEMOTRON_LIGHTNING,
            self.MODEL_NEMOTRON_SUPER,
            self.MODEL_LFM_2_5,
            self.MODEL_GEMMA_4_31B,
            self.MODEL_GEMMA_4_26B,
            self.MODEL_GLM_5_2,
            self.MODEL_MINIMAX_M2_7,
            self.MODEL_NEMOTRON_NANO,
            self.MODEL_LING_3_0,
            self.MODEL_DOTS_3
        ]
        # Return unique models list maintaining order
        seen = set()
        res = []
        for m in models:
            if m and m not in seen:
                seen.add(m)
                res.append(m)
        return res

    @property
    def fallback_models_list(self) -> List[str]:
        return [m for m in self.all_models_list if m != self.OPENROUTER_PRIMARY_MODEL]

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

def get_settings() -> Settings:
    return Settings()

settings = Settings()

