# Zeno - Intelligent AI Chatbot

## Overview

Zeno is a full-stack AI chatbot application that provides an intelligent conversational interface powered by multiple AI models. The application supports text chat, image analysis (vision models), image generation, and voice interaction. It features a modern dark-themed UI inspired by Linear's design language, with support for light/dark themes and customizable accent colors.

Key capabilities:
- Multi-model AI chat via OpenRouter API (text and vision models)
- Image generation via Hugging Face API
- Voice input/output using Web Speech API
- Firebase authentication with Google sign-in
- Conversation history management with branching support
- Smart commands for device actions (flashlight, app launching, etc.)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for Replit
- **Routing**: Wouter (lightweight React router)
- **State Management**: Zustand with persist middleware for local storage
- **Data Fetching**: TanStack React Query
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming

The frontend follows a component-based architecture:
- `pages/` - Route-level components (Chat, NotFound)
- `components/chat/` - Chat-specific components (MessageBubble, ChatInput, WelcomeScreen)
- `components/sidebar/` - Sidebar navigation and model selection
- `components/header/` - Application header with controls
- `components/ui/` - Reusable shadcn/ui components

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **HTTP Server**: Node.js native HTTP module
- **Build**: esbuild for production bundling with Vite for development

API endpoints:
- `POST /api/chat` - Proxies chat requests to OpenRouter API
- `POST /api/generate-image` - Proxies image generation to Hugging Face API
- `GET /api/status` - Health check for API configuration

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Tables**: users, conversations (with JSONB messages)
- **Session Storage**: In-memory (MemStorage class) with PostgreSQL option via connect-pg-simple

The application currently uses in-memory storage but has PostgreSQL schema ready for persistent storage. Conversations store messages as JSONB arrays supporting branching.

### Authentication
- **Provider**: Firebase Authentication
- **Method**: Google Sign-in via popup
- **Configuration**: Environment variables for Firebase config (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID)
- **State**: Auth state synced to Zustand store via Firebase observer

### External Service Integrations
- **OpenRouter API**: Multi-model AI chat (requires OPENROUTER_API_KEY)
- **Hugging Face API**: Image generation (requires HUGGINGFACE_API_KEY)
- **Firebase**: Authentication and optional Firestore for conversation sync

## External Dependencies

### Required Environment Variables
- `OPENROUTER_API_KEY` - Required for AI chat functionality
- `DATABASE_URL` - PostgreSQL connection string (for persistent storage)
- `VITE_FIREBASE_API_KEY` - Firebase Web API key (optional, for auth)
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID (optional)
- `VITE_FIREBASE_APP_ID` - Firebase app ID (optional)
- `HUGGINGFACE_API_KEY` - For image generation feature

### Key NPM Dependencies
- `drizzle-orm` + `drizzle-kit` - Database ORM and migrations
- `@tanstack/react-query` - Server state management
- `zustand` - Client state management
- `firebase` - Authentication
- `marked` + `highlight.js` + `dompurify` - Markdown rendering with syntax highlighting
- `wouter` - Client-side routing
- Radix UI primitives - Accessible UI components

### AI Models Supported
Vision models (can analyze images):
- Google Gemma 3
- Other vision-capable models via OpenRouter

Text models:
- Amazon Nova 2 Lite (default)
- Various free-tier models via OpenRouter

Image generation models:
- Tongyi-MAI/Z-Image-Turbo
- Stable Diffusion XL Base 1.0