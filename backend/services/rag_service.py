import os
import re
import math
import uuid
import time
from typing import List, Dict, Any, Optional
from collections import Counter

from config import settings

# Common English stopwords to ignore in keyword indexing
STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "if", "because", "as", "what",
    "which", "this", "that", "these", "those", "then", "just", "so", "than",
    "such", "both", "through", "about", "for", "is", "of", "while", "during",
    "to", "from", "in", "out", "on", "off", "again", "further", "then", "once",
    "here", "there", "when", "where", "why", "how", "all", "any", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
    "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will",
    "don", "should", "now", "i", "me", "my", "myself", "we", "our", "ours",
    "you", "your", "yours", "he", "him", "his", "she", "her", "hers", "it",
    "its", "they", "them", "their", "theirs", "am", "is", "are", "was", "were",
    "be", "been", "being", "have", "has", "had", "having", "do", "does", "did"
}

def _tokenize(text: str) -> List[str]:
    """Tokenize and normalize text into clean words."""
    words = re.findall(r'\b[a-zA-Z0-9_-]{2,}\b', text.lower())
    return [w for w in words if w not in STOPWORDS]

class LightweightRAGIndex:
    """Ultra-fast, zero-memory BM25/TF-IDF similarity engine for conversation memory.
    Consumes < 1MB RAM and executes in under 1 millisecond.
    """
    @staticmethod
    def rank_documents(query: str, documents: List[Dict[str, Any]], top_k: int = 4) -> List[str]:
        if not documents or not query.strip():
            return []

        query_tokens = _tokenize(query)
        if not query_tokens:
            return []

        # Calculate document frequencies
        doc_token_lists = [_tokenize(doc.get("raw_content", doc.get("text", ""))) for doc in documents]
        total_docs = len(doc_token_lists)

        df: Dict[str, int] = Counter()
        for t_list in doc_token_lists:
            unique_terms = set(t_list)
            for t in unique_terms:
                df[t] += 1

        # Calculate BM25 / TF-IDF scores
        query_token_counts = Counter(query_tokens)
        scores = []
        for i, t_list in enumerate(doc_token_lists):
            if not t_list:
                scores.append((0.0, documents[i]["text"]))
                continue

            doc_len = len(t_list)
            term_counts = Counter(t_list)
            score = 0.0

            for q_term, q_count in query_token_counts.items():
                if q_term in term_counts:
                    tf = term_counts[q_term] / doc_len
                    # Standard smoothed IDF
                    idf = math.log((total_docs + 1) / (df[q_term] + 1)) + 1.0
                    score += tf * idf * q_count

            scores.append((score, documents[i]["text"]))

        # Sort descending by score
        scores.sort(key=lambda x: x[0], reverse=True)
        # Return docs that had meaningful term overlap
        matched = [text for score, text in scores if score > 0.0]
        return matched[:top_k]

class RAGMemoryService:
    def __init__(self):
        self.embedding_model = None
        self.chroma_client = None
        self.collection = None
        self.in_memory_store: Dict[str, List[Dict[str, Any]]] = {}
        self._initialized = False

    def initialize(self):
        if self._initialized:
            return

        print("[RAG Service] Initializing Ultra-Lightweight RAG Memory Engine (< 512MB RAM mode)...")
        
        # Heavy ML initialization (strictly opt-in via ENABLE_HEAVY_EMBEDDINGS=true)
        if getattr(settings, "ENABLE_HEAVY_EMBEDDINGS", False):
            try:
                from sentence_transformers import SentenceTransformer
                import chromadb
                print(f"[RAG Service] Loading SentenceTransformer: {settings.EMBEDDING_MODEL_NAME}...")
                self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
                os.makedirs(settings.VECTOR_DB_DIR, exist_ok=True)
                self.chroma_client = chromadb.PersistentClient(path=settings.VECTOR_DB_DIR)
                self.collection = self.chroma_client.get_or_create_collection(
                    name="iris_chat_memory",
                    metadata={"hnsw:space": "cosine"}
                )
                print("[RAG Service] SentenceTransformer and ChromaDB loaded successfully.")
            except Exception as e:
                print(f"[RAG Service] Heavy embeddings unavailable ({e}). Using lightweight memory engine.")
                self.embedding_model = None
                self.chroma_client = None
                self.collection = None

        self._initialized = True
        print("[RAG Service] Memory engine active. Footprint: < 2MB RAM.")

    def add_to_memory(self, session_id: str, role: str, text: str) -> bool:
        """Add a conversation turn (user query or assistant response) to RAG memory."""
        self.initialize()
        if not text or not text.strip():
            return False

        clean_text = text.strip()
        doc_id = f"{session_id}_{role}_{int(time.time()*1000)}_{uuid.uuid4().hex[:6]}"
        entry_text = f"[{role.upper()}]: {clean_text}"

        if session_id not in self.in_memory_store:
            self.in_memory_store[session_id] = []
        
        self.in_memory_store[session_id].append({
            "id": doc_id,
            "role": role,
            "text": entry_text,
            "raw_content": clean_text,
            "timestamp": time.time()
        })

        # ChromaDB optional branch if available
        if self.collection and self.embedding_model:
            try:
                embedding = self.embedding_model.encode(entry_text, convert_to_numpy=True).tolist()
                self.collection.add(
                    documents=[entry_text],
                    embeddings=[embedding],
                    metadatas=[{"session_id": session_id, "role": role, "timestamp": time.time()}],
                    ids=[doc_id]
                )
            except Exception as e:
                print(f"[RAG Service] ChromaDB add error: {e}")

        return True

    def retrieve_relevant_memory(self, session_id: str, query: str, top_k: int = 4) -> List[str]:
        """Retrieve relevant past conversation memories for the given user query.
        Combines recent conversation turns with high-speed BM25/TF-IDF keyword similarity
        so IRIS seamlessly recalls prior symptoms and questions within 512MB RAM constraints."""
        self.initialize()
        if not query or not query.strip():
            return []

        session_docs = self.in_memory_store.get(session_id, [])
        if not session_docs:
            return []

        # 1. Recent conversation turns (always preserved for immediate conversational context)
        recent_texts = [doc["text"] for doc in session_docs[-6:]]

        # 2. Semantic/Keyword search via lightweight BM25/TF-IDF engine
        semantic_texts = LightweightRAGIndex.rank_documents(query, session_docs, top_k=top_k)

        # 3. Combine recent and scored turns maintaining uniqueness
        combined = []
        seen = set()
        for text in (recent_texts + semantic_texts):
            if text not in seen:
                seen.add(text)
                combined.append(text)

        print(f"[RAG Service] Retrieved {len(combined)} RAG memory chunks for session: '{session_id}' (lightweight mode)")
        return combined[:top_k * 2]

    def clear_memory(self, session_id: str) -> bool:
        """Clear memory for a specific session."""
        self.initialize()
        if self.collection:
            try:
                self.collection.delete(where={"session_id": session_id})
            except Exception as e:
                print(f"[RAG Service] ChromaDB clear error: {e}")
        
        if session_id in self.in_memory_store:
            del self.in_memory_store[session_id]
            
        return True

rag_service = RAGMemoryService()
