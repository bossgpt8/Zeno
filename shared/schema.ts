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
  general: [
    { id: "hf/Qwen/Qwen2.5-Omni-7B", name: "Qwen 2.5 Omni 7B", description: "Audio, image, video + text any-to-any" },
    { id: "hf/Qwen/Qwen3-Omni-30B-A3B-Instruct", name: "Qwen 3 Omni 30B Instruct", description: "Most powerful multimodal any-to-any" },
    { id: "hf/openbmb/MiniCPM-o-2_6", name: "MiniCPM-o 2.6", description: "Efficient multimodal (audio, image, text)" },
    { id: "hf/deepseek-ai/Janus-Pro-7B", name: "Janus-Pro 7B", description: "Image understanding and generation" },
    { id: "hf/FunAudioLLM/Fun-Audio-Chat-8B", name: "Fun Audio Chat 8B", description: "Audio + text chat capability" },
  ],
  text: [
    { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", description: "Smart and efficient" },
    { id: "meta-llama/llama-3.1-405b-instruct:free", name: "Llama 3.1 405B", description: "Most powerful" },
    { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1", description: "Advanced reasoning" },
    { id: "xiaomi/mimo-v2-flash:free", name: "Xiaomi Mimo V2 Flash", description: "Fast and capable" },
    { id: "mistralai/devstral-2512:free", name: "Devstral 2512", description: "Development focused" },
    { id: "tngtech/deepseek-r1t2-chimera:free", name: "DeepSeek R1T2 Chimera", description: "Chimera reasoning" },
    { id: "allenai/olmo-3.1-32b-think:free", name: "OLMo 3.1 32B Think", description: "Reasoning model" },
    { id: "openai/gpt-oss-20b:free", name: "GPT OSS 20B", description: "OpenAI open source" },
    { id: "openai/gpt-oss-120b:free", name: "GPT OSS 120B", description: "OpenAI 120B large" },
    { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B", description: "Compact and fast" },
    { id: "mistralai/mistral-small-3.1-24b-instruct:free", name: "Mistral Small 3.1", description: "Efficient and capable" },
    { id: "meta-llama/llama-3.2-3b-instruct:free", name: "Llama 3.2 3B", description: "Lightweight model" },
    { id: "nousresearch/hermes-3-llama-3.1-405b:free", name: "Hermes 3 Llama 3.1 405B", description: "Research optimized" },
    // HuggingFace Models
    { id: "hf/meta-llama/Llama-2-70b-chat-hf", name: "Llama 2 70B Chat (HF)", description: "HuggingFace hosted" },
    { id: "hf/mistralai/Mistral-7B-Instruct-v0.2", name: "Mistral 7B Instruct v0.2 (HF)", description: "HuggingFace hosted" },
    { id: "hf/tiiuae/falcon-7b-instruct", name: "Falcon 7B Instruct (HF)", description: "HuggingFace hosted" },
    { id: "hf/NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO", name: "Nous Hermes Mixtral (HF)", description: "HuggingFace hosted" },
  ],
  image: [
    { id: "black-forest-labs/FLUX.1-schnell", name: "FLUX.1 Schnell", description: "Best quality - fastest" },
    { id: "stabilityai/stable-diffusion-xl-base-1.0", name: "SDXL Base", description: "Reliable quality" },
    { id: "stabilityai/stable-diffusion-v1-5", name: "SD 1.5", description: "Popular and fast" },
  ],
  code: [
    { id: "qwen/qwen3-coder:free", name: "Qwen 3 Coder", description: "Specialized for code generation" },
    { id: "kwaipilot/kat-coder-pro:free", name: "KwaiPilot KAT Coder Pro", description: "Professional coding assistant" },
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
