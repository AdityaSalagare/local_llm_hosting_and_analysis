"""
Serializers for REST API
"""
from rest_framework import serializers
from .models import Conversation, Message, ConversationAnalysis


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model"""
    conversation_id = serializers.UUIDField(source='conversation.id', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'conversation_id', 'content', 'sender', 'timestamp', 
                  'reactions', 'is_bookmarked', 'parent_message', 'created_at']
        read_only_fields = ['id', 'timestamp', 'created_at']


class ConversationAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for ConversationAnalysis model"""
    class Meta:
        model = ConversationAnalysis
        fields = ['id', 'sentiment', 'topics', 'action_items', 'key_points', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for Conversation model"""
    messages = MessageSerializer(many=True, read_only=True)
    analysis = ConversationAnalysisSerializer(read_only=True)
    message_count = serializers.SerializerMethodField()
    duration_seconds = serializers.SerializerMethodField()
    
    def get_message_count(self, obj):
        """Count only user messages, excluding AI replies"""
        return obj.messages.filter(sender='user').count()
    
    class Meta:
        model = Conversation
        fields = ['id', 'title', 'start_time', 'end_time', 'status', 'summary',
                  'metadata', 'share_token', 'message_count', 'duration_seconds',
                  'messages', 'analysis', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'share_token']
    
    def get_duration_seconds(self, obj):
        """Calculate duration in seconds"""
        if obj.end_time:
            return int((obj.end_time - obj.start_time).total_seconds())
        from django.utils import timezone
        return int((timezone.now() - obj.start_time).total_seconds())


class ConversationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for conversation list"""
    message_count = serializers.SerializerMethodField()
    preview = serializers.SerializerMethodField()
    duration_seconds = serializers.SerializerMethodField()
    
    def get_message_count(self, obj):
        """Count only user messages, excluding AI replies"""
        return obj.messages.filter(sender='user').count()
    
    class Meta:
        model = Conversation
        fields = ['id', 'title', 'start_time', 'end_time', 'status', 'summary',
                  'message_count', 'preview', 'duration_seconds', 'share_token', 'created_at']
        read_only_fields = ['id', 'created_at', 'share_token']
    
    def get_preview(self, obj):
        """Get preview of first message"""
        first_message = obj.messages.first()
        if first_message:
            return first_message.content[:100]
        return ""
    
    def get_duration_seconds(self, obj):
        """Calculate duration in seconds"""
        if obj.end_time:
            return int((obj.end_time - obj.start_time).total_seconds())
        from django.utils import timezone
        return int((timezone.now() - obj.start_time).total_seconds())


class ConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating conversations"""
    class Meta:
        model = Conversation
        fields = ['title']


class MessageCreateSerializer(serializers.Serializer):
    """Serializer for creating messages"""
    content = serializers.CharField()
    sender = serializers.ChoiceField(choices=['user', 'ai'], default='user')


class ConversationQuerySerializer(serializers.Serializer):
    """Serializer for querying past conversations"""
    query = serializers.CharField()
    date_from = serializers.DateTimeField(required=False, allow_null=True)
    date_to = serializers.DateTimeField(required=False, allow_null=True)
    limit = serializers.IntegerField(default=5, min_value=1, max_value=20)


class ConversationExportSerializer(serializers.Serializer):
    """Serializer for export format selection"""
    format = serializers.ChoiceField(choices=['pdf', 'json', 'markdown'], default='json')


class ConversationShareSerializer(serializers.Serializer):
    """Serializer for sharing conversations"""
    pass  # No input needed, just generates share token

