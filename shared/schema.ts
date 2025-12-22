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
  model: text("model").default("meta-llama/llama-3.3-70b-instruct:free"),
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
    { id: "nvidia/nemotron-nano-4b-vision-instruct:free", name: "Nemotron Nano 12B VL", description: "NVIDIA multimodal - video & documents" },
    { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash", description: "Google's fastest multimodal" },
    { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B", description: "Vision with 128K context" },
    { id: "mistralai/mistral-small-3.1-24b:free", name: "Mistral Small 3.1 24B", description: "Vision with 128K context" },
    { id: "qwen/qwen2.5-vl-7b-instruct:free", name: "Qwen 2.5 VL 7B", description: "20min+ video understanding" },
    { id: "google/gemma-3-12b-it:free", name: "Gemma 3 12B", description: "Vision capable" },
    { id: "google/gemma-3-4b-it:free", name: "Gemma 3 4B", description: "Vision lightweight" },
  ],
  text: [
    { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", description: "Smart and efficient" },
    { id: "meta-llama/llama-3.1-405b-instruct:free", name: "Llama 3.1 405B", description: "Most powerful" },
    { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1", description: "Advanced reasoning - like OpenAI o1" },
    { id: "deepseek/deepseek-v3:free", name: "DeepSeek V3", description: "Powerful and fast" },
    { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B", description: "Reliable and stable" },
    { id: "openai/gpt-oss-20b:free", name: "GPT OSS 20B", description: "OpenAI open source" },
    { id: "cohere/command-r:free", name: "Cohere Command R", description: "Instruction following" },
    { id: "moonshotai/kimi-k2:free", name: "Kimi K2", description: "Reasoning and tool use" },
    { id: "mistralai/mistral-large:free", name: "Mistral Large", description: "High performance" },
    { id: "mistralai/mistral-small:free", name: "Mistral Small", description: "Fast responses" },
    { id: "qwen/qwen-2.5-72b-instruct:free", name: "Qwen 2.5 72B", description: "Fast & capable" },
    { id: "openrouter/optimus-alpha", name: "OpenRouter Optimus", description: "Low-latency" },
  ],
  image: [
    { id: "black-forest-labs/FLUX.1-schnell", name: "FLUX.1 Schnell", description: "Best quality - fastest" },
    { id: "stabilityai/stable-diffusion-3-medium", name: "Stable Diffusion 3", description: "High-quality generation" },
    { id: "kandinsky-community/kandinsky-3", name: "Kandinsky 3", description: "Unique artistic style" },
    { id: "stabilityai/stable-diffusion-xl-base-1.0", name: "SDXL Base", description: "Reliable quality" },
    { id: "stabilityai/stable-diffusion-xl-turbo", name: "SDXL Turbo", description: "Fast SDXL" },
    { id: "stabilityai/stable-diffusion-2.1", name: "SD 2.1", description: "Classic stable diffusion" },
    { id: "runwayml/stable-diffusion-v1-5", name: "SD 1.5", description: "Original popular model" },
    { id: "Tongyi-MAI/Z-Image-Turbo", name: "Z-Image Turbo", description: "Chinese optimized - fast" },
    { id: "dreamlike-art/dreamlike-photoreal-2.0", name: "DreamLike Photoreal", description: "Realistic images" },
    { id: "SG161222/Realistic_Vision_V5.1_noVAE", name: "Realistic Vision 5.1", description: "Photorealistic" },
    { id: "eimiss/OrangeMix3-rev", name: "OrangeMix3", description: "Creative style" },
    { id: "stablediffusionapi/rev-animated", name: "Rev-Animated", description: "Anime optimized" },
  ],
  code: [
    { id: "qwen/qwen3-coder:free", name: "Qwen Coder", description: "Code generation" },
    { id: "meta-llama/code-llama-34b-instruct:free", name: "Code Llama 34B", description: "Specialized code" },
    { id: "mistralai/codestral:free", name: "Codestral", description: "Mistral code model" },
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
