"""
Embedding service for semantic search using sentence-transformers
"""
import os
from typing import List, Optional
import numpy as np
from sentence_transformers import SentenceTransformer


class EmbeddingService:
    """Service for generating text embeddings"""
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initialize embedding service
        
        Args:
            model_name: Name of the sentence-transformer model to use
        """
        self.model_name = model_name
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the embedding model"""
        try:
            self.model = SentenceTransformer(self.model_name)
        except Exception as e:
            print(f"Warning: Could not load embedding model: {e}")
            self.model = None
    
    def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding for a single text"""
        if not self.model or not text:
            return None
        
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None
    
    def generate_embeddings(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Generate embeddings for multiple texts"""
        if not self.model or not texts:
            return [None] * len(texts)
        
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            print(f"Error generating embeddings: {e}")
            return [None] * len(texts)
    
    def cosine_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        if not embedding1 or not embedding2:
            return 0.0
        
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))


# Global embedding service instance
_embedding_service = None


def get_embedding_service() -> EmbeddingService:
    """Get or create global embedding service instance"""
    global _embedding_service
    if _embedding_service is None:
        model_name = os.getenv('EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
        _embedding_service = EmbeddingService(model_name=model_name)
    return _embedding_service

