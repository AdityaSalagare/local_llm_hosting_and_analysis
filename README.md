# AI Chat Portal - Full Stack Application

A comprehensive full-stack web application with AI integration for intelligent chat management and conversation analysis. Built with Django REST Framework backend and React frontend.

## Features

### Core Features

- **Real-time Chat**: Interactive conversation with local LLM (minicpm 8B)
- **Conversation Management**: Store, organize, and archive chats
- **Conversation Intelligence**: Ask questions about past conversations
- **Semantic Search**: Find conversations by meaning, not just keywords
- **AI Analysis**: Automatic summaries, key points, and insights extraction
- **Clean UI**: Modern, responsive chat interface

### Bonus Features

- Real-time conversation suggestions based on context
- Voice input/output integration (Web Speech API)
- Conversation export in multiple formats (PDF, JSON, Markdown)
- Conversation sharing functionality with unique links
- Dark mode toggle
- Analytics dashboard showing conversation trends over time
- Message reactions and bookmarking
- Conversation threading or branching

## Tech Stack

### Backend

- **Framework**: Django 4.2.7 + Django REST Framework
- **Real-time**: Django Channels (WebSocket)
- **Database**: PostgreSQL (with SQLite fallback)
- **AI**: Local LLM via llama.cpp or LM Studio API
- **Embeddings**: sentence-transformers for semantic search

### Frontend

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Charts**: Recharts for analytics
- **Icons**: Lucide React

## Project Structure

```text
ero_assignment/
├── backend/                 # Django project
│   ├── chat_portal/        # Main Django project
│   ├── api/                # REST API app
│   ├── ai_service/         # AI integration module
│   ├── websocket/          # WebSocket consumers
│   └── manage.py
├── frontend/               # React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── hooks/          # Custom hooks
│   └── package.json
├── requirements.txt
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL (i had deployed it on railway)(or use SQLite fallback)
- Redis (optional, for WebSocket - can use in-memory fallback)
- LM Studio running (minicpm 8B .gguf)

### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Create virtual environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r ../requirements.txt
   ```

4. **Configure environment variables**:

   ```bash
   cp ../.env.example .env
   # Edit .env with your settings
   # example env
   SECRET_KEY=any-secret-key
   DEBUG=True

   # Database (PostgreSQL on Railway)
   # Parse from: postgresql://user:password@host:port/database
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   DB_HOST=your_host.proxy.rlwy.net
   DB_PORT=38953

   # Use SQLite instead of PostgreSQL (set to 'true' to use SQLite)
   USE_SQLITE=false

   # LLM Configuration
   # Path to your .gguf model file (for direct llama.cpp)
   MODEL_PATH=model.gguf

   # Use LM Studio API instead of direct model loading (set to 'true')
   USE_LM_STUDIO=false

   # LM Studio API URL (if using LM Studio)
   LM_STUDIO_URL=http://localhost:1234

   # Embedding Model
   EMBEDDING_MODEL=all-MiniLM-L6-v2

   # Channels/Redis (for WebSocket)
   # Use in-memory channel layer instead of Redis (set to 'true')
   USE_INMEMORY_CHANNELS=true

   # Celery (optional, for background tasks)
   CELERY_BROKER_URL=redis://localhost:6379/0
   CELERY_RESULT_BACKEND=redis://localhost:6379/0
   ```

5. **Set up database**:

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser (optional)**:

   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**:

   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run development server**:

   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

### LLM Configuration

#### Option 1: Direct Model Loading (llama.cpp)

1. Place your `model.gguf` file in the backend directory
2. Set `MODEL_PATH=model.gguf` in `.env`
3. Set `USE_LM_STUDIO=false` in `.env`

#### Option 2: LM Studio API

1. Load your model in LM Studio
2. Start the local server in LM Studio
3. Set `USE_LM_STUDIO=true` in `.env`
4. Set `LM_STUDIO_URL=http://localhost:1234` (or your LM Studio port)

## API Documentation

API documentation is available via Swagger UI at:

- **Swagger UI**: `http://localhost:8000/swagger/`
- **ReDoc**: `http://localhost:8000/redoc/`

### Key API Endpoints

- `GET /api/conversations/` - List all conversations
- `GET /api/conversations/{id}/` - Get conversation details
- `POST /api/conversations/` - Create new conversation
- `POST /api/conversations/{id}/messages/` - Add message
- `POST /api/conversations/{id}/end/` - End conversation
- `POST /api/conversations/query/` - Query about past conversations
- `GET /api/conversations/search/` - Semantic search
- `GET /api/conversations/analytics/` - Get analytics
- `POST /api/conversations/{id}/export/` - Export conversation
- `POST /api/conversations/{id}/share/` - Generate share link

### WebSocket Endpoint

- `ws://localhost:8000/ws/chat/{conversation_id}/` - Real-time chat streaming

## Architecture Diagram

```text
┌─────────────┐
│   React     │
│  Frontend   │
└──────┬──────┘
       │ HTTP/WebSocket
       │
┌──────▼──────────────────┐
│   Django REST API       │
│   + Django Channels     │
└──────┬──────────────────┘
       │
       ├──────────┬──────────┐
       │          │          │
┌──────▼──┐  ┌───▼────┐  ┌──▼──────┐
│PostgreSQL│  │  Redis │  │  LLM    │
│Database  │  │(Channels)│ │ Service │
└──────────┘  └─────────┘  └─────────┘
```

### Data Flow

1. **Chat Flow**:

   - User sends message → Frontend → WebSocket → Django Channels
   - Django Channels → LLM Service → Stream response → WebSocket → Frontend
2. **Query Flow**:

   - User query → REST API → Query Processor → Semantic Search
   - Semantic Search → Embeddings → Find relevant conversations
   - LLM generates answer with context → Return to user
3. **Analysis Flow**:

   - Conversation ends → Conversation Analyzer → Generate summary
   - Extract topics, sentiment, action items → Store in database

## Sample Conversation Data

The system includes sample conversation data for testing. You can create conversations through:

- The web interface at `/chat`
- The REST API at `/api/conversations/`
- The admin panel at `/admin/`

### Example API Request

```bash
# Create conversation
curl -X POST http://localhost:8000/api/conversations/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Conversation"}'

# Add message
curl -X POST http://localhost:8000/api/conversations/{id}/messages/ \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, AI!", "sender": "user"}'

# Query past conversations
curl -X POST http://localhost:8000/api/conversations/query/ \
  -H "Content-Type: application/json" \
  -d '{"query": "What did I discuss about travel?"}'
```

## Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Production Deployment

### Backend Deployment

1. Set `DEBUG=False` in `.env`
2. Configure proper `SECRET_KEY`
3. Set up PostgreSQL database
4. Configure static files: `python manage.py collectstatic`
5. Use a production WSGI server (e.g., Gunicorn)

### Frontend Deployment

1. Build production bundle: `npm run build`
2. Serve static files with a web server (e.g., Nginx)

## Troubleshooting

### WebSocket Connection Issues

- Ensure Redis is running (or set `USE_INMEMORY_CHANNELS=true`)
- Check CORS settings in `settings.py`
- Verify WebSocket URL in frontend

### LLM Not Responding

- Check model path in `.env`
- Verify LM Studio is running (if using LM Studio)
- Check console for error messages

### Database Connection Issues

- Verify PostgreSQL is running
- Check database credentials in `.env`
- Use SQLite fallback: set `USE_SQLITE=true`

## License

This project is created for assignment purposes by Aditya Salagare for a certain company interview.

## Contact

For questions or issues, please refer to the assignment contact email.
