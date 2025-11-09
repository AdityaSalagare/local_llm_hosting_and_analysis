from django.db import models
from django.utils import timezone
import uuid


class Conversation(models.Model):
    """Store conversation metadata"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('ended', 'Ended'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, blank=True)
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    summary = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    share_token = models.CharField(max_length=64, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_time']
    
    def __str__(self):
        return self.title or f"Conversation {self.id}"
    
    @property
    def duration(self):
        if self.end_time:
            return self.end_time - self.start_time
        return timezone.now() - self.start_time


class Message(models.Model):
    """Store individual messages in conversations"""
    SENDER_CHOICES = [
        ('user', 'User'),
        ('ai', 'AI'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    timestamp = models.DateTimeField(default=timezone.now)
    embedding = models.JSONField(null=True, blank=True)  # Store vector embeddings
    reactions = models.JSONField(default=dict, blank=True)  # Store emoji reactions
    is_bookmarked = models.BooleanField(default=False)
    parent_message = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender}: {self.content[:50]}"


class ConversationAnalysis(models.Model):
    """Store AI-generated analysis of conversations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.OneToOneField(Conversation, on_delete=models.CASCADE, related_name='analysis')
    sentiment = models.CharField(max_length=20, blank=True)  # positive, negative, neutral
    topics = models.JSONField(default=list, blank=True)  # List of extracted topics
    action_items = models.JSONField(default=list, blank=True)  # List of action items
    key_points = models.JSONField(default=list, blank=True)  # List of key discussion points
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Analysis for {self.conversation}"

