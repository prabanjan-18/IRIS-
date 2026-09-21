import re
import time
import asyncio
import httpx
from typing import Dict, Any, List, Optional
from config import get_settings, settings
from models.schemas import ChatResponse, HospitalResult, DocumentAttachment, ImageAttachment
from utils.prompts import (
    build_system_prompt,
    build_conversational_prompt,
    build_classifier_prompt,
    build_hospital_intro_prompt,
    build_document_analysis_prompt,
    build_image_analysis_prompt
)
from services.rag_service import rag_service
from services.location_service import location_service

class OpenRouterService:
    def __init__(self):
        # Medical keywords for fast-path intent classification
        self._medical_keywords = {
            "symptom", "symptoms", "pain", "fever", "cough", "headache", "rash", "infection",
            "virus", "bacteria", "disease", "sick", "illness", "medicine", "medication",
            "pill", "drug", "prescription", "dosage", "side effect", "side effects",
            "blood", "heart", "chest", "lung", "breath", "breathing", "stomach",
            "nausea", "vomit", "vomiting", "diarrhea", "throat", "sore throat",
            "eye pain", "ear pain", "skin", "joint", "muscle", "fatigue", "dizzy",
            "dizziness", "insomnia", "sleep problem", "diet", "nutrition", "vitamin",
            "supplement", "wellness", "mental health", "anxiety", "depression", "stress",
            "injury", "burn", "wound", "bleed", "bleeding", "stroke", "cancer", "diabetes",
            "asthma", "allergy", "allergic", "allergies", "emergency", "triage", "treatment",
            "therapy", "cure", "diagnosis", "diagnose", "patient", "nurse", "physician",
            "pediatric", "cardio", "pharma", "vaccine", "vaccination", "flu", "covid",
            "cold symptoms", "body ache", "body aches", "bones", "liver", "kidney", "brain",
            "blood pressure", "temperature", "pulse", "chills", "ache", "swelling", "swollen",
            "pregnant", "pregnancy", "period", "menstrual", "cholesterol", "obesity",
            "weight loss", "weight gain", "bmi", "calories", "hospital", "clinic", "doctor",
            "urgent care", "er visit", "medical", "health", "healthcare", "ibuprofen",
            "acetaminophen", "tylenol", "advil", "antibiotic", "antiviral", "inhaler",
            "epipen", "insulin", "bandage", "fracture", "sprain", "concussion",
            "food poisoning", "dehydration", "sunburn", "frostbite", "bite", "sting",
            "shortness of breath", "chest pain", "heart attack", "seizure", "faint",
            "unconscious", "overdose", "poison", "surgery", "operation", "x-ray", "mri",
            "ct scan", "ultrasound", "lab test", "blood test", "urine test"
        }

        # Location keywords for nearby hospital/clinic finder
        self._location_keywords = [
            "hospital near", "hospitals near", "nearby hospital", "nearby hospitals",
            "nearest hospital", "nearest er", "nearest emergency", "nearest clinic",
            "find hospital", "find clinic", "find a hospital", "find a clinic",
            "emergency room near", "urgent care near", "clinic near", "clinics near",
            "where to go for", "where should i go", "hospital to visit",
            "hospitals to visit", "hospital around", "hospitals around",
            "nearby er", "nearby emergency room", "nearby urgent care",
            "find me a hospital", "find me a clinic", "find me a doctor",
            "find nearby", "locate hospital", "locate clinic",
            "medical facility near", "healthcare near", "health center near",
            "pharmacy near", "nearest pharmacy", "nearby pharmacy",
            "doctor near", "doctors near", "nearest doctor"
        ]

        # Chat keywords for fast-path (clear non-medical)
        self._chat_keywords = {
            "hi", "hello", "hey", "howdy", "good morning", "good afternoon", "good evening",
            "good night", "bye", "goodbye", "see you", "thanks", "thank you", "thx",
            "who are you", "what are you", "what can you do", "what is your name",
            "your name", "tell me about yourself", "how are you", "whats up", "what's up",
            "tell me a joke", "joke", "fun fact", "interesting fact",
            "nice to meet you", "pleased to meet", "i need help", "help me",
            "ok", "okay", "sure", "yes", "no", "yeah", "nah", "cool", "great",
            "awesome", "wow", "lol", "haha", "hmm", "oh", "ah",
            "what time", "weather", "news", "recommend", "suggest",
            "favorite", "favourite", "opinion", "think about"
        }

    def _classify_intent_fast(self, user_text: str) -> Optional[str]:
        """Fast keyword/regex-based intent classification.
        Returns 'direct_location', 'hospital_recommendation', 'location', 'medical', 'chat', or None (ambiguous)."""
        text_lower = user_text.lower().strip()
        word_count = len(text_lower.split())

        # 1. Direct Location Lookup: Asking for a specific named hospital
        direct_patterns = [
            r"\bwhere\s+is\s+(?:the\s+)?([a-z0-9\s]+(?:hospital|clinic|medical\s+center|infirmary|sanatorium))",
            r"\bfind\s+(?:the\s+)?([a-z0-9\s]+(?:hospital|clinic|medical\s+center))\s*(?:near\s+me|nearby)?",
            r"\blocation\s+of\s+(?:the\s+)?([a-z0-9\s]+(?:hospital|clinic|medical\s+center))",
            r"\bwhere\s+is\s+([a-z0-9\s]+(?:hospital|clinic))\b"
        ]
        for pat in direct_patterns:
            if re.search(pat, text_lower):
                return "direct_location"

        # 2. Recommendation Lookup: Asking for best/recommended hospitals for a condition or specialty
        rec_patterns = [
            r"\bbest\s+hospital[s]?\s+for\b",
            r"\btop\s+hospital[s]?\s+for\b",
            r"\bwhich\s+hospital\s+should\s+i\s+go\s+to\b",
            r"\bhospital[s]?\s+for\s+[a-z\s]+(?:near\s+me|in\b)",
            r"\b[a-z]+\s+hospital[s]?\s+near\s+me\b",
            r"\bwhere\s+should\s+i\s+go\s+for\s+(?:a\s+|an\s+)?[a-z]+",
            r"\bwhere\s+to\s+go\s+for\s+(?:a\s+|an\s+)?[a-z]+"
        ]
        for pat in rec_patterns:
            if re.search(pat, text_lower):
                return "hospital_recommendation"

        # 3. General Location Queries (Hospital / Clinic finder)
        for kw in self._location_keywords:
            if kw in text_lower:
                return "location"

        location_indicators = ["near me", "nearby", "closest", "nearest", "around me", "around here", "close to me", "visit near", "in my area", "to visit near"]
        facility_indicators = ["hospital", "hospitals", "clinic", "clinics", "er", "emergency room", "doctor", "doctors", "urgent care", "medical center", "healthcare center", "pharmacy", "pharmacies"]
        if any(loc in text_lower for loc in location_indicators) and any(fac in text_lower for fac in facility_indicators):
            return "location"
        
        # Check for medical keywords (multi-word first, then single-word)
        has_medical = False
        for kw in self._medical_keywords:
            if kw in text_lower:
                has_medical = True
                break
        
        # Check for chat keywords
        has_chat = False
        for kw in self._chat_keywords:
            if kw in text_lower:
                has_chat = True
                break

        # Clear medical signal
        if has_medical and not has_chat:
            return "medical"
        
        # Clear chat signal with no medical overlap
        if has_chat and not has_medical:
            return "chat"
        
        # Very short messages without medical keywords are likely chat
        if word_count <= 3 and not has_medical:
            return "chat"
        
        # Both signals present or neither — ambiguous, need LLM classifier
        return None

    def _is_gemini_model(self, model_name: Optional[str]) -> bool:
        if not model_name:
            return False
        name = model_name.lower()
        return "gemini-3.8" in name or name in ["gemini-3.8-flash", "google/gemini-3.8-flash"]

    async def _classify_intent_llm(self, user_text: str, api_key: str, api_url: str, model: str, referer: str) -> str:
        """Use LLM to classify ambiguous messages.
        Returns 'direct_location', 'hospital_recommendation', 'location', 'medical', or 'chat'."""
        classifier_prompt = build_classifier_prompt(user_text)
        
        messages = [
            {"role": "user", "content": classifier_prompt}
        ]
        
        current_settings = get_settings()
        gemini_api_key = current_settings.GEMINI_API_KEY.strip()
        is_gemini = self._is_gemini_model(model) or (not api_key and gemini_api_key)

        if is_gemini and gemini_api_key:
            target_url = f"{current_settings.GEMINI_BASE_URL.rstrip('/')}/chat/completions"
            headers = {
                "Authorization": f"Bearer {gemini_api_key}",
                "Content-Type": "application/json"
            }
            target_model = "gemini-3.1-flash-lite"
        else:
            target_url = api_url
            headers = {
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": referer,
                "X-Title": "IRIS Health Assistant",
                "Content-Type": "application/json"
            }
            target_model = model
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                payload = {
                    "model": target_model,
                    "messages": messages,
                    "temperature": 0.0,
                    "max_tokens": 10
                }
                response = await client.post(target_url, headers=headers, json=payload)
                if response.status_code == 200:
                    res_json = response.json()
                    if "choices" in res_json and len(res_json["choices"]) > 0:
                        msg_obj = res_json["choices"][0].get("message", {})
                        raw_content = msg_obj.get("content") or ""
                        result = raw_content.strip().lower()
                        # Extract classification word
                        if "direct_location" in result:
                            return "direct_location"
                        elif "hospital_recommendation" in result:
                            return "hospital_recommendation"
                        elif "location" in result:
                            return "location"
                        elif "medical" in result:
                            return "medical"
                        elif "chat" in result:
                            return "chat"
        except Exception as e:
            print(f"[Intent Classifier] LLM classification failed: {e}")
        
        # Default to medical to be safe — never miss a health query
        return "medical"

    def _build_fallback_text(self, user_text: str, has_valid_key: bool) -> str:
        """Return a prose fallback when AI models are unavailable."""
        if not has_valid_key:
            return (
                "⚠️ **API Key Required**\n\n"
                "To get live AI responses from Iris, please add your Gemini or OpenRouter API key to `backend/.env`:\n\n"
                "1. Add your Google Gemini API key as `GEMINI_API_KEY=...` in `c:\\IRIS\\backend\\.env`\n"
                "2. Or add your OpenRouter API key as `OPENROUTER_API_KEY=...`\n"
                "3. Restart the backend server\n"
            )
        text_lower = user_text.lower()
        if any(kw in text_lower for kw in ["chest pain", "heart attack", "stroke", "short of breath", "can't breathe", "unconscious"]):
            return (
                "<!--triage:urgent-->\n\n"
                "This sounds like it could be a serious medical emergency. Please **call emergency services (911/112) immediately** "
                "rather than relying on this assistant.\n\n"
                "Do not delay seeking help — time is critical in cardiac and respiratory emergencies."
            )
        return (
            f"I'm having trouble reaching the AI models right now. For your question about *{user_text.strip()[:80]}*, "
            "please try again in a moment, or consult a qualified healthcare professional for personalized advice."
        )

    def _placeholder_removed_json_pipeline(self):
        # Medical responses return adaptive Markdown text directly.
        pass

    async def _call_llm(self, messages: list, api_key: str, api_url: str, candidate_models: list, referer: str, temperature: float = 0.2, max_tokens: int = None) -> tuple:
        """Call LLM with model fallback chain. Handles Google Gemini 3.8 Flash and OpenRouter models."""
        current_settings = get_settings()
        gemini_api_key = current_settings.GEMINI_API_KEY.strip()
        gemini_endpoint = f"{current_settings.GEMINI_BASE_URL.rstrip('/')}/chat/completions"

        gemini_flash_submodels = [
            "gemini-3.1-flash-lite",
            "gemini-3-flash-preview",
            "gemini-flash-latest",
            "gemini-2.5-flash-lite"
        ]

        async with httpx.AsyncClient(timeout=45.0) as client:
            for model_name in candidate_models:
                try:
                    is_gemini = self._is_gemini_model(model_name)
                    if is_gemini:
                        if not gemini_api_key or gemini_api_key == "your_gemini_api_key_here":
                            print(f"[LLM Service] Gemini API key not configured, skipping {model_name}.")
                            continue

                        # Try available Gemini Flash models in order
                        for submodel in gemini_flash_submodels:
                            # 1. Try OpenAI-compatible endpoint
                            try:
                                target_headers = {
                                    "Authorization": f"Bearer {gemini_api_key}",
                                    "Content-Type": "application/json"
                                }
                                payload = {
                                    "model": submodel,
                                    "messages": messages,
                                    "temperature": temperature
                                }
                                if max_tokens:
                                    payload["max_tokens"] = max_tokens

                                print(f"[LLM Service] Sending prompt to Google Gemini model '{submodel}' via {gemini_endpoint}...")
                                response = await client.post(gemini_endpoint, headers=target_headers, json=payload)
                                if response.status_code == 200:
                                    res_json = response.json()
                                    if "choices" in res_json and len(res_json["choices"]) > 0:
                                        raw_content = res_json["choices"][0]["message"]["content"]
                                        print(f"[LLM Service] Successfully received LLM response from Gemini '{submodel}'.")
                                        return raw_content, "Gemini 3.8 Flash"
                                elif response.status_code in [503, 404, 429]:
                                    print(f"[LLM Service] Gemini submodel '{submodel}' unavailable ({response.status_code}), trying next submodel...")
                                else:
                                    print(f"[LLM Service] Gemini submodel '{submodel}' returned {response.status_code}: {response.text[:150]}")
                            except Exception as ge:
                                print(f"[LLM Service] OpenAI-proxy exception on {submodel}: {ge}")

                            # 2. Try native generateContent endpoint
                            try:
                                native_url = f"https://generativelanguage.googleapis.com/v1beta/models/{submodel}:generateContent?key={gemini_api_key}"
                                sys_parts = []
                                gemini_contents = []
                                for msg in messages:
                                    role = msg.get("role")
                                    content = msg.get("content")
                                    if role == "system" and isinstance(content, str):
                                        sys_parts.append({"text": content})
                                    elif role in ["user", "assistant"]:
                                        g_role = "user" if role == "user" else "model"
                                        if isinstance(content, str):
                                            gemini_contents.append({"role": g_role, "parts": [{"text": content}]})
                                        elif isinstance(content, list):
                                            c_parts = []
                                            for p in content:
                                                if p.get("type") == "text":
                                                    c_parts.append({"text": p.get("text", "")})
                                                elif p.get("type") == "image_url":
                                                    img_url = p.get("image_url", {}).get("url", "")
                                                    if "," in img_url:
                                                        h, b64 = img_url.split(",", 1)
                                                        mime = h.split(";")[0].replace("data:", "")
                                                    else:
                                                        mime, b64 = "image/jpeg", img_url
                                                    c_parts.append({"inline_data": {"mime_type": mime, "data": b64}})
                                            gemini_contents.append({"role": g_role, "parts": c_parts})

                                native_payload = {
                                    "contents": gemini_contents,
                                    "generationConfig": {"temperature": temperature}
                                }
                                if sys_parts:
                                    native_payload["system_instruction"] = {"parts": sys_parts}
                                if max_tokens:
                                    native_payload["generationConfig"]["maxOutputTokens"] = max_tokens

                                n_resp = await client.post(native_url, json=native_payload, timeout=45.0)
                                if n_resp.status_code == 200:
                                    n_json = n_resp.json()
                                    candidates = n_json.get("candidates", [])
                                    if candidates:
                                        parts = candidates[0].get("content", {}).get("parts", [])
                                        if parts and "text" in parts[0]:
                                            native_text = parts[0]["text"]
                                            print(f"[LLM Service] Successfully received LLM response from native Gemini '{submodel}'.")
                                            return native_text, "Gemini 3.8 Flash"
                            except Exception as ne:
                                print(f"[LLM Service] Native Gemini exception on {submodel}: {ne}")

                        # If all Gemini models failed, fall through to OpenRouter candidate models
                        print("[LLM Service] All Gemini Flash endpoints exhausted, falling back to next candidate model...")
                        continue

                    else:
                        # OpenRouter model
                        if not api_key or api_key == "your_openrouter_api_key_here":
                            print(f"[LLM Service] OpenRouter API key not configured, skipping {model_name}.")
                            continue
                        target_url = api_url
                        target_headers = {
                            "Authorization": f"Bearer {api_key}",
                            "HTTP-Referer": referer,
                            "X-Title": "IRIS Health Assistant",
                            "Content-Type": "application/json"
                        }
                        target_model = model_name
                        print(f"[LLM Service] Sending prompt to OpenRouter model: {model_name} via {target_url}...")

                        payload = {
                            "model": target_model,
                            "messages": messages,
                            "temperature": temperature
                        }
                        if max_tokens:
                            payload["max_tokens"] = max_tokens

                        response = await client.post(target_url, headers=target_headers, json=payload)
                        if response.status_code == 200:
                            res_json = response.json()
                            if "choices" in res_json and len(res_json["choices"]) > 0:
                                raw_content = res_json["choices"][0]["message"]["content"]
                                print(f"[LLM Service] Successfully received LLM response from '{model_name}'.")
                                return raw_content, model_name
                        else:
                            print(f"[LLM Service] OpenRouter model '{model_name}' returned status {response.status_code}: {response.text[:150]}")

                except Exception as e:
                    print(f"[LLM Service] Exception calling model '{model_name}': {e}")
                    continue
        
        return None, None

    async def generate_response(
        self,
        user_message_text: str,
        conversation_history: List[Dict[str, str]] = None,
        is_clinical_mode: bool = False,
        session_id: str = "default-session",
        requested_model: Optional[str] = None,
        user_location: Optional[Dict[str, float]] = None,
        document: Optional[DocumentAttachment] = None,
        image: Optional[ImageAttachment] = None
    ) -> ChatResponse:
        
        current_settings = get_settings()
        api_key = current_settings.OPENROUTER_API_KEY.strip()
        gemini_api_key = current_settings.GEMINI_API_KEY.strip()
        has_valid_key = (
            (bool(api_key) and api_key != "your_openrouter_api_key_here") or
            (bool(gemini_api_key) and gemini_api_key != "your_gemini_api_key_here")
        )
        api_url = f"{current_settings.OPENROUTER_BASE_URL.rstrip('/')}/chat/completions"
        referer = current_settings.FRONTEND_URL if current_settings.FRONTEND_URL else "https://openrouter.ai"

        # Build candidate model list
        candidate_models = []
        if requested_model:
            candidate_models.append(requested_model)
        if current_settings.MODEL_GEMINI_3_8_FLASH and current_settings.MODEL_GEMINI_3_8_FLASH not in candidate_models:
            candidate_models.append(current_settings.MODEL_GEMINI_3_8_FLASH)
        if current_settings.OPENROUTER_PRIMARY_MODEL and current_settings.OPENROUTER_PRIMARY_MODEL not in candidate_models:
            candidate_models.append(current_settings.OPENROUTER_PRIMARY_MODEL)
        for fallback in current_settings.fallback_models_list:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        # ──────────────────────────────────────────────
        # STEP 0: DOCUMENT / LAB REPORT ANALYSIS MODE
        # ──────────────────────────────────────────────
        if document and document.extractedText and document.extractedText.strip():
            print(f"[OpenRouter Service] Processing document analysis for: '{document.filename}' ({document.detectedReportType})")
            rag_chunks = rag_service.retrieve_relevant_memory(
                session_id,
                f"{document.detectedReportType or 'Lab Report'} {user_message_text}",
                top_k=settings.MAX_RAG_CONTEXT_TURNS
            )
            rag_service.add_to_memory(
                session_id,
                "user",
                f"[Uploaded {document.filename} ({document.detectedReportType or 'Report'})]: {user_message_text}"
            )

            system_prompt = build_document_analysis_prompt(
                filename=document.filename,
                detected_type=document.detectedReportType or document.fileType or "Medical Report",
                document_text=document.extractedText,
                rag_chunks=rag_chunks,
                is_clinical_mode=is_clinical_mode
            )

            messages = [{"role": "system", "content": system_prompt}]
            if conversation_history:
                for turn in conversation_history[-4:]:
                    role = turn.get("role", "user")
                    content = turn.get("content", "")
                    if content and role in ["user", "assistant"]:
                        messages.append({"role": role, "content": content})

            user_query = user_message_text.strip() if user_message_text and user_message_text.strip() else "Please thoroughly review and interpret my attached lab report / document."
            messages.append({"role": "user", "content": user_query})

            if has_valid_key:
                doc_candidates = list(candidate_models)
                if gemini_api_key and gemini_api_key != "your_gemini_api_key_here" and "google/gemini-3.8-flash" not in doc_candidates:
                    doc_candidates.insert(0, "google/gemini-3.8-flash")
                raw_content, model_used = await self._call_llm(
                    messages, api_key, api_url, doc_candidates, referer, temperature=0.2
                )
                if raw_content:
                    reply_text = raw_content.strip()
                    rag_service.add_to_memory(session_id, "assistant", reply_text[:600])
                    return ChatResponse(
                        id=f"msg-{int(time.time()*1000)}",
                        sender="assistant",
                        timestamp=time.strftime("%I:%M %p"),
                        text=reply_text,
                        reply=reply_text,
                        responseType="document_analysis",
                        ragContextUsed=rag_chunks,
                        modelUsed=model_used,
                        document=document
                    )

            # Fallback if API key missing or LLM call fails
            fallback_text = (
                f"### Document Analysis: {document.filename}\n\n"
                f"**Report Type Detected:** {document.detectedReportType or 'Medical Document'}\n"
                f"**Extracted Content:** {document.wordCount or len(document.extractedText.split())} words, {document.pageCount or 1} page(s)\n\n"
                "To get live clinical AI interpretation, biomarker tables, and parameter analysis of your lab report, "
                "please ensure your OpenRouter API key is configured in `backend/.env`.\n\n"
                "**Preview of extracted content:**\n"
                f"> {document.extractedText[:300].strip()}...\n\n"
                "⚠️ *Always review laboratory findings and clinical reports directly with your healthcare provider.*"
            )
            rag_service.add_to_memory(session_id, "assistant", fallback_text[:500])
            return ChatResponse(
                id=f"msg-{int(time.time()*1000)}",
                sender="assistant",
                timestamp=time.strftime("%I:%M %p"),
                text=fallback_text,
                reply=fallback_text,
                responseType="document_analysis",
                ragContextUsed=rag_chunks,
                modelUsed="fallback-document-parser",
                document=document
            )

        # ──────────────────────────────────────────────
        # STEP 0b: IMAGE / SCREENSHOT ANALYSIS MODE
        # ──────────────────────────────────────────────
        if image and image.dataUrl and image.dataUrl.strip():
            print(f"[OpenRouter Service] Processing image / screenshot analysis for: '{image.filename}' ({image.fileType})")
            
            # Prioritize vision-capable models
            vision_candidates = []
            if self._is_gemini_model(requested_model) or (gemini_api_key and gemini_api_key != "your_gemini_api_key_here"):
                vision_candidates.append("google/gemini-3.8-flash")
            for vm in current_settings.vision_models_list:
                if vm not in vision_candidates:
                    vision_candidates.append(vm)
            if requested_model and requested_model not in vision_candidates:
                vision_candidates.append(requested_model)
            for m in candidate_models:
                if m not in vision_candidates:
                    vision_candidates.append(m)

            user_query = user_message_text.strip() if user_message_text and user_message_text.strip() else "Please thoroughly inspect and analyze this uploaded image or screenshot. Detail your observations, clinical findings, and recommendations."

            rag_chunks = rag_service.retrieve_relevant_memory(
                session_id,
                f"Medical image screenshot {image.filename} {user_query}",
                top_k=settings.MAX_RAG_CONTEXT_TURNS
            )
            rag_service.add_to_memory(
                session_id,
                "user",
                f"[Uploaded Image: {image.filename}]: {user_query}"
            )

            system_prompt = build_image_analysis_prompt(
                filename=image.filename,
                image_type=image.fileType or "Medical Image / Screenshot",
                rag_chunks=rag_chunks,
                is_clinical_mode=is_clinical_mode
            )

            messages = [{"role": "system", "content": system_prompt}]
            if conversation_history:
                for turn in conversation_history[-4:]:
                    role = turn.get("role", "user")
                    content = turn.get("content", "")
                    if content and role in ["user", "assistant"] and isinstance(content, str):
                        messages.append({"role": role, "content": content})

            # Multimodal user message containing text and image_url
            multimodal_user_content = [
                {"type": "text", "text": user_query},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": image.dataUrl
                    }
                }
            ]
            messages.append({"role": "user", "content": multimodal_user_content})

            if has_valid_key:
                raw_content, model_used = await self._call_llm(
                    messages, api_key, api_url, vision_candidates, referer, temperature=0.2
                )
                if raw_content:
                    reply_text = raw_content.strip()
                    rag_service.add_to_memory(session_id, "assistant", reply_text[:600])
                    return ChatResponse(
                        id=f"msg-{int(time.time()*1000)}",
                        sender="assistant",
                        timestamp=time.strftime("%I:%M %p"),
                        text=reply_text,
                        reply=reply_text,
                        responseType="image_analysis",
                        ragContextUsed=rag_chunks,
                        modelUsed=model_used,
                        image=image
                    )

            # Fallback if API key missing or LLM call fails
            fallback_text = (
                f"### Image Analysis: {image.filename}\n\n"
                f"**File:** {image.filename} ({image.fileType or 'Image'})\n\n"
                "I received your uploaded image/screenshot. To enable live multimodal AI image analysis, visual inspection, "
                "and clinical differential reporting, please ensure a valid OpenRouter API key is configured in `backend/.env`.\n\n"
                "⚠️ *Digital photos and screenshots should always be reviewed directly with a licensed physician or specialist for diagnostic accuracy.*"
            )
            rag_service.add_to_memory(session_id, "assistant", fallback_text[:500])
            return ChatResponse(
                id=f"msg-{int(time.time()*1000)}",
                sender="assistant",
                timestamp=time.strftime("%I:%M %p"),
                text=fallback_text,
                reply=fallback_text,
                responseType="image_analysis",
                ragContextUsed=rag_chunks,
                modelUsed="fallback-image-analyzer",
                image=image
            )

        # ──────────────────────────────────────────────
        # STEP 1: CLASSIFY INTENT
        # ──────────────────────────────────────────────
        intent = self._classify_intent_fast(user_message_text)
        
        if intent is None and has_valid_key:
            # Ambiguous — use LLM classifier
            print(f"[Intent Classifier] Ambiguous query, using LLM classifier for: '{user_message_text}'")
            classifier_model = candidate_models[0] if candidate_models else "openrouter/free"
            intent = await self._classify_intent_llm(user_message_text, api_key, api_url, classifier_model, referer)
        elif intent is None:
            # No API key and ambiguous — default to chat for general feel
            intent = "chat"
        
        print(f"[Intent Classifier] Query classified as: '{intent}' for message: '{user_message_text[:60]}...'")

        # ──────────────────────────────────────────────
        # STEP 1b: HOSPITAL LOCATION / RECOMMENDATION MODE
        # ──────────────────────────────────────────────
        if intent in ["direct_location", "hospital_recommendation", "location"]:
            user_lat = user_location.get("lat") if user_location else None
            user_lng = user_location.get("lng") if user_location else None

            specialty, hospitals, loc_label = await location_service.resolve_hospital_query(
                query_type=intent,
                user_text=user_message_text,
                user_lat=user_lat,
                user_lng=user_lng
            )

            rag_service.add_to_memory(session_id, "user", user_message_text)

            # Case A: Hospital(s) resolved
            if hospitals and len(hospitals) > 0:
                intro_text = None
                if has_valid_key:
                    try:
                        intro_prompt = build_hospital_intro_prompt(
                            user_query=user_message_text,
                            specialty=specialty,
                            count=len(hospitals),
                            location_context=loc_label
                        )
                        intro_messages = [{"role": "user", "content": intro_prompt}]
                        intro_raw, _ = await self._call_llm(
                            intro_messages, api_key, api_url, candidate_models, referer, temperature=0.3, max_tokens=120
                        )
                        if intro_raw and len(intro_raw.strip()) > 5:
                            intro_text = intro_raw.strip().strip('"')
                    except Exception as e:
                        print(f"[OpenRouter Service] LLM intro prompt generation failed: {e}")

                if not intro_text:
                    if intent == "direct_location":
                        intro_text = f"Here is the location for **{hospitals[0].name}**:"
                    elif intent == "hospital_recommendation":
                        intro_text = f"For {specialty.lower()}, here are recommended medical facilities near {loc_label}:"
                    else:
                        intro_text = f"Here are hospitals and emergency medical facilities near {loc_label}:"

                rag_service.add_to_memory(session_id, "assistant", intro_text)

                return ChatResponse(
                    id=f"msg-{int(time.time()*1000)}",
                    sender="assistant",
                    timestamp=time.strftime("%I:%M %p"),
                    text=intro_text,
                    reply=intro_text,
                    responseType="hospital_results",
                    hospitals=hospitals,
                    ragContextUsed=[],
                    modelUsed="iris-location-service"
                )

            # Case B: No hospitals found because no location/city provided -> Ask clarifying question
            clarifying_text = (
                f"To help you find the best hospitals for {specialty.lower() if specialty else 'your health concern'}, "
                "could you please share your city or neighborhood, or enable browser location access?"
            )
            rag_service.add_to_memory(session_id, "assistant", clarifying_text)

            return ChatResponse(
                id=f"msg-{int(time.time()*1000)}",
                sender="assistant",
                timestamp=time.strftime("%I:%M %p"),
                text=clarifying_text,
                reply=clarifying_text,
                responseType="conversation",
                hospitals=None,
                ragContextUsed=[],
                modelUsed="iris-location-service"
            )

        # ──────────────────────────────────────────────
        # STEP 2a: CONVERSATION MODE — plain text reply
        # ──────────────────────────────────────────────
        if intent == "chat":
            # Store user message in RAG memory for continuity
            rag_service.add_to_memory(session_id, "user", user_message_text)
            
            # Retrieve light conversation context (recent turns only, no heavy medical retrieval)
            recent_memory = rag_service.retrieve_relevant_memory(session_id, user_message_text, top_k=3)
            
            if has_valid_key:
                # Build conversational prompt
                system_prompt = build_conversational_prompt(recent_memory)
                messages = [{"role": "system", "content": system_prompt}]
                
                if conversation_history:
                    for turn in conversation_history[-6:]:
                        role = turn.get("role", "user")
                        content = turn.get("content", "")
                        if content and role in ["user", "assistant"]:
                            messages.append({"role": role, "content": content})
                
                messages.append({"role": "user", "content": user_message_text})
                
                raw_content, model_used = await self._call_llm(messages, api_key, api_url, candidate_models, referer, temperature=0.7)
                
                if raw_content:
                    # Clean any accidental JSON wrapping
                    reply_text = raw_content.strip()
                    # Store assistant reply in memory
                    rag_service.add_to_memory(session_id, "assistant", reply_text)
                    
                    return ChatResponse(
                        id=f"msg-{int(time.time()*1000)}",
                        sender="assistant",
                        timestamp=time.strftime("%I:%M %p"),
                        text=reply_text,
                        responseType="conversation",
                        ragContextUsed=recent_memory,
                        modelUsed=model_used
                    )
            
            # Fallback conversational response (no API key or LLM failure)
            fallback_text = "Hello! I'm Iris, your health assistant. I'm here to help with any medical or health-related questions you might have. How can I assist you today?"
            rag_service.add_to_memory(session_id, "assistant", fallback_text)
            
            return ChatResponse(
                id=f"msg-{int(time.time()*1000)}",
                sender="assistant",
                timestamp=time.strftime("%I:%M %p"),
                text=fallback_text,
                responseType="conversation",
                ragContextUsed=[],
                modelUsed="fallback-conversational"
            )

        # ──────────────────────────────────────────────
        # STEP 2b: MEDICAL MODE — adaptive markdown text
        # ──────────────────────────────────────────────

        # 1. RAG Retrieval: Get relevant past context
        rag_chunks = rag_service.retrieve_relevant_memory(session_id, user_message_text, top_k=settings.MAX_RAG_CONTEXT_TURNS)
        
        # 2. Save current user message to RAG memory
        rag_service.add_to_memory(session_id, "user", user_message_text)

        # 3. Build adaptive system prompt (replaces old JSON-schema prompt)
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

        reply_text: Optional[str] = None
        model_used: str = "fallback"

        if has_valid_key:
            raw_content, used_model = await self._call_llm(
                messages, api_key, api_url, candidate_models, referer, temperature=0.4
            )
            if raw_content:
                reply_text = raw_content.strip()
                model_used = used_model

        if not reply_text:
            reason_msg = "API Key not set in .env" if not has_valid_key else "OpenRouter free models temporarily busy"
            print(f"[OpenRouter Service] Using fallback text ({reason_msg}).")
            reply_text = self._build_fallback_text(user_message_text, has_valid_key)

        # 4. Store assistant response in RAG memory for future recall
        rag_service.add_to_memory(session_id, "assistant", reply_text)

        return ChatResponse(
            id=f"msg-{int(time.time()*1000)}",
            sender="assistant",
            timestamp=time.strftime("%I:%M %p"),
            text=reply_text,
            responseType="medical",
            ragContextUsed=rag_chunks,
            modelUsed=model_used
        )

openrouter_service = OpenRouterService()
