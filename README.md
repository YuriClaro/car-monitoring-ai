# Car Monitor AI

A web application for car management with AI-assisted analysis.

The system combines vehicle registration, advanced filtering, photo uploads, and an intelligent chat (CarGPT) to support diagnostics and maintenance guidance. Conversation persistence and data storage are handled with Supabase, and AI responses are generated through OpenAI.

## Project Overview

This project is built with a modular architecture using the Next.js App Router.

- Cars Module
  - Car CRUD (brand, model, year, mileage, notes)
  - Upload and removal of each car photo in Supabase Storage
  - Filters by text, brand, model, year range, and mileage range
  - Details modal with view and edit modes
  - Custom deletion confirmation dialog

- AI Chat Module (CarGPT)
  - Device-based conversation persistence
  - Text and image message support for analysis
  - Image attachments via button and clipboard paste (Ctrl+V)
  - History, search, new conversation, and conversation deletion

- Settings Module
  - Toggle between light and dark themes

## Technologies Used

- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui + Radix UI
- **Drizzle ORM** (PostgreSQL type-safe queries)
- Supabase (PostgreSQL Database + Storage)
- OpenAI API
- React Markdown + remark-gfm
- Lucide Icons
- ESLint

## Architecture

A Next.js-centered full-stack architecture:

- **Frontend**
  - Main car page in app/page.tsx
  - AI chat in app/ai-car/page.tsx
  - Settings in app/settings/page.tsx

- **Data Access Layer**
  - Client hooks for cars and messages (lib/hooks/)
  - Drizzle ORM for type-safe database queries (src/db/)
  - Supabase client for storage operations (lib/supabase/)

- **Database**
  - Drizzle ORM schema in src/db/schema.ts
  - PostgreSQL via Supabase
  - Tables: cars, chat_conversations, chat_messages

- **API Server-side**
  - Route Handler in app/api/chat/route.ts to:
    - list conversations
    - load history
    - send messages to AI
    - delete conversations

- **Persistence**
  - Car and chat data in PostgreSQL (managed via Drizzle)
  - Car and logo images in Supabase Storage

## Main Features

### Cars

- Create, edit, and delete cars
- Car photo upload
- Photo updates from the details modal
- Combined filtering across multiple criteria
- Details modal that blocks outside-click close while in edit mode

### CarGPT

- Conversation-context chat
- Text-only, image-only, and mixed messages
- Image attachments from local upload
- Image attachments via Ctrl+V (clipboard)
- Markdown-rendered assistant responses

## API Documentation

### Chat API

Base path: /api/chat

- GET /api/chat?list=conversations
  - Lists conversations for the authenticated device via X-Chat-Device-Id header

- GET /api/chat?conversationId={id}
  - Returns the conversation message history

- POST /api/chat
  - Sends a message to AI and stores both user and assistant messages
  - Supports imageDataUrls for multimodal analysis

- DELETE /api/chat
  - Deletes a conversation using conversationId in the request body

## Environment Variables

Create a .env.local file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

Notes:

- SUPABASE_SERVICE_ROLE_KEY is required for server-side chat route operations.
- OPENAI_API_KEY is required to generate CarGPT responses.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure .env.local as described above with `DATABASE_URL` pointing to your PostgreSQL instance.

3. The Drizzle ORM schema is already configured in [src/db/schema.ts](src/db/schema.ts). Ensure your database has the required tables:

```bash
# Apply migrations if needed
npx drizzle-kit migrate
```

4. Run the project in development mode:

```bash
npm run dev
```

4. Open:

- http://localhost:3000

## Available Scripts

- `npm run dev`: starts the development server
- `npm run build`: creates a production build
- `npm run start`: runs the production build
- `npm run lint`: runs lint checks

### Drizzle ORM Scripts

- `npx drizzle-kit generate`: generates migrations based on schema changes
- `npx drizzle-kit migrate`: applies pending migrations
- `npx drizzle-kit push`: pushes schema changes directly to database (dev only)

## Database Schema

The database schema is defined in [src/db/schema.ts](src/db/schema.ts) using Drizzle ORM:

### Tables

- **cars**
  - id (UUID, primary key)
  - brand, model (text)
  - year, mileage (integer)
  - notes, photo_path (optional text)

- **chat_conversations**
  - id (UUID, primary key)
  - owner_key (text, indexed)
  - title (optional text)
  - created_at (timestamp with timezone)

- **chat_messages**
  - id (UUID, primary key)
  - conversation_id (UUID, foreign key with cascade delete)
  - role ('user' | 'assistant')
  - content (text)
  - image_data_urls (JSONB, optional)
  - created_at (timestamp with timezone)
  - Indexes: (conversation_id, created_at)

### Schema Management

- Schema is version-controlled in [src/db/schema.ts](src/db/schema.ts)
- Generate migrations: `npx drizzle-kit generate`
- Migrations stored in [supabase/migrations/](supabase/migrations/)

## Project Structure

```text
app/
  ai-car/page.tsx
  api/chat/route.ts
  settings/page.tsx
  page.tsx
components/
  cars/
  layout/
  ui/
lib/
  hooks/
  supabase/
src/
  db/
    index.ts          # Drizzle ORM database instance
    schema.ts         # Drizzle ORM table definitions
types/
supabase/
  migrations/        # Database migration files
```

## Roadmap Ideas

- Real user authentication with account management
- Dedicated car details page with maintenance history
- Image upload to private buckets with signed URLs
- Automated tests (unit and integration)
- CI/CD for lint, build, and deployment
