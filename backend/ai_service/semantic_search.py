"""
Semantic search for finding relevant conversations and messages
"""
from typing import List, Dict, Tuple, Optional
from api.models import Conversation, Message
from .embedding_service import get_embedding_service
from .llm_client import get_llm_client


class SemanticSearch:
    """Semantic search across conversations"""
    
    def __init__(self):
        self.embedding_service = get_embedding_service()
        self.llm_client = get_llm_client()
    
    def search_conversations(self, query: str, limit: int = 10, 
                           date_range: Optional[Tuple] = None) -> List[Dict]:
        """
        Search conversations by semantic similarity
        
        Args:
            query: Search query text
            limit: Maximum number of results
            date_range: Optional tuple of (start_date, end_date)
        
        Returns:
            List of conversation dicts with similarity scores
        """
        query_embedding = self.embedding_service.generate_embedding(query)
        if not query_embedding:
            return []
        
        # Get all conversations (or filtered by date)
        conversations = Conversation.objects.filter(status='ended')
        if date_range:
            start_date, end_date = date_range
            conversations = conversations.filter(start_time__range=[start_date, end_date])
        
        results = []
        for conv in conversations:
            # Use summary or first few messages for embedding
            if conv.summary:
                text_to_embed = conv.summary
            else:
                messages = conv.messages.all()[:5]
                text_to_embed = " ".join([msg.content for msg in messages])
            
            if not text_to_embed:
                continue
            
            conv_embedding = self.embedding_service.generate_embedding(text_to_embed)
            if conv_embedding:
                similarity = self.embedding_service.cosine_similarity(
                    query_embedding, conv_embedding
                )
                results.append({
                    'conversation': conv,
                    'similarity': similarity,
                    'score': similarity
                })
        
        # Sort by similarity and return top results
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:limit]
    
    def search_messages(self, query: str, conversation_id: Optional[str] = None,
                       limit: int = 10) -> List[Dict]:
        """
        Search messages by semantic similarity
        
        Args:
            query: Search query text
            conversation_id: Optional conversation ID to limit search
            limit: Maximum number of results
        
        Returns:
            List of message dicts with similarity scores
        """
        query_embedding = self.embedding_service.generate_embedding(query)
        if not query_embedding:
            return []
        
        messages = Message.objects.all()
        if conversation_id:
            messages = messages.filter(conversation_id=conversation_id)
        
        results = []
        for msg in messages:
            if not msg.content:
                continue
            
            # Use existing embedding if available, otherwise generate
            if msg.embedding:
                msg_embedding = msg.embedding
            else:
                msg_embedding = self.embedding_service.generate_embedding(msg.content)
                if msg_embedding:
                    msg.embedding = msg_embedding
                    msg.save(update_fields=['embedding'])
            
            if msg_embedding:
                similarity = self.embedding_service.cosine_similarity(
                    query_embedding, msg_embedding
                )
                results.append({
                    'message': msg,
                    'similarity': similarity,
                    'score': similarity
                })
        
        # Sort by similarity and return top results
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:limit]
    
    def find_related_conversations(self, conversation: Conversation, limit: int = 5) -> List[Dict]:
        """Find conversations similar to the given one"""
        if conversation.summary:
            query = conversation.summary
        else:
            messages = conversation.messages.all()[:10]
            query = " ".join([msg.content for msg in messages])
        
        if not query:
            return []
        
        # Search excluding the current conversation
        all_results = self.search_conversations(query, limit=limit + 1)
        related = [r for r in all_results if r['conversation'].id != conversation.id]
        return related[:limit]

