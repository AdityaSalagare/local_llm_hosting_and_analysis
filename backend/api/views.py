"""
REST API views for conversations and messages
"""
import json
import secrets
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q, Count
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Conversation, Message, ConversationAnalysis
from .serializers import (
    ConversationSerializer, ConversationListSerializer, ConversationCreateSerializer,
    MessageSerializer, MessageCreateSerializer, ConversationQuerySerializer,
    ConversationExportSerializer, ConversationAnalysisSerializer
)
from ai_service.conversation_analyzer import ConversationAnalyzer
from ai_service.query_processor import QueryProcessor
from ai_service.semantic_search import SemanticSearch
from ai_service.embedding_service import get_embedding_service
import markdown
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO


class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet for Conversation model"""
    queryset = Conversation.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ConversationListSerializer
        elif self.action == 'create':
            return ConversationCreateSerializer
        return ConversationSerializer
    
    def get_queryset(self):
        queryset = Conversation.objects.annotate(
            message_count=Count('messages', filter=Q(messages__sender='user'))
        ).order_by('-start_time')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search by title or summary
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(summary__icontains=search)
            )
        
        # Date range filter
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(start_time__gte=date_from)
        if date_to:
            queryset = queryset.filter(start_time__lte=date_to)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create a new conversation"""
        serializer = ConversationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation = Conversation.objects.create(
            title=serializer.validated_data.get('title', '')
        )
        return Response(
            ConversationSerializer(conversation).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        """End a conversation and generate summary"""
        conversation = self.get_object()
        
        if conversation.status == 'ended':
            return Response(
                {'error': 'Conversation already ended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conversation.status = 'ended'
        conversation.end_time = timezone.now()
        conversation.save()
        
        # Generate summary and analysis
        try:
            analyzer = ConversationAnalyzer()
            analysis_data = analyzer.analyze_conversation(conversation)
            
            conversation.summary = analysis_data['summary']
            conversation.save()
            
            # Create or update analysis
            analysis, created = ConversationAnalysis.objects.get_or_create(
                conversation=conversation
            )
            analysis.sentiment = analysis_data['sentiment']
            analysis.topics = analysis_data['topics']
            analysis.action_items = analysis_data['action_items']
            analysis.key_points = analysis_data['key_points']
            analysis.save()
            
        except Exception as e:
            print(f"Error generating analysis: {e}")
            # Still end conversation even if analysis fails
        
        return Response(ConversationSerializer(conversation).data)
    
    @action(detail=True, methods=['post'])
    def messages(self, request, pk=None):
        """Add a message to conversation"""
        conversation = self.get_object()
        serializer = MessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        message = Message.objects.create(
            conversation=conversation,
            content=serializer.validated_data['content'],
            sender=serializer.validated_data['sender']
        )
        
        # Generate embedding for the message
        try:
            embedding_service = get_embedding_service()
            embedding = embedding_service.generate_embedding(message.content)
            if embedding:
                message.embedding = embedding
                message.save(update_fields=['embedding'])
        except Exception as e:
            print(f"Error generating embedding: {e}")
        
        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['post'])
    def query(self, request):
        """Query AI about past conversations"""
        serializer = ConversationQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        query = serializer.validated_data['query']
        date_from = serializer.validated_data.get('date_from')
        date_to = serializer.validated_data.get('date_to')
        limit = serializer.validated_data.get('limit', 5)
        
        date_range = None
        if date_from and date_to:
            date_range = (date_from, date_to)
        
        try:
            processor = QueryProcessor()
            result = processor.process_query(query, date_range=date_range, limit=limit)
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Semantic search conversations"""
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {'error': 'Query parameter "q" is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        limit = int(request.query_params.get('limit', 10))
        
        try:
            semantic_search = SemanticSearch()
            results = semantic_search.search_conversations(query, limit=limit)
            
            serialized_results = []
            for result in results:
                conv_data = ConversationListSerializer(result['conversation']).data
                conv_data['similarity_score'] = result['similarity']
                serialized_results.append(conv_data)
            
            return Response({'results': serialized_results})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def export(self, request, pk=None):
        """Export conversation in various formats"""
        conversation = self.get_object()
        serializer = ConversationExportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        export_format = serializer.validated_data['format']
        messages = conversation.messages.all().order_by('timestamp')
        
        if export_format == 'json':
            data = {
                'conversation': ConversationSerializer(conversation).data,
                'messages': [MessageSerializer(msg).data for msg in messages]
            }
            response = HttpResponse(
                json.dumps(data, indent=2, default=str),
                content_type='application/json'
            )
            response['Content-Disposition'] = f'attachment; filename="conversation_{conversation.id}.json"'
            return response
        
        elif export_format == 'markdown':
            md_content = f"# {conversation.title or 'Conversation'}\n\n"
            md_content += f"**Started:** {conversation.start_time}\n"
            if conversation.end_time:
                md_content += f"**Ended:** {conversation.end_time}\n"
            md_content += f"\n## Summary\n\n{conversation.summary or 'No summary available.'}\n\n"
            md_content += "## Messages\n\n"
            
            for msg in messages:
                md_content += f"### {msg.sender.upper()} ({msg.timestamp})\n\n"
                md_content += f"{msg.content}\n\n"
            
            response = HttpResponse(md_content, content_type='text/markdown')
            response['Content-Disposition'] = f'attachment; filename="conversation_{conversation.id}.md"'
            return response
        
        elif export_format == 'pdf':
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            story = []
            
            # Title
            title = Paragraph(conversation.title or 'Conversation', styles['Title'])
            story.append(title)
            story.append(Spacer(1, 12))
            
            # Metadata
            meta = f"Started: {conversation.start_time}<br/>"
            if conversation.end_time:
                meta += f"Ended: {conversation.end_time}"
            story.append(Paragraph(meta, styles['Normal']))
            story.append(Spacer(1, 12))
            
            # Summary
            if conversation.summary:
                story.append(Paragraph("Summary", styles['Heading2']))
                story.append(Paragraph(conversation.summary, styles['Normal']))
                story.append(Spacer(1, 12))
            
            # Messages
            story.append(Paragraph("Messages", styles['Heading2']))
            for msg in messages:
                msg_text = f"<b>{msg.sender.upper()}</b> ({msg.timestamp})<br/>{msg.content}"
                story.append(Paragraph(msg_text, styles['Normal']))
                story.append(Spacer(1, 6))
            
            doc.build(story)
            buffer.seek(0)
            
            response = HttpResponse(buffer.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="conversation_{conversation.id}.pdf"'
            return response
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Generate shareable link for conversation"""
        conversation = self.get_object()
        
        if not conversation.share_token:
            conversation.share_token = secrets.token_urlsafe(32)
            conversation.save()
        
        share_url = request.build_absolute_uri(
            f'/api/conversations/shared/{conversation.share_token}/'
        )
        
        return Response({
            'share_token': conversation.share_token,
            'share_url': share_url
        })
    
    @action(detail=False, methods=['get'], url_path='shared/(?P<token>[^/.]+)')
    def shared(self, request, token=None):
        """Access shared conversation by token"""
        conversation = get_object_or_404(Conversation, share_token=token)
        return Response(ConversationSerializer(conversation).data)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get conversation analytics"""
        # Include all conversations, not just ended ones
        queryset = Conversation.objects.all()
        
        # Optional status filter
        status_filter = request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Date range
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        
        if date_from:
            try:
                from datetime import datetime
                # Parse date string and set to start of day
                date_from_parsed = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(start_time__date__gte=date_from_parsed)
            except (ValueError, TypeError):
                # If parsing fails, try direct comparison
                queryset = queryset.filter(start_time__gte=date_from)
        if date_to:
            try:
                from datetime import datetime, timedelta
                # Parse date string and set to end of day
                date_to_parsed = datetime.strptime(date_to, '%Y-%m-%d').date() + timedelta(days=1)
                queryset = queryset.filter(start_time__date__lt=date_to_parsed)
            except (ValueError, TypeError):
                # If parsing fails, try direct comparison
                queryset = queryset.filter(start_time__lte=date_to)
        
        # Calculate statistics
        total_conversations = queryset.count()
        total_messages = Message.objects.filter(
            conversation__in=queryset,
            sender='user'
        ).count()
        
        print(f"Analytics: Found {total_conversations} conversations, {total_messages} messages")
        
        # Group by date
        date_stats = {}
        for conv in queryset:
            date_key = conv.start_time.date().isoformat()
            if date_key not in date_stats:
                date_stats[date_key] = {'count': 0, 'messages': 0}
            date_stats[date_key]['count'] += 1
            message_count = conv.messages.filter(sender='user').count()
            date_stats[date_key]['messages'] += message_count
        
        # Sentiment distribution
        sentiment_stats = {}
        analyses = ConversationAnalysis.objects.filter(conversation__in=queryset)
        for analysis in analyses:
            sentiment = analysis.sentiment or 'unknown'
            sentiment_stats[sentiment] = sentiment_stats.get(sentiment, 0) + 1
        
        result = {
            'total_conversations': total_conversations,
            'total_messages': total_messages,
            'date_stats': date_stats,
            'sentiment_distribution': sentiment_stats,
            'average_messages_per_conversation': (
                total_messages / total_conversations if total_conversations > 0 else 0
            )
        }
        
        print(f"Analytics result: {result}")
        return Response(result)


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for Message model"""
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Message.objects.all()
        conversation_id = self.request.query_params.get('conversation_id', None)
        if conversation_id:
            queryset = queryset.filter(conversation_id=conversation_id)
        return queryset.order_by('timestamp')
    
    @action(detail=True, methods=['post'])
    def react(self, request, pk=None):
        """Add reaction to message"""
        message = self.get_object()
        emoji = request.data.get('emoji', '👍')
        
        reactions = message.reactions or {}
        reactions[emoji] = reactions.get(emoji, 0) + 1
        message.reactions = reactions
        message.save(update_fields=['reactions'])
        
        return Response(MessageSerializer(message).data)
    
    @action(detail=True, methods=['post'])
    def bookmark(self, request, pk=None):
        """Toggle bookmark on message"""
        message = self.get_object()
        message.is_bookmarked = not message.is_bookmarked
        message.save(update_fields=['is_bookmarked'])
        
        return Response(MessageSerializer(message).data)

