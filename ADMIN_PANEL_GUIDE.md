# Django Admin Panel Usage Guide

This guide explains how to use the Django admin interface to manage conversations, messages, and analysis data for the AI Chat Portal.

## Table of Contents

- [Accessing the Admin Panel](#accessing-the-admin-panel)
- [Creating a Superuser](#creating-a-superuser)
- [Logging In](#logging-in)
- [Understanding the Interface](#understanding-the-interface)
- [Managing Conversations](#managing-conversations)
- [Managing Messages](#managing-messages)
- [Viewing Conversation Analysis](#viewing-conversation-analysis)
- [Tips and Best Practices](#tips-and-best-practices)

---

## Accessing the Admin Panel

### Prerequisites

1. **Start the Django development server**:

   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Open your web browser** and navigate to:

   ```text
   http://localhost:8000/admin/
   ```

---

## Creating a Superuser

If you haven't created an admin user yet, you need to create a superuser account.

### Steps

1. **Open a terminal** in the `backend` directory

2. **Run the createsuperuser command**:

   ```bash
   python manage.py createsuperuser
   ```

3. **Follow the prompts**:
   - **Username**: Enter a username (e.g., `admin`)
   - **Email address**: Enter your email (optional, can press Enter to skip)
   - **Password**: Enter a secure password (twice for confirmation)

4. **Example interaction**:

   ```text
   Username: admin
   Email address: admin@example.com
   Password: ********
   Password (again): ********
   Superuser created successfully.
   ```

### What is a Superuser?

A superuser has full access to:

- All models in the admin panel
- Ability to create, edit, and delete any record
- User management capabilities
- System-wide permissions

---

## Logging In

1. **Navigate to** `http://localhost:8000/admin/`

2. **Enter your credentials**:
   - Username: The username you created
   - Password: The password you set

3. **Click "Log in"**

4. You'll be redirected to the admin dashboard

---

## Understanding the Interface

### Admin Dashboard

The main admin page shows:

- **Recent Actions**: Recent changes made in the admin
- **Applications**: Grouped by Django apps
- **Models**: Available models you can manage

### Main Sections

1. **API** (Your custom app):
   - Conversations
   - Messages
   - Conversation Analyses

2. **Authentication and Authorization**:
   - Users
   - Groups

3. **Sessions**:
   - Sessions

### Navigation

- **Top Bar**:
  - Site name (Django administration)
  - User menu (View site, Change password, Log out)
  - Theme toggle (Light/Dark/Auto)

- **Sidebar**:
  - List of all available models
  - Organized by application

---

## Managing Conversations

### Viewing Conversations

1. **Click on "Conversations"** under the "API" section
2. You'll see a list of all conversations with:
   - ID (UUID)
   - Title
   - Status (Active/Ended)
   - Start time
   - End time

### Conversation Features

- **List Display**: Shows ID, title, status, start time, and end time
- **Filters**:
  - Filter by Status (Active/Ended)
  - Filter by Start time
- **Search**: Search conversations by title
- **Sorting**: Click column headers to sort

### Creating a New Conversation

1. **Click "Add Conversation"** button (top right)
2. **Fill in the form**:
   - **Title**: Enter a conversation title
   - **Status**: Choose "Active" or "Ended" (default: Active)
   - **Start time**: Automatically set to current time
   - **End time**: Leave blank for active conversations
   - **Summary**: Optional summary text
   - **Metadata**: Optional JSON metadata
3. **Click "Save"**

### Editing a Conversation

1. **Click on a conversation** from the list
2. **Modify any fields**:
   - Change title
   - Update status
   - Add/edit summary
   - Modify metadata
3. **Click "Save"** or "Save and continue editing"

### Viewing Conversation Details

When viewing a conversation, you can see:

- **Basic Information**:
  - ID (UUID)
  - Title
  - Status
  - Start time
  - End time
  - Summary
  - Metadata
  - Share token
  - Created/Updated timestamps

- **Related Objects**:
  - **Messages**: All messages in this conversation (click to view)
  - **Analysis**: AI-generated analysis (if conversation is ended)

### Deleting a Conversation

1. **Select the conversation(s)** using checkboxes
2. **Choose "Delete selected conversations"** from the action dropdown
3. **Click "Go"**
4. **Confirm deletion**

⚠️ **Warning**: Deleting a conversation will also delete all associated messages and analysis!

---

## Managing Messages

### Viewing Messages

1. **Click on "Messages"** under the "API" section
2. You'll see a list of all messages with:
   - ID (UUID)
   - Conversation (linked)
   - Sender (User/AI)
   - Timestamp
   - Bookmarked status

### Message Features

- **List Display**: Shows ID, conversation, sender, timestamp, and bookmarked status
- **Filters**:
  - Filter by Sender (User/AI)
  - Filter by Timestamp
  - Filter by Bookmarked status
- **Search**: Search messages by content
- **Sorting**: Click column headers to sort

### Creating a New Message

1. **Click "Add Message"** button (top right)
2. **Fill in the form**:
   - **Conversation**: Select from dropdown (required)
   - **Content**: Enter message text
   - **Sender**: Choose "User" or "AI"
   - **Timestamp**: Automatically set to current time
   - **Reactions**: Optional JSON for emoji reactions
   - **Is bookmarked**: Checkbox to bookmark message
   - **Parent message**: Optional, for message threading
3. **Click "Save"**

### Editing a Message

1. **Click on a message** from the list
2. **Modify any fields**:
   - Update content
   - Change sender
   - Add/edit reactions
   - Toggle bookmark status
3. **Click "Save"**

### Viewing Message Details

When viewing a message, you can see:

- **Basic Information**:
  - ID (UUID)
  - Conversation (linked)
  - Content
  - Sender
  - Timestamp
  - Embedding (vector data, if generated)
  - Reactions (JSON)
  - Is bookmarked
  - Parent message (if threaded)
  - Created timestamp

### Deleting Messages

1. **Select the message(s)** using checkboxes
2. **Choose "Delete selected messages"** from the action dropdown
3. **Click "Go"**
4. **Confirm deletion**

---

## Viewing Conversation Analysis

### Accessing Analysis

1. **Click on "Conversation Analyses"** under the "API" section
2. Or **view from a Conversation**:
   - Open a conversation
   - Scroll to "Analysis" section
   - Click the analysis link

### Analysis Information

Each analysis contains:

- **ID**: UUID of the analysis
- **Conversation**: Linked conversation
- **Sentiment**: Positive, Negative, or Neutral
- **Topics**: List of extracted topics (JSON)
- **Action Items**: List of action items (JSON)
- **Key Points**: List of key discussion points (JSON)
- **Created at**: When analysis was generated

### Analysis Features

- **List Display**: Shows ID, conversation, sentiment, and created date
- **Filters**:
  - Filter by Sentiment
  - Filter by Created date
- **Search**: Not available (analysis is linked to conversations)

### When is Analysis Created?

Analysis is automatically generated when:

- A conversation is ended via the API (`POST /api/conversations/{id}/end/`)
- The conversation status changes from "Active" to "Ended"

### Manual Analysis Creation

You can create analysis manually:

1. **Click "Add Conversation Analysis"**
2. **Select a conversation** (must be ended)
3. **Fill in fields**:
   - Sentiment: Choose from dropdown
   - Topics: Enter as JSON array (e.g., `["topic1", "topic2"]`)
   - Action Items: Enter as JSON array
   - Key Points: Enter as JSON array
4. **Click "Save"**

---

## Tips and Best Practices

### 1. Navigation Tips

- **Use the search bar** to quickly find conversations or messages
- **Use filters** to narrow down large lists
- **Click on linked fields** (like Conversation in Messages) to navigate to related objects
- **Use breadcrumbs** at the top to navigate back

### 2. Bulk Operations

- **Select multiple items** using checkboxes
- **Use the action dropdown** for bulk operations:
  - Delete multiple items at once
  - Apply filters before selecting for targeted operations

### 3. Data Management

- **Backup before bulk deletions**: Be careful when deleting multiple items
- **Use filters** to find specific data before editing
- **Check related objects** before deleting (e.g., check messages before deleting conversation)

### 4. Understanding Relationships

- **Conversation → Messages**: One-to-many (one conversation has many messages)
- **Conversation → Analysis**: One-to-one (one conversation has one analysis)
- **Message → Parent Message**: Self-referential (for threading)

### 5. UUID Format

All IDs are UUIDs (Universally Unique Identifiers):

```text
123e4567-e89b-12d3-a456-426614174000
```

- Copy these IDs to use in API calls
- Use them to link related objects

### 6. Status Management

- **Active Conversations**: Can receive new messages
- **Ended Conversations**:
  - Cannot receive new messages (via API)
  - Should have analysis generated
  - Can be exported and shared

### 7. Search Functionality

- **Conversations**: Search by title
- **Messages**: Search by content
- **Case-insensitive**: Searches are not case-sensitive
- **Partial matches**: Searches find partial matches

### 8. Date and Time

- **Timestamps** are in UTC by default
- **Start time** is set automatically when creating conversations
- **End time** is set when ending a conversation
- **Created/Updated** timestamps are managed automatically

### 9. JSON Fields

Some fields accept JSON data:

- **Metadata** (Conversations): Custom data storage
- **Reactions** (Messages): Emoji reactions as JSON object
- **Topics, Action Items, Key Points** (Analysis): Arrays stored as JSON

Example JSON format:

```json
{
  "key": "value",
  "array": ["item1", "item2"]
}
```

### 10. Performance Tips

- **Use filters** instead of scrolling through long lists
- **Limit bulk operations** to reasonable numbers
- **Use search** for specific items rather than browsing

---

## Common Tasks

### Task 1: Find All Active Conversations

1. Go to Conversations
2. Use filter: Status → Active
3. View filtered list

### Task 2: Find Messages from a Specific Conversation

1. Go to Messages
2. Use filter or search
3. Or go to the Conversation and view related Messages

### Task 3: View Analysis for a Conversation

1. Go to Conversations
2. Click on the conversation
3. Scroll to "Analysis" section
4. Click the analysis link

### Task 4: End a Conversation Manually

1. Go to Conversations
2. Click on an active conversation
3. Change Status to "Ended"
4. Set End time to current time
5. Save
6. Analysis will need to be generated separately (or use API endpoint)

### Task 5: Export Conversation Data

While you can view data in admin, for actual export:

- Use the API endpoint: `POST /api/conversations/{id}/export/`
- Or use the frontend interface

---

## Troubleshooting

### Issue: Cannot Log In

- **Check credentials**: Ensure username and password are correct
- **Create superuser**: Run `python manage.py createsuperuser` if needed
- **Check server**: Ensure Django server is running

### Issue: Cannot See Models

- **Check registration**: Models should be registered in `api/admin.py`
- **Check permissions**: Ensure you're logged in as superuser
- **Refresh page**: Try refreshing the browser

### Issue: Changes Not Saving

- **Check required fields**: Ensure all required fields are filled
- **Check validation**: Some fields may have validation rules
- **Check server logs**: Look for error messages in terminal

### Issue: Cannot Delete Items

- **Check permissions**: Ensure you have delete permissions
- **Check relationships**: Some items may be protected by foreign keys
- **Delete related items first**: Delete child objects before parent

---

## Security Notes

⚠️ **Important Security Considerations**:

1. **Superuser Access**: Superusers have full system access
2. **Production**: Never use admin panel in production without proper authentication
3. **Data Protection**: Be careful when deleting data - it's permanent
4. **Backup**: Always backup data before bulk operations

---

## Additional Resources

- **API Documentation**: See `SWAGGER_UI_GUIDE.md` for API testing
- **Django Admin Docs**: <https://docs.djangoproject.com/en/stable/ref/contrib/admin/>
- **API Base URL**: `http://localhost:8000/api/`
- **Swagger UI**: `http://localhost:8000/swagger/`

---

## Quick Reference

### Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Enter**: Submit forms
- **Escape**: Cancel operations

### Common Actions

| Action | Location |
|--------|----------|
| Create Conversation | Conversations → Add Conversation |
| View Messages | Messages → Click on message |
| Filter by Status | Conversations → Filter sidebar → Status |
| Search Messages | Messages → Search bar |
| View Analysis | Conversations → Click conversation → Analysis section |

---

Happy managing! 🎯
