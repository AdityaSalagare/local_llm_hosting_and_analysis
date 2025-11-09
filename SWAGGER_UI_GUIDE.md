# Swagger UI API Testing Guide

This guide explains how to test the AI Chat Portal API endpoints using Swagger UI, an interactive API documentation and testing tool.

## Table of Contents

- [Accessing Swagger UI](#accessing-swagger-ui)
- [Understanding the Interface](#understanding-the-interface)
- [Testing API Endpoints](#testing-api-endpoints)
- [Common Endpoints](#common-endpoints)
- [Tips and Best Practices](#tips-and-best-practices)

---

## Accessing Swagger UI

### Prerequisites

1. **Start the Django development server**:

   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Open your web browser** and navigate to:

   ```text
   http://localhost:8000/swagger/
   ```

   Alternatively, you can use ReDoc (another documentation interface):

   ```text
   http://localhost:8000/redoc/
   ```

---

## Understanding the Interface

### Swagger UI Layout

- **Top Section**: API title, version, and description
- **Endpoints List**: All available API endpoints organized by category
- **Try it out**: Button to test endpoints directly in the browser
- **Schemas**: Data models and request/response structures

### Key Features

- **Interactive Testing**: Test endpoints without writing code
- **Request/Response Examples**: See example data structures
- **Schema Validation**: Understand required and optional fields
- **Authentication**: Configure authentication if needed (currently AllowAny)

---

## Testing API Endpoints

### Step-by-Step Process

1. **Find the endpoint** you want to test in the list
2. **Click on the endpoint** to expand it
3. **Click "Try it out"** button
4. **Fill in the parameters** (if any)
5. **Click "Execute"**
6. **View the response** below

### Example: Creating a Conversation

1. Navigate to `POST /api/conversations/`
2. Click "Try it out"
3. In the request body, enter:

   ```json
   {
     "title": "My Test Conversation"
   }
   ```

4. Click "Execute"
5. View the response - you'll get a conversation object with an `id`

---

## Common Endpoints

### 1. Conversations

#### List All Conversations

- **Endpoint**: `GET /api/conversations/`
- **Description**: Get a list of all conversations
- **Query Parameters** (optional):
  - `status`: Filter by status (`active` or `ended`)
  - `search`: Search by title or summary
  - `date_from`: Filter conversations from this date
  - `date_to`: Filter conversations until this date
- **Example Request**:

  ```http
  GET /api/conversations/?status=active&search=test
  ```

#### Get Single Conversation

- **Endpoint**: `GET /api/conversations/{id}/`
- **Description**: Get details of a specific conversation
- **Path Parameter**: `id` (UUID of the conversation)
- **Response**: Full conversation object with messages and analysis

#### Create Conversation

- **Endpoint**: `POST /api/conversations/`
- **Description**: Create a new conversation
- **Request Body**:

  ```json
  {
    "title": "New Conversation Title"
  }
  ```

- **Response**: Created conversation object with generated `id`

#### End Conversation

- **Endpoint**: `POST /api/conversations/{id}/end/`
- **Description**: End a conversation and generate AI analysis
- **Path Parameter**: `id` (UUID of the conversation)
- **What it does**:
  - Sets conversation status to `ended`
  - Records end time
  - Generates summary, sentiment, topics, action items, and key points
- **Response**: Updated conversation with analysis

### 2. Messages

#### List Messages

- **Endpoint**: `GET /api/messages/`
- **Description**: Get all messages (optionally filtered by conversation)
- **Query Parameters** (optional):
  - `conversation_id`: Filter messages by conversation ID
- **Example Request**:

  ```http
  GET /api/messages/?conversation_id=123e4567-e89b-12d3-a456-426614174000
  ```

#### Get Single Message

- **Endpoint**: `GET /api/messages/{id}/`
- **Description**: Get details of a specific message
- **Path Parameter**: `id` (UUID of the message)

#### Add Message to Conversation

- **Endpoint**: `POST /api/conversations/{id}/messages/`
- **Description**: Add a message to a conversation
- **Path Parameter**: `id` (UUID of the conversation)
- **Request Body**:

  ```json
  {
    "content": "Hello, AI!",
    "sender": "user"
  }
  ```

- **Note**: `sender` must be either `"user"` or `"ai"`

### 3. Search and Query

#### Semantic Search

- **Endpoint**: `GET /api/conversations/search/`
- **Description**: Search conversations using semantic similarity
- **Query Parameters**:
  - `q`: Search query (required)
  - `limit`: Maximum number of results (default: 10)
- **Example Request**:

  ```http
  GET /api/conversations/search/?q=travel plans&limit=5
  ```

#### Query Past Conversations

- **Endpoint**: `POST /api/conversations/query/`
- **Description**: Ask questions about past conversations using AI
- **Request Body**:

  ```json
  {
    "query": "What did I discuss about travel?",
    "date_from": "2024-01-01T00:00:00Z",
    "date_to": "2024-12-31T23:59:59Z",
    "limit": 5
  }
  ```

- **Response**: AI-generated answer with relevant excerpts

### 4. Analytics

#### Get Analytics

- **Endpoint**: `GET /api/conversations/analytics/`
- **Description**: Get conversation statistics and analytics
- **Query Parameters** (optional):
  - `status`: Filter by status
  - `date_from`: Start date for analytics
  - `date_to`: End date for analytics
- **Response**: Includes:
  - Total conversations
  - Total messages (user messages only)
  - Date statistics
  - Sentiment distribution
  - Average messages per conversation

### 5. Export and Share

#### Export Conversation

- **Endpoint**: `POST /api/conversations/{id}/export/`
- **Description**: Export conversation in various formats
- **Path Parameter**: `id` (UUID of the conversation)
- **Request Body**:

  ```json
  {
    "format": "json"
  }
  ```

- **Supported Formats**: `json`, `markdown`, `pdf`
- **Response**: File download

#### Share Conversation

- **Endpoint**: `POST /api/conversations/{id}/share/`
- **Description**: Generate a shareable link for a conversation
- **Path Parameter**: `id` (UUID of the conversation)
- **Response**: Share token and URL

#### Get Shared Conversation

- **Endpoint**: `GET /api/conversations/shared/{token}/`
- **Description**: Access a shared conversation using its token
- **Path Parameter**: `token` (share token from share endpoint)

---

## Tips and Best Practices

### 1. Testing Workflow

1. **Start with creating a conversation**:

   ```http
   POST /api/conversations/
   ```

   Copy the `id` from the response.

2. **Add messages to the conversation**:

   ```http
   POST /api/conversations/{id}/messages/
   ```

3. **View the conversation with messages**:

   ```http
   GET /api/conversations/{id}/
   ```

4. **End the conversation to generate analysis**:

   ```http
   POST /api/conversations/{id}/end/
   ```

5. **View analytics**:

   ```http
   GET /api/conversations/analytics/
   ```

### 2. Understanding Responses

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error

### 3. UUID Format

All IDs in this API are UUIDs (Universally Unique Identifiers) in the format:

```text
123e4567-e89b-12d3-a456-426614174000
```

### 4. Date Formats

When using date parameters, use ISO 8601 format:

```text
2024-01-15T10:30:00Z
```

or just the date:

```text
2024-01-15
```

### 5. Pagination

List endpoints return paginated results:

- `count`: Total number of items
- `next`: URL to next page (if available)
- `previous`: URL to previous page (if available)
- `results`: Array of items

### 6. Filtering and Searching

Many endpoints support filtering:

- Use query parameters for filtering
- Multiple filters can be combined
- Search is case-insensitive

### 7. Error Handling

If you get an error:

1. Check the error message in the response
2. Verify all required fields are provided
3. Check data types match the schema
4. Ensure UUIDs are valid format

---

## Example Testing Scenarios

### Scenario 1: Complete Conversation Flow

1. **Create conversation**:

   ```json
   POST /api/conversations/
   {
     "title": "Planning a Trip"
   }
   ```

   Save the `id` from response.

2. **Add user message**:

   ```json
   POST /api/conversations/{id}/messages/
   {
     "content": "I want to plan a trip to Japan",
     "sender": "user"
   }
   ```

3. **Add AI response** (simulated):

   ```json
   POST /api/conversations/{id}/messages/
   {
     "content": "That sounds exciting! When are you planning to go?",
     "sender": "ai"
   }
   ```

4. **End conversation**:

   ```http
   POST /api/conversations/{id}/end/
   ```

5. **View analysis**:

   ```http
   GET /api/conversations/{id}/
   ```

   Check the `analysis` field in the response.

### Scenario 2: Search and Query

1. **Search conversations**:

   ```http
   GET /api/conversations/search/?q=travel&limit=5
   ```

2. **Query about past conversations**:

   ```json
   POST /api/conversations/query/
   {
     "query": "What travel destinations did I discuss?",
     "limit": 3
   }
   ```

### Scenario 3: Analytics

1. **Get all analytics**:

   ```http
   GET /api/conversations/analytics/
   ```

2. **Get analytics for specific date range**:

   ```http
   GET /api/conversations/analytics/?date_from=2024-01-01&date_to=2024-12-31
   ```

---

## Troubleshooting

### Common Issues

1. **"Connection refused" or "Cannot connect"**:

   - Ensure Django server is running on `http://localhost:8000`
   - Check if port 8000 is available
2. **"404 Not Found"**:

   - Verify the endpoint URL is correct
   - Check if the resource ID exists
3. **"400 Bad Request"**:

   - Check request body format (must be valid JSON)
   - Verify all required fields are provided
   - Check data types match the schema
4. **"500 Internal Server Error"**:

   - Check Django server logs for details
   - Verify database connection
   - Check if all services (Redis, PostgreSQL) are running
5. **Swagger UI not loading**:

   - Ensure `drf_yasg` is installed
   - Check Django server is running
   - Clear browser cache

---

## Additional Resources

- **ReDoc Alternative**: Visit <http://localhost:8000/redoc/> for an alternative documentation interface
- **API Base URL**: <http://localhost:8000/api/>
- **Admin Panel**: <http://localhost:8000/admin/> (see ADMIN_PANEL_GUIDE.md)

---

## Quick Reference

| Endpoint                              | Method | Purpose                  |
| ------------------------------------- | ------ | ------------------------ |
| `/api/conversations/`               | GET    | List conversations       |
| `/api/conversations/`               | POST   | Create conversation      |
| `/api/conversations/{id}/`          | GET    | Get conversation         |
| `/api/conversations/{id}/end/`      | POST   | End conversation         |
| `/api/conversations/{id}/messages/` | POST   | Add message              |
| `/api/conversations/search/`        | GET    | Semantic search          |
| `/api/conversations/query/`         | POST   | Query past conversations |
| `/api/conversations/analytics/`     | GET    | Get analytics            |
| `/api/conversations/{id}/export/`   | POST   | Export conversation      |
| `/api/conversations/{id}/share/`    | POST   | Share conversation       |
| `/api/messages/`                    | GET    | List messages            |
