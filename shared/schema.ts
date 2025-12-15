import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: varchar("id", { length: 128 }).primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Message type for chat
export const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  images: z.array(z.string()).optional(),
  timestamp: z.number(),
  parentId: z.string().nullable().optional(),
  branchIndex: z.number().optional(),
});

export type Message = z.infer<typeof messageSchema>;

// Conversation model
export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 128 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 128 }),
  title: text("title").notNull().default("New Chat"),
  messages: jsonb("messages").$type<Message[]>().default([]),
  model: text("model").default("amazon/nova-2-lite-v1:free"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// AI Models configuration
export const AI_MODELS = {
  vision: [
    { id: "google/gemma-3-12b-it:free", name: "Gemma-12b", description: "Vision capable" },
    { id: "google/gemma-3n-e2b-it:free", name: "Gemma-e2b", description: "Vision capable" },
  ],
  text: [
    { id: "amazon/nova-2-lite-v1:free", name: "Nova", description: "General tasks" },
    { id: "openai/gpt-oss-20b:free", name: "OpenAI", description: "General tasks" },
    { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama", description: "General tasks" },
    { id: "qwen/qwen3-235b-a22b:free", name: "Qwen", description: "General tasks" },
    { id: "google/gemini-2.0-flash-exp:free", name: "Gemini", description: "General tasks" },
    { id: "mistralai/mistral-7b-instruct:free", name: "Mistral", description: "General tasks" },
  ],
  image: [
    { id: "Tongyi-MAI/Z-Image-Turbo", name: "Z-Image-Turbo", description: "Fast/Free" },
    { id: "stabilityai/stable-diffusion-xl-base-1.0", name: "SDXL", description: "High-Quality/Free" },
  ],
  code: [
    { id: "qwen/qwen3-coder:free", name: "Qwen Coder", description: "Code generation" },
    { id: "kwaipilot/kat-coder-pro:free", name: "KAT-Coder", description: "Code generation" },
  ],
} as const;

// Chat request/response types
export const chatRequestSchema = z.object({
  messages: z.array(messageSchema),
  model: z.string(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const imageGenerationRequestSchema = z.object({
  prompt: z.string().min(1),
  modelId: z.string(),
});

export type ImageGenerationRequest = z.infer<typeof imageGenerationRequestSchema>;

// Smart commands
export const SMART_COMMANDS = [
  { patterns: ["turn on flashlight", "torch on", "flashlight on"], action: "flashlightOn" },
  { patterns: ["turn off flashlight", "torch off", "flashlight off"], action: "flashlightOff" },
  { patterns: ["open whatsapp"], action: "openWhatsApp" },
  { patterns: ["open youtube"], action: "openYouTube" },
  { patterns: ["open gmail", "open email"], action: "openGmail" },
  { patterns: ["open instagram"], action: "openInstagram" },
  { patterns: ["open twitter", "open x"], action: "openTwitter" },
  { patterns: ["search google for"], action: "googleSearch" },
  { patterns: ["search youtube for"], action: "youtubeSearch" },
  { patterns: ["what time is it", "current time"], action: "tellTime" },
  { patterns: ["what date is it", "current date"], action: "tellDate" },
  { patterns: ["stop reading", "stop speaking"], action: "stopSpeaking" },
  { patterns: ["who are you", "introduce yourself"], action: "introduce" },
  { patterns: ["tell me a joke"], action: "tellJoke" },
] as const;
