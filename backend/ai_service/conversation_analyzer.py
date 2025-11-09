"""
Conversation analyzer for generating summaries, extracting topics, sentiment analysis, etc.
"""
from typing import Dict, List, Optional
from api.models import Conversation, Message
from .llm_client import get_llm_client


class ConversationAnalyzer:
    """Analyze conversations and extract insights"""
    
    def __init__(self):
        self.llm_client = get_llm_client()
    
    def generate_summary(self, conversation: Conversation) -> str:
        """Generate a summary of the conversation"""
        messages = conversation.messages.all().order_by('timestamp')
        if not messages:
            return "Empty conversation"
        
        # Build conversation text
        conversation_text = "\n".join([
            f"{msg.sender.upper()}: {msg.content}" for msg in messages
        ])
        
        prompt = f"""Please provide a concise summary of the following conversation. 
Focus on the main topics discussed, key decisions made, and important information shared.

Conversation:
{conversation_text}

Summary:"""
        
        try:
            summary = self.llm_client.generate(
                prompt=prompt,
                max_tokens=256,
                temperature=0.5
            )
            return summary.strip()
        except Exception as e:
            print(f"Error generating summary: {e}")
            # Fallback summary
            return f"Conversation with {len(messages)} messages about various topics."
    
    def extract_topics(self, conversation: Conversation) -> List[str]:
        """Extract main topics from conversation"""
        messages = conversation.messages.all().order_by('timestamp')
        if not messages:
            return []
        
        conversation_text = "\n".join([
            f"{msg.sender.upper()}: {msg.content}" for msg in messages[:20]  # Limit for context
        ])
        
        prompt = f"""Extract the main topics discussed in this conversation. 
Return only a comma-separated list of topics, nothing else.

Conversation:
{conversation_text}

Topics:"""
        
        try:
            response = self.llm_client.generate(
                prompt=prompt,
                max_tokens=128,
                temperature=0.3
            )
            topics = [t.strip() for t in response.split(',') if t.strip()]
            return topics[:10]  # Limit to 10 topics
        except Exception as e:
            print(f"Error extracting topics: {e}")
            return []
    
    def analyze_sentiment(self, conversation: Conversation) -> str:
        """Analyze overall sentiment of conversation"""
        messages = conversation.messages.all().order_by('timestamp')
        if not messages:
            return "neutral"
        
        conversation_text = "\n".join([
            f"{msg.sender.upper()}: {msg.content}" for msg in messages[:20]
        ])
        
        prompt = f"""Analyze the sentiment of this conversation. 
Respond with only one word: "positive", "negative", or "neutral".

Conversation:
{conversation_text}

Sentiment:"""
        
        try:
            response = self.llm_client.generate(
                prompt=prompt,
                max_tokens=10,
                temperature=0.2
            )
            sentiment = response.strip().lower()
            if sentiment in ['positive', 'negative', 'neutral']:
                return sentiment
            return "neutral"
        except Exception as e:
            print(f"Error analyzing sentiment: {e}")
            return "neutral"
    
    def extract_action_items(self, conversation: Conversation) -> List[str]:
        """Extract action items or tasks mentioned in conversation"""
        messages = conversation.messages.all().order_by('timestamp')
        if not messages:
            return []
        
        conversation_text = "\n".join([
            f"{msg.sender.upper()}: {msg.content}" for msg in messages[:20]
        ])
        
        prompt = f"""Extract any action items, tasks, or to-dos mentioned in this conversation.
Return only a comma-separated list of action items, nothing else. If there are no action items, return "None".

Conversation:
{conversation_text}

Action Items:"""
        
        try:
            response = self.llm_client.generate(
                prompt=prompt,
                max_tokens=256,
                temperature=0.3
            )
            if response.strip().lower() == 'none':
                return []
            action_items = [item.strip() for item in response.split(',') if item.strip()]
            return action_items[:10]
        except Exception as e:
            print(f"Error extracting action items: {e}")
            return []
    
    def extract_key_points(self, conversation: Conversation) -> List[str]:
        """Extract key discussion points"""
        messages = conversation.messages.all().order_by('timestamp')
        if not messages:
            return []
        
        conversation_text = "\n".join([
            f"{msg.sender.upper()}: {msg.content}" for msg in messages[:20]
        ])
        
        prompt = f"""Extract the key points or important information from this conversation.
Return only a comma-separated list of key points, nothing else.

Conversation:
{conversation_text}

Key Points:"""
        
        try:
            response = self.llm_client.generate(
                prompt=prompt,
                max_tokens=256,
                temperature=0.4
            )
            key_points = [point.strip() for point in response.split(',') if point.strip()]
            return key_points[:10]
        except Exception as e:
            print(f"Error extracting key points: {e}")
            return []
    
    def analyze_conversation(self, conversation: Conversation) -> Dict:
        """Perform full analysis of conversation"""
        return {
            'summary': self.generate_summary(conversation),
            'topics': self.extract_topics(conversation),
            'sentiment': self.analyze_sentiment(conversation),
            'action_items': self.extract_action_items(conversation),
            'key_points': self.extract_key_points(conversation)
        }

