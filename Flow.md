# Conversation Storage & Querying Flow

## Conversation Storage Flow

```
┌─────────────┐
│ User sends  │
│  message    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. WebSocket Consumer receives message                      │
│    - Validates conversation exists                          │
│    - Creates Message record in database                     │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. LLM Client generates response                            │
│    - Streams tokens via WebSocket                           │
│    - Creates AI Message record                              │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Embedding Service (async)                                │
│    - Generates vector embedding for message                 │
│    - Stores embedding in Message.embedding field            │
│    - Enables semantic search                                │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. User ends conversation                                   │
│    - Conversation.status = 'ended'                          │
│    - Conversation.end_time = now()                          │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Conversation Analyzer                                    │
│    ├─ Generate Summary (LLM)                                │
│    ├─ Extract Topics (LLM)                                  │
│    ├─ Analyze Sentiment (LLM)                               │
│    ├─ Extract Action Items (LLM)                            │
│    └─ Extract Key Points (LLM)                              │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Store Analysis                                           │
│    - Conversation.summary updated                           │
│    - ConversationAnalysis record created                    │
│    - All insights stored in database                        │
└─────────────────────────────────────────────────────────────┘
```

## Query Flow (Intelligence Feature)

```
┌─────────────┐
│ User enters │
│   query     │
│ "What did I │
│ discuss about│
│  travel?"   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Query Processor receives query                           │
│    POST /api/conversations/query/                           │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Generate Query Embedding                                 │
│    - Embedding Service creates vector for query             │
│    - Same model used for messages (all-MiniLM-L6-v2)        │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Semantic Search                                          │
│    - Compare query embedding with all message embeddings    │
│    - Calculate cosine similarity                            │
│    - Find top N most relevant conversations                 │
│    - Retrieve relevant messages from those conversations    │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Build Context                                            │
│    - Combine conversation summaries                         │
│    - Include relevant message excerpts                      │
│    - Add metadata (dates, titles)                           │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. LLM Generate Answer                                      │
│    - Prompt: "Based on past conversations, answer: {query}" │
│    - LLM generates contextual answer                        │
│    - References specific conversations                      │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Return Response                                          │
│    {                                                        │
│      "answer": "You discussed...",                          │
│      "excerpts": [                                          │
│        {                                                    │
│          "conversation_id": "...",                          │
│          "message": "...",                                  │
│          "similarity": 0.85                                 │
│        }                                                    │
│      ]                                                      │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
```

## Data Model Relationships

```
┌──────────────────┐
│  Conversation    │
│  ─────────────   │
│  id (UUID)       │◄──────┐
│  title           │       │
│  summary         │       │
│  status          │       │
│  start_time      │       │
│  end_time        │       │
└────────┬─────────┘       │
         │                 │
         │ 1:N             │ 1:1
         │                 │
         ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│    Message       │  │  Conversation    │
│  ─────────────   │  │    Analysis      │
│  id (UUID)       │  │  ─────────────   │
│  conversation_id │  │  id (UUID)       │
│  content         │  │  conversation_id │
│  sender          │  │  sentiment       │
│  timestamp       │  │  topics (JSON)   │
│  embedding (JSON)│  │  key_points      │
│  reactions       │  │  action_items    │
│  is_bookmarked   │  │                  │
└──────────────────┘  └──────────────────┘
```

## Key Technologies

- **Vector Embeddings**: sentence-transformers (all-MiniLM-L6-v2) for semantic search
- **Similarity Calculation**: Cosine similarity between query and message embeddings
- **LLM Integration**: MiniCPM 8B via LM Studio or llama.cpp
- **Real-time Communication**: Django Channels with WebSocket
- **Database**: PostgreSQL with JSON fields for embeddings and metadata

## Performance Considerations

1. **Embedding Generation**: Done asynchronously to avoid blocking message creation
2. **Semantic Search**: All message embeddings stored in database; similarity calculated in Python
3. **Caching**: Can add Redis caching for frequent queries
4. **Indexing**: Database indexes on conversation timestamps and status
5. **Pagination**: API responses paginated for large result sets
