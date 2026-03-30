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
- Supabase (Database + Storage)
- OpenAI API
- React Markdown + remark-gfm
- Lucide Icons
- ESLint

## Architecture

A Next.js-centered full-stack architecture:

- Frontend
  - Main car page in app/page.tsx
  - AI chat in app/ai-car/page.tsx
  - Settings in app/settings/page.tsx

- Data access layer
  - Client hooks for cars and messages
  - Supabase client for database and storage operations

- API server-side
  - Route Handler in app/api/chat/route.ts to:
    - list conversations
    - load history
    - send messages to AI
    - delete conversations

- Persistence
  - Car and chat tables in Supabase
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

2. Configure .env.local as described above.

3. Run the project in development mode:

```bash
npm run dev
```

4. Open:

- http://localhost:3000

## Available Scripts

- npm run dev: starts the development server
- npm run build: creates a production build
- npm run start: runs the production build
- npm run lint: runs lint checks

## Suggested Database Structure

For full functionality, ensure equivalent tables exist:

- cars
  - id
  - brand
  - model
  - year
  - mileage
  - notes
  - photo_path

- chat_conversations
  - id
  - owner_key
  - title
  - created_at

- chat_messages
  - id
  - conversation_id
  - role
  - content
  - image_data_urls
  - created_at

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
types/
```

## Roadmap Ideas

- Real user authentication with account management
- Dedicated car details page with maintenance history
- Image upload to private buckets with signed URLs
- Automated tests (unit and integration)
- CI/CD for lint, build, and deployment
