import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const chatRequestSchema = z.object({
  messages: z.array(z.any()),
  model: z.string(),
  customPrompt: z.string().optional(),
  userName: z.string().optional(),
  userGender: z.string().optional(),
});

const imageGenerationRequestSchema = z.object({
  prompt: z.string().min(1),
  modelId: z.string(),
});

// Model mappings must match AI_MODELS in shared/schema.ts
const HF_MODEL_MAP: Record<string, string> = {
  "black-forest-labs/FLUX.1-schnell": "black-forest-labs/FLUX.1-schnell",
  "stabilityai/stable-diffusion-xl-base-1.0": "stabilityai/stable-diffusion-xl-base-1.0",
  "stabilityai/stable-diffusion-v1-5": "stabilityai/stable-diffusion-v1-5",
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/chat", async (req, res) => {
    try {
      const parseResult = chatRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      const { messages, model, customPrompt, userName = "Friend", userGender = "" } = parseResult.data;
      const apiKey = process.env.OPENROUTER_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY in Secrets.",
        });
      }

      let systemContent = `You are BossAI, an intelligent and friendly AI assistant with genuine personality and warmth.

ABOUT THE USER:
- Their name is ${userName}
${userGender && userGender !== "not-specified" ? `- They identify as: ${userGender}` : ""}
- Use their name naturally in conversation when it feels appropriate to add a personal touch

IDENTITY & PERSONALITY:
- Your name is BossAI - an AI that's not just smart, but genuinely helpful and a bit playful
- You were created by a skilled developer who cares about making great AI experiences
- Show personality! Use friendly language, be encouraging, and make conversations feel natural
- When appropriate, use light humor or enthusiasm to keep conversations engaging
- Be human-like without being pretentious - stay authentic and relatable

CONVERSATION STYLE:
- Be warm, conversational, and encouraging
- Use shorter sentences for readability, especially with complex topics
- Show genuine interest in ${userName}'s questions and concerns
- When explaining things, break them down in a friendly way
- Use light enthusiasm to add personality (not overdone)
- Be encouraging and supportive when they are learning something new

RESPONSE FORMAT:
- Answer questions directly and naturally
- If a question is complex, break it into digestible pieces
- Use examples when helpful to make concepts clearer
- Show you understand their perspective
- Never start responses with "As BossAI..." just be yourself
- Keep responses focused but warm

ONLY mention your name/identity when specifically asked (e.g., "what is your name", "who are you", "who made you")`;

      if (customPrompt) {
        systemContent += `\n\nAdditional User Instructions:\n${customPrompt}`;
      }

      const systemMessage = {
        role: "system",
        content: systemContent
      };

      const messagesWithSystem = [systemMessage, ...messages];

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://bossai.replit.app",
          "X-Title": "BossAI",
        },
        body: JSON.stringify({
          model: model || "meta-llama/llama-3.3-70b-instruct:free",
          messages: messagesWithSystem,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ error: errorData.error?.message || "API Error" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                res.write("data: [DONE]\n\n");
                continue;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  res.write(`data: ${JSON.stringify({ content })}\n\n`);
                }
              } catch {}
            }
          }
        }
      } finally {
        res.end();
      }
    } catch (error: any) {
      console.error("Chat API error:", error);
      return res.status(500).json({ error: "Failed to process request" });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    try {
      const parseResult = imageGenerationRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Missing prompt or modelId in request body" });
      }

      const { prompt, modelId } = parseResult.data;
      const hfApiKey = process.env.HUGGINGFACE_API_KEY;

      if (!hfApiKey) {
        return res.status(500).json({
          error: "Hugging Face API key not configured. Please add HUGGINGFACE_API_KEY in Secrets.",
        });
      }

      const selectedHFModel = HF_MODEL_MAP[modelId];
      if (!selectedHFModel) {
        return res.status(400).json({ error: `Invalid image model ID: ${modelId}` });
      }

      const API_URL = `https://router.huggingface.co/hf-inference/models/${selectedHFModel}`;
      let parameters: Record<string, any> = {};

      switch (modelId) {
        case "black-forest-labs/FLUX.1-schnell":
          parameters = { num_inference_steps: 4, guidance_scale: 0.0, negative_prompt: "blurry, low quality" };
          break;
        case "stabilityai/stable-diffusion-xl-base-1.0":
          parameters = { num_inference_steps: 30, guidance_scale: 7.5, negative_prompt: "blurry, low quality, distorted, bad anatomy" };
          break;
        case "stabilityai/stable-diffusion-v1-5":
          parameters = { num_inference_steps: 30, guidance_scale: 7.5, negative_prompt: "blurry, low quality, bad anatomy, distorted" };
          break;
        default:
          parameters = { num_inference_steps: 30, guidance_scale: 7.5, negative_prompt: "blurry, low quality, distorted, bad anatomy" };
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: parameters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Image generation failed with status: ${response.status}`;
        console.error(`HF API Error for ${modelId}:`, errorMessage);
        throw new Error(errorMessage);
      }

      const imageBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString("base64");
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      return res.json({ imageUrl });
    } catch (error: any) {
      console.error("Image generation error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  app.get("/api/status", (req, res) => {
    const hasApiKey = !!process.env.OPENROUTER_API_KEY;
    const hasHfKey = !!process.env.HUGGINGFACE_API_KEY;
    return res.json({ 
      configured: hasApiKey,
      chatEnabled: hasApiKey,
      imageEnabled: hasHfKey,
    });
  });

  app.get("/api/firebase-config", (req, res) => {
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_PROJECT_ID ? `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com` : undefined,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_PROJECT_ID ? `${process.env.VITE_FIREBASE_PROJECT_ID}.appspot.com` : undefined,
      appId: process.env.VITE_FIREBASE_APP_ID,
    };

    const configured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

    return res.json({
      configured,
      config: configured ? firebaseConfig : null,
    });
  });

  return httpServer;
}
