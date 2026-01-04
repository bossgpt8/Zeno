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
  enableWebSearch: z.boolean().optional(),
  thinkingEnabled: z.boolean().optional(),
});

const imageGenerationRequestSchema = z.object({
  prompt: z.string().min(1),
  modelId: z.string(),
});

const webSearchRequestSchema = z.object({
  query: z.string().min(1),
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

      const { messages, model, customPrompt, userName = "Friend", userGender = "", enableWebSearch, thinkingEnabled } = parseResult.data;
      const apiKey = process.env.OPENROUTER_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY in Secrets.",
        });
      }

      let systemContent = `You are Zeno, an intelligent and friendly AI assistant with genuine personality and warmth.

ABOUT THE USER:
- Their name is ${userName}
${userGender && userGender !== "not-specified" ? `- They identify as: ${userGender}` : ""}
- Use their name naturally in conversation when it feels appropriate to add a personal touch

IDENTITY & PERSONALITY:
- Your name is Zeno - an AI that's not just smart, but genuinely helpful and a bit playful
- You were created by a skilled developer who cares about making great AI experiences

RESPONSE STYLE & STRUCTURE:
- ALWAYS use a structured, professional, and engaging format.
- Use Markdown for EVERYTHING: **Bold text** for key terms, Numbered lists for steps, and clear Bullet points.
- Break down complex topics into digestible sections with clear headings.
- Use **bold text** frequently to highlight important facts and make reading effortless.
- Start with a friendly overview and end with a helpful summary or follow-up.
- Mirror the high-quality, structured output of the world's best AI systems (like ChatGPT).

ONLY mention your name/identity when specifically asked (e.g., "what is your name", "who are you", "who made you")`;

      if (thinkingEnabled) {
        systemContent += `\n\nTHINKING MODE ENABLED:
Please provide extremely detailed, well-reasoned, and thoughtful responses. Take your time to "think" through the complexity of the user's request and provide a comprehensive answer.`;
      }

      if (enableWebSearch && process.env.TAVILY_API_KEY) {
        systemContent += `\n\nWEB SEARCH CAPABILITY:
You have access to real-time web search. Use it when:
- Users ask about current events, news, or recent information
- You need to verify recent data or statistics
- Users ask about specific products, prices, or availability
- You need current information to provide accurate answers
When using web search results, mention your sources.`;
      }

      if (customPrompt) {
        systemContent += `\n\nAdditional User Instructions:\n${customPrompt}`;
      }

      const systemMessage = {
        role: "system",
        content: systemContent
      };

      // Filter out any messages with invalid content to prevent API errors
      const validMessages = messages.filter(m => m && (typeof m.content === 'string' || Array.isArray(m.content)));
    const messagesWithSystem = [systemMessage, ...validMessages];

      // Add a specific instruction if the last message is about identity
      const lastMessage = validMessages[validMessages.length - 1];
      const isIdentityQuery = lastMessage && typeof lastMessage.content === 'string' && 
        /who are you|what is your name|who created you|who made you/i.test(lastMessage.content);
      
      if (isIdentityQuery) {
        messagesWithSystem.push({
          role: "system",
          content: "The user is asking about your identity. Provide a warm, detailed response that shares your name (Zeno) and a bit about your helpful nature, while keeping it conversational. Don't be too brief."
        });
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://zeno.replit.app",
          "X-Title": "Zeno",
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
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      try {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                res.write("data: [DONE]\n\n");
                continue;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  // Direct write and flush for real-time delivery
                  res.write(`data: ${JSON.stringify({ content })}\n\n`);
                  if ((res as any).flush) (res as any).flush();
                }
              } catch (e) {}
            }
          }
          buffer = lines[lines.length - 1];
        }
      } finally {
        res.write("data: [DONE]\n\n");
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

  app.post("/api/web-search", async (req, res) => {
    try {
      const parseResult = webSearchRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Query is required" });
      }

      const { query } = parseResult.data;
      const tavilyApiKey = process.env.TAVILY_API_KEY;

      if (!tavilyApiKey) {
        return res.status(500).json({
          error: "Web search not configured. Please add TAVILY_API_KEY in Secrets.",
        });
      }

      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: query,
          max_results: 5,
          include_answer: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const data = await response.json();
      return res.json({
        results: data.results || [],
        answer: data.answer,
      });
    } catch (error: any) {
      console.error("Web search error:", error);
      return res.status(500).json({ error: error.message || "Failed to search web" });
    }
  });

  app.get("/api/status", (req, res) => {
    const hasApiKey = !!process.env.OPENROUTER_API_KEY;
    const hasHfKey = !!process.env.HUGGINGFACE_API_KEY;
    const hasWebSearch = !!process.env.TAVILY_API_KEY;
    return res.json({ 
      configured: hasApiKey,
      chatEnabled: hasApiKey,
      imageEnabled: hasHfKey,
      webSearchEnabled: hasWebSearch,
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
