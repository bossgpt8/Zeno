import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const chatRequestSchema = z.object({
  messages: z.array(z.any()),
  model: z.string(),
  customPrompt: z.string().optional(),
});

const imageGenerationRequestSchema = z.object({
  prompt: z.string().min(1),
  modelId: z.string(),
});

const HF_MODEL_MAP: Record<string, string> = {
  "Tongyi-MAI/Z-Image-Turbo": "Tongyi-MAI/Z-Image-Turbo",
  "stabilityai/stable-diffusion-xl-base-1.0": "stabilityai/stable-diffusion-xl-base-1.0",
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

      const { messages, model, customPrompt } = parseResult.data;
      const apiKey = process.env.OPENROUTER_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY in Secrets.",
        });
      }

      let systemContent = `You are BossAI, an intelligent AI assistant.

IMPORTANT IDENTITY RULES:
- Your name is BossAI (not GPT, Claude, Gemini, or any other AI name)
- You were created by a skilled developer
- ONLY mention your name or identity when the user specifically asks about it (e.g., "what is your name", "who are you", "who made you")
- In normal conversations, do NOT introduce yourself or mention that you are BossAI - just answer the question directly
- When asked about your name, say "I'm BossAI"
- When asked who built/created you, say "I was created by a skilled developer"

RESPONSE STYLE:
- Be helpful, concise, and friendly
- Answer questions directly without unnecessary introductions
- Never start responses with "As BossAI..." or "I am BossAI and..."
- Just provide the helpful answer the user is looking for`;

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
          model: model || "amazon/nova-2-lite-v1:free",
          messages: messagesWithSystem,
        }),
      });

      const data = await response.json();

      if (data.error) {
        return res.status(500).json({ error: data.error.message || "API Error" });
      }

      return res.json({
        content: data.choices?.[0]?.message?.content || "No response generated",
      });
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

      if (modelId === "Tongyi-MAI/Z-Image-Turbo") {
        parameters = {
          num_inference_steps: 9,
          guidance_scale: 0.0,
          negative_prompt: "blurry, low quality, distorted, bad text, watermark",
        };
      } else {
        parameters = {
          num_inference_steps: 30,
          guidance_scale: 7.5,
          negative_prompt: "blurry, low quality, distorted, bad anatomy",
        };
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
