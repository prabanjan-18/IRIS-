import os
import uuid
import time
from typing import List, Dict, Any, Optional
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    import chromadb
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

from config import settings

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

        print("[RAG Service] Initializing RAG Memory Engine...")
        
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                print(f"[RAG Service] Loading embedding model: {settings.EMBEDDING_MODEL_NAME}...")
                self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
                print("[RAG Service] Embedding model loaded successfully.")
            except Exception as e:
                print(f"[RAG Service] Warning: Failed to load SentenceTransformer ({e}). Falling back to text indexing.")
                self.embedding_model = None
        else:
            print("[RAG Service] sentence-transformers not installed. Using in-memory fallback index.")

        if CHROMADB_AVAILABLE and self.embedding_model:
            try:
                os.makedirs(settings.VECTOR_DB_DIR, exist_ok=True)
                self.chroma_client = chromadb.PersistentClient(path=settings.VECTOR_DB_DIR)
                self.collection = self.chroma_client.get_or_create_collection(
                    name="iris_chat_memory",
                    metadata={"hnsw:space": "cosine"}
                )
                print("[RAG Service] ChromaDB persistent store initialized successfully.")
            except Exception as e:
                print(f"[RAG Service] Warning: ChromaDB initialization error ({e}). Using in-memory fallback store.")
                self.chroma_client = None
                self.collection = None

        self._initialized = True

    def _get_embedding(self, text: str) -> List[float]:
        if self.embedding_model:
            emb = self.embedding_model.encode(text, convert_to_numpy=True)
            return emb.tolist()
        return []

    def add_to_memory(self, session_id: str, role: str, text: str) -> bool:
        """Add a conversation turn (user query or assistant response) to RAG memory."""
        self.initialize()
        if not text or not text.strip():
            return False

        clean_text = text.strip()
        doc_id = f"{session_id}_{role}_{int(time.time()*1000)}_{uuid.uuid4().hex[:6]}"
        entry_text = f"[{role.upper()}]: {clean_text}"

        # 1. Always keep in-memory store for fast recent history lookup
        if session_id not in self.in_memory_store:
            self.in_memory_store[session_id] = []
        
        emb = self._get_embedding(entry_text) if self.embedding_model else []
        self.in_memory_store[session_id].append({
            "id": doc_id,
            "role": role,
            "text": entry_text,
            "raw_content": clean_text,
            "embedding": emb,
            "timestamp": time.time()
        })

        # 2. ChromaDB vector storage for persistent semantic search
        if self.collection and self.embedding_model:
            try:
                embedding = self._get_embedding(entry_text)
                self.collection.add(
                    documents=[entry_text],
                    embeddings=[embedding],
                    metadatas=[{"session_id": session_id, "role": role, "timestamp": time.time()}],
                    ids=[doc_id]
                )
                print(f"[RAG Service] Saved turn to ChromaDB vector store: session_id={session_id}, role={role}")
            except Exception as e:
                print(f"[RAG Service] Error adding document to ChromaDB: {e}")

        return True

    def retrieve_relevant_memory(self, session_id: str, query: str, top_k: int = 4) -> List[str]:
        """Retrieve relevant past conversation memories for the given user query.
        Combines recent conversation turns with semantic vector similarity search
        so IRIS seamlessly recalls information asked recently in the session."""
        self.initialize()
        if not query or not query.strip():
            return []

        recent_texts = []
        session_docs = self.in_memory_store.get(session_id, [])
        if session_docs:
            recent_texts = [doc["text"] for doc in session_docs[-6:]]

        semantic_texts = []
        # 1. Try ChromaDB vector retrieval
        if self.collection and self.embedding_model:
            try:
                query_emb = self._get_embedding(query)
                results = self.collection.query(
                    query_embeddings=[query_emb],
                    n_results=min(top_k, 10),
                    where={"session_id": session_id}
                )
                
                if results and "documents" in results and results["documents"]:
                    docs = results["documents"][0]
                    if docs:
                        semantic_texts = docs
            except Exception as e:
                print(f"[RAG Service] Error querying ChromaDB: {e}")
        
        # 2. Fallback similarity calculation on in-memory store
        elif self.embedding_model and session_docs:
            try:
                query_emb = np.array(self._get_embedding(query))
                scores = []
                for doc in session_docs:
                    if len(doc["embedding"]) > 0:
                        doc_emb = np.array(doc["embedding"])
                        sim = np.dot(query_emb, doc_emb) / (np.linalg.norm(query_emb) * np.linalg.norm(doc_emb) + 1e-9)
                        scores.append((sim, doc["text"]))
                
                scores.sort(key=lambda x: x[0], reverse=True)
                semantic_texts = [text for sim, text in scores[:top_k]]
            except Exception as e:
                print(f"[RAG Service] Error computing fallback similarity: {e}")

        # Combine recent conversation turns with semantic vector matches
        combined = []
        seen = set()
        for text in (recent_texts + semantic_texts):
            if text not in seen:
                seen.add(text)
                combined.append(text)

        print(f"[RAG Service] Retrieved {len(combined)} RAG memory chunks for session: '{session_id}'")
        return combined[:top_k * 2]

    def clear_memory(self, session_id: str) -> bool:
        """Clear memory for a specific session."""
        self.initialize()
        if self.collection:
            try:
                self.collection.delete(where={"session_id": session_id})
            except Exception as e:
                print(f"[RAG Service] Error deleting session from ChromaDB: {e}")
        
        if session_id in self.in_memory_store:
            del self.in_memory_store[session_id]
            
        return True

rag_service = RAGMemoryService()
