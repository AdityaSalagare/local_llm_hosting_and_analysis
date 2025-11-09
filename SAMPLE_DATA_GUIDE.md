# Sample Data Setup Guide

This guide explains how to populate the database with sample conversations and AI-generated insights for testing the application features.

## Quick Start

After setting up the database and running migrations, create sample data with:

```bash
cd backend
python manage.py create_sample_data --count 10
```

This will create 10 sample conversations with:
- Realistic conversation messages
- AI-generated summaries
- Extracted topics
- Sentiment analysis
- Key points
- Action items (where applicable)

## Command Options

### Basic Usage

```bash
# Create 10 conversations (default)
python manage.py create_sample_data

# Create 20 conversations
python manage.py create_sample_data --count 20

# Create conversations without AI analysis (faster, but no insights)
python manage.py create_sample_data --count 10 --skip-analysis
```

## What Gets Created

### Conversations

Each conversation includes:
- **Title**: Based on the topic (e.g., "Planning a trip to Japan")
- **Status**: All sample conversations are marked as "ended" for testing
- **Timestamps**: Conversations are spread across the last 30 days
- **Messages**: 4-8 messages per conversation with realistic user-AI exchanges

### Sample Topics

The command creates conversations on various topics:
- Planning a trip to Japan
- Learning Python programming
- Cooking Italian recipes
- Fitness and workout routines
- Book recommendations
- Career advice
- Technology trends
- Travel destinations
- Starting a business
- Learning machine learning
- Home improvement projects
- Healthy meal planning

### AI-Generated Insights

For each ended conversation, the system generates:

1. **Summary**: A concise overview of the conversation
2. **Topics**: Extracted main discussion topics
3. **Sentiment**: Overall sentiment (positive, neutral, negative)
4. **Key Points**: Important information discussed
5. **Action Items**: Tasks or to-dos mentioned (if any)

**Note**: AI analysis requires the LLM service to be running. If the LLM is not available, the command will use fallback analysis data.

## Testing Features with Sample Data

Once sample data is created, you can test:

### 1. Dashboard
- View all conversations
- See conversation summaries
- Filter by status or date
- Search conversations

### 2. Intelligence/Query Feature
- Ask questions like:
  - "What did I discuss about travel?"
  - "Tell me about Python learning"
  - "What are the key points from my conversations?"
- The system will use semantic search to find relevant conversations
- Get AI-generated answers with source excerpts

### 3. Analytics
- View conversation statistics
- See trends over time
- Analyze sentiment distribution
- View topic frequency

### 4. Individual Conversations
- Open any conversation to see full message history
- View AI-generated analysis
- See topics, sentiment, and key points
- Export conversations

## Requirements

### For AI-Generated Insights

To generate real AI insights (not fallback data), you need:

1. **LLM Service Running**:
   - LM Studio with a model loaded, OR
   - Direct model file configured in `.env`

2. **Environment Configuration**:
   ```env
   USE_LM_STUDIO=true
   LM_STUDIO_URL=http://localhost:1234
   ```
   OR
   ```env
   USE_LM_STUDIO=false
   MODEL_PATH=model.gguf
   ```

### Without LLM (Fallback Mode)

If the LLM is not available, the command will:
- Still create all conversations and messages
- Use predefined fallback analysis data
- Allow you to test all features except real-time chat

## Troubleshooting

### "Could not initialize AI Analyzer"

This means the LLM service is not available. The command will continue with fallback data. To fix:
- Ensure LM Studio is running (if using LM Studio)
- Check your `.env` configuration
- Verify the model path is correct

### "No conversations created"

- Check database connection
- Ensure migrations are run: `python manage.py migrate`
- Check for error messages in the output

### Slow Performance

If creating many conversations with AI analysis is slow:
- Use `--skip-analysis` flag for faster creation
- Reduce the count: `--count 5`
- AI analysis can take 10-30 seconds per conversation

## Example Output

```
AI Analyzer initialized. Generating insights...
Analyzing conversation: Planning a trip to Japan...
✓ Generated AI insights for: Planning a trip to Japan
Created conversation 1/10: Planning a trip to Japan
Analyzing conversation: Learning Python programming...
✓ Generated AI insights for: Learning Python programming
Created conversation 2/10: Learning Python programming
...
✓ Successfully created 10 sample conversations with AI-generated insights!
You can now test the features:
  - View conversations in Dashboard
  - Query past conversations in Intelligence page
  - View analytics and insights
```

## Next Steps

After creating sample data:

1. **Start the backend server**:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard
   - Intelligence: http://localhost:3000/intelligence
   - Analytics: http://localhost:3000/analytics

4. **Test the features**:
   - Browse conversations in the dashboard
   - Try querying past conversations
   - View analytics and insights
   - Export conversations

## Resetting Sample Data

To clear all sample data and start fresh:

```bash
# Option 1: Delete via Django shell
python manage.py shell
>>> from api.models import Conversation
>>> Conversation.objects.all().delete()

# Option 2: Reset database (WARNING: Deletes all data)
python manage.py flush
python manage.py migrate
```

Then create new sample data with `create_sample_data`.

