from django.contrib import admin
from .models import Conversation, Message, ConversationAnalysis


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'status', 'start_time', 'end_time']
    list_filter = ['status', 'start_time']
    search_fields = ['title']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'timestamp', 'is_bookmarked']
    list_filter = ['sender', 'timestamp', 'is_bookmarked']
    search_fields = ['content']


@admin.register(ConversationAnalysis)
class ConversationAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sentiment', 'created_at']
    list_filter = ['sentiment', 'created_at']

