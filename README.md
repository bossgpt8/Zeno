# Zeno AI - Advanced Conversational Platform

Zeno AI is a sophisticated, full-stack AI chat application designed to provide a premium, multi-modal conversational experience. It leverages cutting-edge AI models for text generation, image analysis, and visual synthesis.

## 🚀 Key Features

### 1. Multi-Modal Intelligence
- **Contextual Dialogue:** Advanced text-based conversations with high-fidelity reasoning.
- **Visual Analysis:** Upload and analyze images, diagrams, and screenshots.
- **Creative Synthesis:** Generate stunning artwork using specialized image generation models.

### 2. Premium User Experience
- **Voice Interaction:** Hands-free operation with speech-to-text and high-quality text-to-speech.
- **Onboarding Tutorial:** A guided walkthrough for new users to discover key features.
- **Quick Guide:** Professional documentation available directly within the interface.

### 3. Personalization & Control
- **Engine Calibration:** Switch between various AI models (Llama 3.3, Claude, GPT, etc.) based on task requirements.
- **Custom Instructions:** Define Zeno's personality and set system-level prompts.
- **Profile Management:** Customize user identity with avatars and personal preferences.

### 4. Technical Excellence
- **Real-time Streaming:** Instant AI responses with smooth streaming technology.
- **Cloud Sync:** Securely store and synchronize conversations across sessions via Firebase.
- **Responsive Design:** A modern, mobile-first interface built with Tailwind CSS and Shadcn UI.
- **Offline Support:** Resilient operation even with intermittent connectivity.

## 🛠 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, TanStack Query, Wouter.
- **Backend:** Express.js, Node.js.
- **Database/Storage:** PostgreSQL (via Drizzle ORM), Firebase Firestore (for user data/sync).
- **AI Integrations:** OpenRouter API (Access to 100+ models).
- **Authentication:** Firebase Auth.

## 📂 Project Structure

- `client/`: React frontend application.
  - `src/components/`: Reusable UI components and feature-specific modules.
  - `src/pages/`: Application pages (Chat, Settings, etc.).
  - `src/lib/`: Utility functions, store (Zustand), and API clients.
- `server/`: Express backend.
  - `routes.ts`: API endpoints for chat, image generation, and storage.
- `shared/`: Shared types and schemas using Drizzle/Zod.

## 🚦 Getting Started

1. **Clone the repository.**
2. **Install dependencies:** `npm install`.
3. **Set environment variables:** Ensure your AI and Firebase keys are configured in the `.env` file or Replit Secrets.
4. **Run the application:** `npm run dev`.

---
*Built with precision and designed for the future of AI interaction.*
