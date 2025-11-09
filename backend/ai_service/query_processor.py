"""
Query processor for answering questions about past conversations
"""
from typing import Dict, List, Optional, Tuple
from api.models import Conversation, Message
from .semantic_search import SemanticSearch
from .llm_client import get_llm_client


class QueryProcessor:
    """Process queries about past conversations"""
    
    def __init__(self):
        self.llm_client = get_llm_client()
        self.semantic_search = SemanticSearch()
    
    def process_query(self, query: str, date_range: Optional[Tuple] = None,
                     limit: int = 5) -> Dict:
        """
        Process a query about past conversations
        
        Args:
            query: User's question about past conversations
            date_range: Optional date range filter
            limit: Maximum number of conversations to consider
        
        Returns:
            Dict with answer and relevant excerpts
        """
        # Find relevant conversations
        relevant_convs = self.semantic_search.search_conversations(
            query, limit=limit, date_range=date_range
        )
        
        if not relevant_convs:
            return {
                'answer': "I couldn't find any relevant conversations matching your query.",
                'excerpts': [],
                'related_conversations': []
            }
        
        # Build context from relevant conversations
        context_parts = []
        excerpts = []
        
        for result in relevant_convs:
            conv = result['conversation']
            messages = conv.messages.all().order_by('timestamp')
            
            # Get relevant messages from this conversation
            relevant_messages = self.semantic_search.search_messages(
                query, conversation_id=str(conv.id), limit=3
            )
            
            conv_text = f"Conversation from {conv.start_time.strftime('%Y-%m-%d')}:\n"
            if conv.summary:
                conv_text += f"Summary: {conv.summary}\n"
            
            for msg_result in relevant_messages:
                msg = msg_result['message']
                conv_text += f"{msg.sender.upper()}: {msg.content}\n"
                excerpts.append({
                    'conversation_id': str(conv.id),
                    'conversation_title': conv.title or f"Conversation {conv.id}",
                    'date': conv.start_time.isoformat(),
                    'message': msg.content,
                    'sender': msg.sender,
                    'similarity': msg_result['similarity']
                })
            
            context_parts.append(conv_text)
        
        context = "\n\n".join(context_parts)
        
        # Generate answer using LLM
        prompt = f"""Based on the following past conversations, answer the user's question.
Provide a clear, concise answer and reference specific conversations when relevant.

Past Conversations:
{context}

User Question: {query}

Answer:"""
        
        try:
            answer = self.llm_client.generate(
                prompt=prompt,
                max_tokens=512,
                temperature=0.7
            )
        except Exception as e:
            print(f"Error generating answer: {e}")
            answer = "I found relevant conversations but encountered an error generating a response."
        
        return {
            'answer': answer.strip(),
            'excerpts': excerpts[:10],  # Limit excerpts
            'related_conversations': [
                {
                    'id': str(r['conversation'].id),
                    'title': r['conversation'].title or f"Conversation {r['conversation'].id}",
                    'date': r['conversation'].start_time.isoformat(),
                    'similarity': r['similarity']
                }
                for r in relevant_convs[:5]
            ]
        }

