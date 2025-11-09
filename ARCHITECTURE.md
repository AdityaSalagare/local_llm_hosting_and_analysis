# Architecture Documentation

## System Architecture

### High-Level Overview

The AI Chat Portal is a full-stack application with the following components:

1. **Frontend (React)**: User interface for chat, dashboard, intelligence, and analytics
2. **Backend (Django)**: REST API and WebSocket server
3. **AI Service**: Local LLM integration and conversation intelligence
4. **Database (PostgreSQL)**: Persistent storage for conversations and messages
5. **Real-time Layer (Channels/Redis)**: WebSocket communication

## Component Architecture

### Backend Components

#### 1. API Layer (`api/`)

- **Models**: Conversation, Message, ConversationAnalysis
- **Serializers**: Data transformation for API responses
- **Views**: REST API endpoints (ViewSets)
- **URLs**: API routing

#### 2. AI Service (`ai_service/`)

- **LLM Client**: Interface to local LLM (llama.cpp or LM Studio)
- **Embedding Service**: Text embeddings using sentence-transformers
- **Conversation Analyzer**: Summary, sentiment, topics extraction
- **Semantic Search**: Vector similarity search
- **Query Processor**: Intelligent querying about past conversations

#### 3. WebSocket (`websocket/`)

- **Consumers**: Real-time chat streaming
- **Routing**: WebSocket URL patterns

### Frontend Components

#### 1. Pages

- **Chat**: Real-time chat interface
- **Dashboard**: Conversation list and management
- **Intelligence**: Query interface for past conversations
- **Analytics**: Statistics and trends visualization

#### 2. Services

- **API Service**: REST API client
- **WebSocket Service**: Real-time communication

#### 3. Components

- **Layout**: Navigation and theme
- **VoiceInput**: Speech-to-text
- **MessageReactions**: Emoji reactions
- **ExportModal**: Export functionality
- **ShareModal**: Sharing functionality

## Data Flow

### Chat Flow

```text
User Input → Frontend → WebSocket → Django Channels Consumer
                                                      ↓
                                              LLM Client (Streaming)
                                                      ↓
                                              Token-by-token Response
                                                      ↓
                                              WebSocket → Frontend
                                                      ↓
                                              Display in Real-time
```

### Query Flow

```text
User Query → REST API → Query Processor
                              ↓
                    Semantic Search
                              ↓
                    Find Relevant Conversations
                              ↓
                    Build Context
                              ↓
                    LLM Generate Answer
                              ↓
                    Return with Excerpts
```

### Analysis Flow

```text
Conversation Ends → Conversation Analyzer
                              ↓
                    Generate Summary
                              ↓
                    Extract Topics
                              ↓
                    Analyze Sentiment
                              ↓
                    Extract Action Items
                              ↓
                    Store in Database
```

## Database Schema

### Conversation

- `id` (UUID): Primary key
- `title` (String): Conversation title
- `start_time` (DateTime): When conversation started
- `end_time` (DateTime): When conversation ended
- `status` (String): 'active' or 'ended'
- `summary` (Text): AI-generated summary
- `metadata` (JSON): Additional metadata
- `share_token` (String): Unique token for sharing

### Message

- `id` (UUID): Primary key
- `conversation` (FK): Reference to Conversation
- `content` (Text): Message content
- `sender` (String): 'user' or 'ai'
- `timestamp` (DateTime): When message was sent
- `embedding` (JSON): Vector embedding for semantic search
- `reactions` (JSON): Emoji reactions
- `is_bookmarked` (Boolean): Bookmark flag
- `parent_message` (FK): For threading

### ConversationAnalysis

- `id` (UUID): Primary key
- `conversation` (OneToOne): Reference to Conversation
- `sentiment` (String): 'positive', 'negative', or 'neutral'
- `topics` (JSON): List of topics
- `action_items` (JSON): List of action items
- `key_points` (JSON): List of key points

## API Endpoints

### REST Endpoints

- `GET /api/conversations/` - List conversations
- `GET /api/conversations/{id}/` - Get conversation
- `POST /api/conversations/` - Create conversation
- `POST /api/conversations/{id}/messages/` - Add message
- `POST /api/conversations/{id}/end/` - End conversation
- `POST /api/conversations/query/` - Query past conversations
- `GET /api/conversations/search/` - Semantic search
- `GET /api/conversations/analytics/` - Get analytics
- `POST /api/conversations/{id}/export/` - Export conversation
- `POST /api/conversations/{id}/share/` - Generate share link

### WebSocket Endpoints

- `ws://localhost:8000/ws/chat/{conversation_id}/` - Real-time chat

## Security Considerations

1. **CORS**: Configured for development, should be restricted in production
2. **Authentication**: Currently using AllowAny, should add authentication in production
3. **CSRF**: Django CSRF protection enabled
4. **SQL Injection**: Django ORM prevents SQL injection
5. **XSS**: React escapes content by default

## Performance Optimizations

1. **Embeddings**: Generated asynchronously for new messages
2. **Caching**: Can add Redis caching for frequent queries
3. **Pagination**: API responses are paginated
4. **Database Indexing**: Add indexes on frequently queried fields
5. **Streaming**: LLM responses streamed to reduce latency

## Scalability

1. **Horizontal Scaling**: Django can be scaled with load balancer(also gcp cloudrun)
2. **Database**: PostgreSQL supports replication
3. **WebSocket**: Channels supports multiple workers
4. **Caching**: Redis can be clustered
5. **CDN**: Static files can be served via CDN

## Future Enhancements

1. User authentication and authorization
2. Multi-user conversations
3. File uploads and attachments
4. Advanced analytics and insights
5. Mobile app support
6. Integration with external AI services
7. Conversation templates
8. Advanced search filters
