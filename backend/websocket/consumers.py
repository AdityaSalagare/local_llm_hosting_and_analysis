"""
WebSocket consumers for real-time chat
"""
import json
import re
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from api.models import Conversation, Message
from ai_service.llm_client import get_llm_client
from ai_service.embedding_service import get_embedding_service


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat streaming"""
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.conversation_group_name = f'chat_{self.conversation_id}'
        
        # Accept connection first
        await self.accept()
        
        # Join conversation group (with error handling)
        try:
            if self.channel_layer:
                await self.channel_layer.group_add(
                    self.conversation_group_name,
                    self.channel_name
                )
        except Exception as e:
            print(f"Warning: Could not join channel group: {e}")
            # Continue anyway - connection is still valid
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'open',
            'message': 'WebSocket connected successfully'
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Leave conversation group (with error handling)
        try:
            if self.channel_layer:
                await self.channel_layer.group_discard(
                    self.conversation_group_name,
                    self.channel_name
                )
        except Exception as e:
            print(f"Warning: Could not leave channel group: {e}")
    
    async def receive(self, text_data):
        """Receive message from WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')
            
            if message_type == 'message':
                user_message = data.get('message', '')
                if user_message:
                    await self.handle_user_message(user_message)
            elif message_type == 'typing':
                # Broadcast typing indicator
                await self.channel_layer.group_send(
                    self.conversation_group_name,
                    {
                        'type': 'typing_indicator',
                        'is_typing': data.get('is_typing', False)
                    }
                )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    async def handle_user_message(self, user_message):
        """Handle user message and generate AI response"""
        # Save user message
        conversation = await self.get_conversation()
        if not conversation:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Conversation not found'
            }))
            return
        
        user_msg = await self.save_message(conversation, user_message, 'user')
        
        # Send user message to client
        await self.send(text_data=json.dumps({
            'type': 'user_message',
            'message': {
                'id': str(user_msg.id),
                'content': user_msg.content,
                'sender': user_msg.sender,
                'timestamp': user_msg.timestamp.isoformat()
            }
        }))
        
        # Generate AI response with streaming
        await self.generate_ai_response(conversation, user_message)
    
    async def generate_ai_response(self, conversation, user_message):
        """Generate and stream AI response"""
        # Build conversation context
        messages = await self.get_conversation_messages(conversation)
        context = await self.build_context(messages)
        
        # Get LLM client
        llm_client = get_llm_client()
        
        # Build prompt
        prompt = f"""You are a helpful AI assistant. Continue the conversation naturally.

{context}

User: {user_message}
Assistant:"""
        
        # Create AI message placeholder
        ai_message = await self.create_ai_message(conversation, "")
        full_response = ""
        
        try:
            # Stream response
            await self.send(text_data=json.dumps({
                'type': 'ai_message_start',
                'message_id': str(ai_message.id)
            }))
            
            # Stream tokens and separate thinking from response
            thinking_mode = False
            current_thinking = ""
            visible_response = ""
            
            for token in llm_client.stream(prompt, max_tokens=512, temperature=0.7):
                full_response += token
                
                # Check for thinking tokens
                if '<|thought_start|>' in token:
                    thinking_mode = True
                    # Remove the token marker from visible response
                    clean_token = token.replace('<|thought_start|>', '')
                    if clean_token:
                        visible_response += clean_token
                        await self.send(text_data=json.dumps({
                            'type': 'ai_message_token',
                            'message_id': str(ai_message.id),
                            'token': clean_token
                        }))
                    continue
                    
                if '<|thought_end|>' in token:
                    thinking_mode = False
                    # Send thinking content separately
                    if current_thinking:
                        await self.send(text_data=json.dumps({
                            'type': 'ai_thinking',
                            'message_id': str(ai_message.id),
                            'thinking': current_thinking
                        }))
                        current_thinking = ""
                    # Remove the token marker from visible response
                    clean_token = token.replace('<|thought_end|>', '')
                    if clean_token:
                        visible_response += clean_token
                        await self.send(text_data=json.dumps({
                            'type': 'ai_message_token',
                            'message_id': str(ai_message.id),
                            'token': clean_token
                        }))
                    continue
                
                if thinking_mode:
                    # Accumulate thinking content
                    current_thinking += token
                else:
                    # Send visible tokens
                    visible_response += token
                    await self.send(text_data=json.dumps({
                        'type': 'ai_message_token',
                        'message_id': str(ai_message.id),
                        'token': token
                    }))
            
            # Clean up any remaining thinking tokens from full_response
            cleaned_response = re.sub(r'<\|thought_start\|>.*?<\|thought_end\|>', '', full_response, flags=re.DOTALL)
            cleaned_response = cleaned_response.strip()
            
            # Update message with cleaned response (without thinking tokens)
            await self.update_message(ai_message, cleaned_response)
            
            # Generate embedding (use cleaned response without thinking)
            embedding_service = get_embedding_service()
            embedding = embedding_service.generate_embedding(cleaned_response)
            if embedding:
                await self.update_message_embedding(ai_message, embedding)
            
            # Send completion with cleaned response
            await self.send(text_data=json.dumps({
                'type': 'ai_message_complete',
                'message_id': str(ai_message.id),
                'message': {
                    'id': str(ai_message.id),
                    'content': cleaned_response,
                    'sender': 'ai',
                    'timestamp': ai_message.timestamp.isoformat()
                }
            }))
            
        except Exception as e:
            error_msg = f"Error generating response: {str(e)}"
            await self.update_message(ai_message, error_msg)
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': error_msg
            }))
    
    async def build_context(self, messages):
        """Build conversation context from messages"""
        if not messages:
            return ""
        
        context_parts = []
        # Use last 10 messages for context
        for msg in messages[-10:]:
            context_parts.append(f"{msg.sender.upper()}: {msg.content}")
        
        return "\n".join(context_parts)
    
    async def typing_indicator(self, event):
        """Handle typing indicator broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'is_typing': event['is_typing']
        }))
    
    @database_sync_to_async
    def get_conversation(self):
        """Get conversation from database"""
        try:
            return Conversation.objects.get(id=self.conversation_id)
        except Conversation.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_conversation_messages(self, conversation):
        """Get all messages for conversation"""
        return list(conversation.messages.all().order_by('timestamp'))
    
    @database_sync_to_async
    def save_message(self, conversation, content, sender):
        """Save message to database"""
        return Message.objects.create(
            conversation=conversation,
            content=content,
            sender=sender
        )
    
    @database_sync_to_async
    def create_ai_message(self, conversation, content):
        """Create AI message placeholder"""
        return Message.objects.create(
            conversation=conversation,
            content=content,
            sender='ai'
        )
    
    @database_sync_to_async
    def update_message(self, message, content):
        """Update message content"""
        message.content = content
        message.save(update_fields=['content'])
        return message
    
    @database_sync_to_async
    def update_message_embedding(self, message, embedding):
        """Update message embedding"""
        message.embedding = embedding
        message.save(update_fields=['embedding'])
        return message

