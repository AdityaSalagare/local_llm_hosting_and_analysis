# Django Management Commands Explained

## Overview

These commands are used to set up and manage your Django database. Here's what each one does:

---

## 1. `python manage.py makemigrations`

**What it does:**

- Analyzes your Django models (in `api/models.py`)
- Detects changes you've made to models (new fields, modified fields, deleted models, etc.)
- Creates migration files that describe how to update the database schema
- **Does NOT modify the database** - only creates the migration files

**When to use:**

- After creating new models
- After modifying existing models (adding/removing fields)
- After changing field types or constraints

**Example output:**

```text
Migrations for 'api':
  api/migrations/0001_initial.py
    - Create model Conversation
    - Create model Message
    - Create model ConversationAnalysis
```

**Files created:**

- Migration files in `backend/api/migrations/` directory
- These are Python files that describe database changes

---

## 2. `python manage.py migrate`

**What it does:**

- Reads the migration files created by `makemigrations`
- **Actually applies the changes to your database**
- Creates tables, adds columns, modifies constraints, etc.
- Tracks which migrations have been applied (in `django_migrations` table)

**When to use:**

- After running `makemigrations`
- When setting up the database for the first time
- After pulling code from git that includes new migrations
- After installing a Django app that has migrations

**Example output:**

```text
Operations to perform:
  Apply all migrations: admin, api, auth, contenttypes, sessions
Running migrations:
  Applying api.0001_initial... OK
  Applying api.0002_auto_20250109... OK
```

**What happens:**

- Creates tables: `api_conversation`, `api_message`, `api_conversationanalysis`
- Creates indexes and foreign key constraints
- Sets up Django's built-in tables (auth, admin, sessions, etc.)

---

## 3. `python manage.py createsuperuser`

**What it does:**

- Creates an admin user account with superuser privileges
- Allows you to access Django's admin panel at `/admin/`
- Prompts you to enter:
  - Username
  - ![1762687779915](image/DJANGO_COMMANDS_EXPLAINED/1762687779915.png) (optional)
  - Password (twice for confirmation)

**When to use:**

- First time setting up the project
- When you need admin access to manage data through Django admin
- After creating a new database

**Example interaction:**

```text
Username: admin
Email address: admin@example.com
Password: ********
Password (again): ********
Superuser created successfully.
```

**What you can do with it:**

- Access `/admin/` URL
- View and edit conversations, messages, and analysis data
- Manage users and permissions
- Useful for debugging and data management

---

## Typical Workflow

### First Time Setup

```bash
# 1. Create migration files from your models
python manage.py makemigrations

# 2. Apply migrations to create database tables
python manage.py migrate

# 3. Create admin user (optional but recommended)
python manage.py createsuperuser
```

### After Model Changes

```bash
# 1. Create new migration files
python manage.py makemigrations

# 2. Apply the new migrations
python manage.py migrate
```

---

## Important Notes

### Railway PostgreSQL Connection

Your Railway database URL:

```text
postgresql://postgres:ZWWQQHEqcgFfMwRxxUIHhFytvuoTFP**@shinka**en.proxy.rlwy.net:38953/railway
```

Has been parsed into `.env` file as:

- **DB_NAME**: `railway`
- **DB_USER**: `postgres`
- **DB_PASSWORD**: `ZWWQQHEqcgFfMwRxxUIHhFytvuoTFP**`
- **DB_HOST**: `shinka**en.proxy.rlwy.net`
- **DB_PORT**: `38953`

Make sure your `.env` file in the `backend/` directory has these values set correctly.

### Troubleshooting

**If migrations fail:**

- Check database connection in `.env`
- Verify Railway database is accessible
- Check if tables already exist (might need to drop and recreate)

**If you get "No changes detected":**

- Your models match what's already in migrations
- This is normal if you haven't changed models

**If you need to reset database:**

```bash
# Drop all tables (careful!)
python manage.py migrate api zero

# Then recreate
python manage.py migrate
```

---

## What Tables Will Be Created?

After running `migrate`, you'll have:

1. **Your app tables:**

   - `api_conversation` - Stores conversation metadata
   - `api_message` - Stores individual messages
   - `api_conversationanalysis` - Stores AI analysis results
2. **Django system tables:**

   - `django_migrations` - Tracks applied migrations
   - `django_content_type` - Content type system
   - `django_session` - Session storage
   - `auth_*` - User authentication tables
   - `admin_*` - Admin interface tables

---

## Next Steps

After running these commands:

1. Database tables are created
2. You can start the server: `python manage.py runserver`
3. Access admin panel at: `http://localhost:8000/admin/`
4. API endpoints are ready at: `http://localhost:8000/swagger/`
