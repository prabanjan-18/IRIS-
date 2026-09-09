import json
import re
import time
import httpx
from typing import Dict, Any, List, Optional
from config import get_settings, settings
from models.schemas import StructuredData, SourceItem, ChatResponse
from utils.prompts import build_system_prompt
from services.rag_service import rag_service

class OpenRouterService:
    def __init__(self):
        pass

    def _clean_json_string(self, text: str) -> str:
        """Strip markdown code blocks ```json ... ``` and leading/trailing whitespace."""
        text = text.strip()
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return text

    def _is_explicit_non_healthcare_query(self, user_text: str) -> bool:
        """Check if the user prompt is explicitly an out-of-domain query
        (e.g., coding/programming, math calculations, sports scores, entertainment, etc.)."""
        text_lower = user_text.lower().strip()
        
        health_and_meta = {
            "health", "medical", "doctor", "hospital", "clinic", "symptom", "pain", "fever",
            "cough", "headache", "rash", "infection", "virus", "bacteria", "disease", "sick",
            "illness", "medicine", "medication", "pill", "drug", "prescription", "dosage",
            "side effect", "blood", "heart", "chest", "lung", "breath", "breathing", "stomach",
            "nausea", "vomit", "diarrhea", "throat", "head", "eye", "ear", "skin", "joint",
            "muscle", "fatigue", "dizzy", "dizziness", "sleep", "diet", "nutrition", "vitamin",
            "exercise", "wellness", "mental", "anxiety", "depression", "stress", "injury",
            "burn", "wound", "bleed", "bleeding", "stroke", "cancer", "diabetes", "asthma",
            "allergy", "allergic", "emergency", "triage", "treatment", "therapy", "cure",
            "diagnosis", "patient", "nurse", "physician", "pediatric", "cardio", "pharma",
            "vaccine", "flu", "covid", "cold", "body", "bones", "liver", "kidney", "brain",
            "blood pressure", "temperature", "pulse", "chills", "ache", "sore", "swelling",
            "hi", "hello", "hey", "who are you", "what can you do", "help", "iris", "thanks"
        }
        
        non_health_triggers = [
            "python", "javascript", "code", "coding", "html", "css", "sql", "java", "c++",
            "programming", "algorithm", "script", "software", "debug", "compile",
            "calculate", "equation", "algebra", "calculus", "capital of", "who won",
            "cricket", "football", "soccer", "nba", "match", "movie", "song", "actor",
            "joke", "recipe", "car engine", "oil change", "politics", "president",
            "stock price", "crypto", "bitcoin"
        ]
        
        has_non_health = any(trigger in text_lower for trigger in non_health_triggers)
        has_health = any(kw in text_lower for kw in health_and_meta)
        
        return has_non_health and not has_health

    def _build_scope_notice_structured_data(self, user_text: str) -> StructuredData:
        """Structured response informing user that IRIS is dedicated to healthcare & medical questions."""
        return StructuredData(
            triageLevel="self",
            triageLabel="IRIS Healthcare & Medical Scope",
            summary=(
                f"Iris is an AI assistant dedicated specifically to medical, clinical, and healthcare-related questions "
                f"(such as symptom evaluation, hospital guidance, medications, and wellness). "
                f"Your query regarding '{user_text.strip()}' appears to be outside my medical scope. "
                f"If you have any health concerns, symptoms, or medical questions, please feel free to ask!"
            ),
            causes=[
                "Query is outside IRIS medical & healthcare domain scope",
                "IRIS is specialized for clinical decision support and patient triage"
            ],
            selfCare=[
                "Ask IRIS about any symptom, pain, fever, or medication concern",
                "Consult IRIS for hospital guidance, triage levels, and self-care steps"
            ],
            whenToSeekCare=[
                "For medical emergencies or acute symptoms, call 911/112 immediately"
            ],
            sources=[
                SourceItem(
                    title="IRIS Healthcare Assistant Scope",
                    url="http://127.0.0.1:8000",
                    snippet="IRIS is dedicated to medical triage, clinical evidence synthesis, and healthcare guidance."
                )
            ]
        )

    def _parse_structured_data(self, raw_content: str, user_text: str, is_clinical: bool) -> StructuredData:
        """Parse raw content from LLM into a validated StructuredData model.
        If JSON parsing fails, the raw LLM text is used directly as the summary
        so the user always sees real LLM output, never generic fallback text.
        """
        try:
            cleaned = self._clean_json_string(raw_content)
            parsed = json.loads(cleaned)
            if isinstance(parsed, str):
                parsed = json.loads(parsed)
            if isinstance(parsed, dict):
                normalized = {}
                normalized["triageLevel"] = parsed.get("triageLevel") or parsed.get("triage_level") or "self"
                if normalized["triageLevel"] not in ["self", "caution", "urgent"]:
                    normalized["triageLevel"] = "self"
                
                normalized["triageLabel"] = parsed.get("triageLabel") or parsed.get("triage_label") or "Self-care may be appropriate"
                normalized["summary"] = parsed.get("summary") or f"Analysis for query: '{user_text}'"
                
                causes = parsed.get("causes") or []
                normalized["causes"] = [str(c) for c in causes] if isinstance(causes, list) else [str(causes)]
                
                self_care = parsed.get("selfCare") or parsed.get("self_care") or []
                normalized["selfCare"] = [str(s) for s in self_care] if isinstance(self_care, list) else [str(self_care)]
                
                seek_care = parsed.get("whenToSeekCare") or parsed.get("when_to_seek_care") or []
                normalized["whenToSeekCare"] = [str(w) for w in seek_care] if isinstance(seek_care, list) else [str(seek_care)]
                
                raw_sources = parsed.get("sources") or []
                valid_sources = []
                if isinstance(raw_sources, list):
                    for item in raw_sources:
                        if isinstance(item, dict):
                            valid_sources.append(SourceItem(
                                title=str(item.get("title", "Medical Reference")),
                                url=str(item.get("url", "https://medlineplus.gov")),
                                snippet=str(item.get("snippet", "Evidence-based health guideline."))
                            ))
                        elif isinstance(item, str):
                            valid_sources.append(SourceItem(
                                title="Medical Reference",
                                url="https://medlineplus.gov",
                                snippet=item
                            ))
                normalized["sources"] = valid_sources if valid_sources else [
                    SourceItem(title="NIH MedlinePlus", url="https://medlineplus.gov", snippet="Trusted consumer health information.")
                ]
                return StructuredData(**normalized)
        except Exception as err:
            print(f"[OpenRouter Service] JSON parse failed ({err}). Using raw LLM text as summary.")
        
        return self._build_raw_llm_structured_data(raw_content, user_text, is_clinical)

    def _build_raw_llm_structured_data(self, raw_content: str, user_text: str, is_clinical: bool) -> StructuredData:
        """When the LLM returns non-JSON text, wrap the raw LLM output into
        a StructuredData card so the user always sees real LLM content."""
        clean_text = raw_content.strip()
        
        text_lower = clean_text.lower()
        if any(kw in text_lower for kw in ["urgent", "emergency", "immediately", "call 911", "seek immediate"]):
            triage_level = "urgent"
            triage_label = "Seek urgent/emergency care"
        elif any(kw in text_lower for kw in ["doctor", "medical attention", "see a doctor", "consult", "appointment"]):
            triage_level = "caution"
            triage_label = "Consider seeing a doctor soon"
        else:
            triage_level = "self"
            triage_label = "Self-care may be appropriate"
        
        return StructuredData(
            triageLevel=triage_level,
            triageLabel=triage_label,
            summary=clean_text,
            causes=[],
            selfCare=[],
            whenToSeekCare=[],
            sources=[
                SourceItem(
                    title="Live AI Model Response",
                    url="https://openrouter.ai",
                    snippet="This response was generated directly by an AI language model via OpenRouter."
                )
            ]
        )

    def _build_fallback_structured_data(self, user_text: str, is_clinical: bool, reason: str = "") -> StructuredData:
        """Generate safe fallback response if OpenRouter call fails or API key is unconfigured."""
        text_lower = user_text.lower()
        
        is_urgent = any(kw in text_lower for kw in ["chest pain", "heart", "short of breath", "breathing", "severe bleed", "stroke"])
        is_caution = any(kw in text_lower for kw in ["fever", "temperature", "flu", "cough", "infection", "vomit"])
        
        if is_urgent:
            return StructuredData(
                triageLevel="urgent",
                triageLabel="Seek urgent/emergency care",
                summary=f"URGENT ALERT: Symptoms related to '{user_text.strip()}' require immediate clinical evaluation to rule out acute emergency conditions.",
                causes=[
                    "Acute Cardiopulmonary / Coronary Syndrome",
                    "Severe Respiratory Distress",
                    "Acute Vascular or Neurological Emergency"
                ],
                selfCare=[
                    "Cease physical exertion immediately and sit upright.",
                    "Call emergency service (911/112) immediately. Do not drive yourself.",
                    "Loosen restrictive clothing."
                ],
                whenToSeekCare=[
                    "SEEK IMMEDIATE EMERGENCY CARE NOW. Radiating chest pain, diaphoresis, or sudden dizziness are critical red flags."
                ],
                sources=[
                    SourceItem(title="American College of Cardiology", url="https://www.acc.org", snippet="Chest discomfort with exertional dyspnea requires immediate emergency triage."),
                    SourceItem(title="Mayo Clinic Emergency Medicine", url="https://www.mayoclinic.org", snippet="Prompt ECG and clinical evaluation are indicated for acute dyspnea.")
                ]
            )
        elif is_caution:
            return StructuredData(
                triageLevel="caution",
                triageLabel="Consider seeing a doctor soon",
                summary="Febrile or respiratory presentation analysis suggests immune activation secondary to viral or bacterial etiology." if is_clinical else f"Your symptoms regarding '{user_text.strip()}' indicate an active immune response (likely viral or bacterial infection).",
                causes=[
                    "Viral Upper Respiratory Infection (Influenza, COVID-19)",
                    "Acute Pharyngitis or Bronchitis",
                    "Systemic inflammatory response"
                ],
                selfCare=[
                    "Maintain continuous oral hydration (water, electrolyte broth).",
                    "Prioritize complete bed rest.",
                    "Use OTC antipyretics (Acetaminophen or Ibuprofen) as medically appropriate."
                ],
                whenToSeekCare=[
                    "Fever exceeds 103°F (39.4°C) or persists > 3 days.",
                    "Stiff neck, confusion, or shortness of breath develops."
                ],
                sources=[
                    SourceItem(title="CDC Adult Health Guidelines", url="https://www.cdc.gov", snippet="Fever >3 days or associated toxic appearance warrants clinical evaluation."),
                    SourceItem(title="NIH MedlinePlus", url="https://medlineplus.gov", snippet="Hydration and rest are essential primary measures for acute viral illness.")
                ]
            )
        else:
            note_reason = f" [Notice: {reason}]" if reason else ""
            summary_text = (
                f"⚠️ [API Key Required to Connect Live LLM] To receive live responses from OpenRouter models (Gemma, GLM, Llama, etc.), please set your OPENROUTER_API_KEY in backend/.env.{note_reason}"
                if "API Key" in reason
                else f"Here is structured guidance regarding '{user_text.strip()}': Most mild symptoms improve with rest, proper hydration, and simple self-care{note_reason}."
            )
            return StructuredData(
                triageLevel="self",
                triageLabel="OpenRouter API Key Required" if "API Key" in reason else "Self-care may be appropriate",
                summary=summary_text,
                causes=[
                    "OPENROUTER_API_KEY is currently set to placeholder in backend/.env",
                    "OpenRouter API endpoints require authentication to generate live completions",
                    "Local offline rule engine active as fallback"
                ] if "API Key" in reason else [
                    "Mild muscular strain or transient physiological disruption",
                    "Lifestyle factors (fatigue, mild dehydration, stress)",
                    "Early self-limiting immune reaction"
                ],
                selfCare=[
                    "Open https://openrouter.ai/keys to create a free API key",
                    "Copy your API key (e.g. sk-or-v1-...)",
                    "Paste it into OPENROUTER_API_KEY inside c:\\IRIS\\backend\\.env"
                ] if "API Key" in reason else [
                    "Maintain good hydration and balanced nutrition",
                    "Ensure 7-8 hours of restful sleep",
                    "Monitor symptoms over the next 24-48 hours"
                ],
                whenToSeekCare=[
                    "Get your free key at https://openrouter.ai/keys",
                    "Restart backend server or send prompt again after saving key"
                ] if "API Key" in reason else [
                    "If symptoms worsen or fail to improve after 3 to 5 days",
                    "If severe pain, high fever, or unexpected weakness develops"
                ],
                sources=[
                    SourceItem(title="OpenRouter API Keys Dashboard", url="https://openrouter.ai/keys", snippet="Create free API key to enable live model inference."),
                    SourceItem(title="IRIS Backend Config Documentation", url="file:///c:/IRIS/backend/.env", snippet="Backend environment file where OPENROUTER_API_KEY is configured.")
                ]
            )

    async def generate_response(
        self,
        user_message_text: str,
        conversation_history: List[Dict[str, str]] = None,
        is_clinical_mode: bool = False,
        session_id: str = "default-session",
        requested_model: Optional[str] = None
    ) -> ChatResponse:
        
        # 0. Check if query is explicitly non-healthcare related
        if self._is_explicit_non_healthcare_query(user_message_text):
            print(f"[OpenRouter Service] Non-healthcare query detected: '{user_message_text}'. Returning Iris domain scope notice.")
            scope_response = self._build_scope_notice_structured_data(user_message_text)
            
            # Save turn to RAG memory for conversation continuity
            rag_service.add_to_memory(session_id, "user", user_message_text)
            rag_service.add_to_memory(session_id, "assistant", scope_response.summary)
            
            return ChatResponse(
                id=f"msg-{int(time.time()*1000)}",
                sender="assistant",
                timestamp=time.strftime("%I:%M %p"),
                structuredData=scope_response,
                ragContextUsed=[],
                modelUsed="iris-domain-guardrail"
            )

        # 1. RAG Retrieval: Get relevant past context
        rag_chunks = rag_service.retrieve_relevant_memory(session_id, user_message_text, top_k=settings.MAX_RAG_CONTEXT_TURNS)
        
        # 2. Save current user message to RAG memory
        rag_service.add_to_memory(session_id, "user", user_message_text)

        # 3. Build system prompt
        system_prompt = build_system_prompt(rag_chunks, is_clinical_mode)

        # Build LLM messages array
        messages = [{"role": "system", "content": system_prompt}]
        
        if conversation_history:
            for turn in conversation_history[-6:]:
                role = turn.get("role", "user")
                content = turn.get("content", "")
                if content and role in ["user", "assistant"]:
                    messages.append({"role": role, "content": content})
                    
        messages.append({"role": "user", "content": user_message_text})

        current_settings = get_settings()
        
        candidate_models = []
        if requested_model:
            candidate_models.append(requested_model)
        if current_settings.OPENROUTER_PRIMARY_MODEL and current_settings.OPENROUTER_PRIMARY_MODEL not in candidate_models:
            candidate_models.append(current_settings.OPENROUTER_PRIMARY_MODEL)
        for fallback in current_settings.fallback_models_list:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        api_key = current_settings.OPENROUTER_API_KEY.strip()
        has_valid_key = api_key and api_key != "your_openrouter_api_key_here"
        api_url = f"{current_settings.OPENROUTER_BASE_URL.rstrip('/')}/chat/completions"

        structured_data: Optional[StructuredData] = None
        model_used: str = "fallback-rules-engine"

        if has_valid_key:
            referer = current_settings.FRONTEND_URL if current_settings.FRONTEND_URL else "https://openrouter.ai"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": referer,
                "X-Title": "IRIS Health Assistant",
                "Content-Type": "application/json"
            }

            async with httpx.AsyncClient(timeout=45.0) as client:
                for model_name in candidate_models:
                    try:
                        print(f"[OpenRouter Service] Sending prompt to model: {model_name} via {api_url}...")
                        payload = {
                            "model": model_name,
                            "messages": messages,
                            "temperature": 0.2
                        }
                        
                        response = await client.post(api_url, headers=headers, json=payload)
                        if response.status_code == 200:
                            res_json = response.json()
                            if "choices" in res_json and len(res_json["choices"]) > 0:
                                raw_content = res_json["choices"][0]["message"]["content"]
                                structured_data = self._parse_structured_data(raw_content, user_message_text, is_clinical_mode)
                                model_used = model_name
                                print(f"[OpenRouter Service] Successfully received LLM response from '{model_name}'.")
                                break
                        else:
                            print(f"[OpenRouter Service] Model '{model_name}' returned status {response.status_code}: {response.text}")
                    except Exception as e:
                        print(f"[OpenRouter Service] Exception calling OpenRouter model '{model_name}': {e}")
                        continue

        if not structured_data:
            reason_msg = "API Key not set in .env" if not has_valid_key else "OpenRouter free models temporarily busy"
            print(f"[OpenRouter Service] Using fallback rule engine ({reason_msg}).")
            structured_data = self._build_fallback_structured_data(user_message_text, is_clinical_mode, reason=reason_msg)

        # 4. Store assistant response summary in RAG memory for future recall
        rag_service.add_to_memory(session_id, "assistant", structured_data.summary)

        return ChatResponse(
            id=f"msg-{int(time.time()*1000)}",
            sender="assistant",
            timestamp=time.strftime("%I:%M %p"),
            structuredData=structured_data,
            ragContextUsed=rag_chunks,
            modelUsed=model_used
        )

openrouter_service = OpenRouterService()
