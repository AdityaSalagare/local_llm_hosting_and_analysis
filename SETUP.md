# Quick Setup Guide

## Prerequisites Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] PostgreSQL installed (or use SQLite)
- [ ] Redis installed (optional, can use in-memory)
- [ ] LLM model file (.gguf) or LM Studio

## Step-by-Step Setup

### 1. Clone/Download the Repository

```bash
cd ero_assignment
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r ../requirements.txt
```

### 3. Configure Environment

```bash
# Copy example env file
cp ../.env.example .env

# Edit .env with your settings:
# - Database credentials
# - LLM model path or LM Studio settings
# - Redis settings (or set USE_INMEMORY_CHANNELS=true)
```

### 4. Database Setup

```bash
# Create migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Create sample data (optional)
python manage.py create_sample_data --count 5
```

### 5. Frontend Setup

```bash
cd ../frontend
npm install
```

### 6. Start Services

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### 7. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/swagger/
- Admin: http://localhost:8000/admin/

## Configuration Options

### Using SQLite (Easier for Development)

In `.env`:
```
USE_SQLITE=true
```

### Using PostgreSQL

In `.env`:
```
USE_SQLITE=false
DB_NAME=chat_portal
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### Using LM Studio (Recommended)

1. Download and install LM Studio
2. Load your model in LM Studio
3. Start local server in LM Studio
4. In `.env`:
```
USE_LM_STUDIO=true
LM_STUDIO_URL=http://localhost:1234
```

### Using Direct Model Loading

1. Place your `.gguf` file in the backend directory
2. In `.env`:
```
USE_LM_STUDIO=false
MODEL_PATH=model.gguf
```

### WebSocket Configuration

If Redis is not available, use in-memory channels:
```
USE_INMEMORY_CHANNELS=true
```

## Troubleshooting

### Import Errors
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Database Errors
- Check database credentials in `.env`
- Try using SQLite: `USE_SQLITE=true`
- Run migrations: `python manage.py migrate`

### WebSocket Issues
- Check Redis is running (or set `USE_INMEMORY_CHANNELS=true`)
- Verify CORS settings in `settings.py`

### LLM Not Working
- Check model path in `.env`
- Verify LM Studio is running (if using)
- Check console for error messages

## Next Steps

1. Create your first conversation at `/chat`
2. Explore the dashboard at `/dashboard`
3. Try the intelligence features at `/intelligence`
4. View analytics at `/analytics`

## Need Help?

- Check the main README.md for detailed documentation
- Review ARCHITECTURE.md for system design
- Check API documentation at `/swagger/`

