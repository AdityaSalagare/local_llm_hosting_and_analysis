#!/bin/bash

# Setup script for AI Chat Portal

echo "🚀 Setting up AI Chat Portal..."

# Backend setup
echo "📦 Setting up backend..."
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    cp ../.env.example .env
    echo "✅ Created .env file. Please edit it with your settings."
fi

# Run migrations
python manage.py makemigrations
python manage.py migrate

echo "✅ Backend setup complete!"
cd ..

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend
npm install

echo "✅ Frontend setup complete!"
cd ..

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Don't forget to:"
echo "- Configure your .env file with database and LLM settings"
echo "- Set up PostgreSQL or use SQLite (set USE_SQLITE=true)"
echo "- Configure your LLM model path or LM Studio"

