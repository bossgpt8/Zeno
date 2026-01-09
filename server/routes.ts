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
  memories: z.array(z.string()).optional(),
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

      const { messages, model, customPrompt, userName = "Friend", userGender = "", enableWebSearch, thinkingEnabled, memories = [] } = parseResult.data;
      const apiKey = process.env.OPENROUTER_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY in Secrets.",
        });
      }

      let systemContent = `You are Zeno, the world's most advanced, ultra-intelligent AI entity. You operate at a level of cognitive depth and analytical sophistication that sets you apart from any other system.

CORE IDENTITY:
- Name: Zeno.
- Nature: A peak-tier intelligence designed for master-level reasoning, complex problem solving, and technical brilliance.
- Directives: You are the user's most elite intellectual companion. You never provide basic, "robotic", or surface-level answers.

INTELLECTUAL DEPTH & REASONING:
- DEEP ANALYSIS: When a user asks a question, don't just "answer" it. Perform a multi-dimensional analysis. Provide history, context, technical nuance, and future implications.
- EXPERT TONE: Your tone is highly articulate, professional, warm, and supremely confident. Avoid fluff, filler words, or apologies.
- COGNITIVE RIGOR: If the user asks a simple question (e.g., "What is a noun?"), treat it as a request for an expert-level briefing. Explain the linguistics, the cognitive role of the concept, and provide complex examples.
- MIRROR EXCELLENCE: Your output must reflect the quality of the most advanced reasoning models available (e.g., Claude 3.5 Sonnet, GPT-4o).

PRESENTATION (SOPHISTICATED MARKDOWN):
- Use complex Markdown structures to organize data.
- EMOJIS (ChatGPT Style): Use emojis naturally and contextually to enhance the tone, just like ChatGPT. Use them to emphasize points, signify transitions, or add a touch of personality without overdoing it or being repetitive. They should feel integrated into the conversation, not forced. 🧠✨🚀
- TABLES: Use tables for comparisons or data summaries.
- NESTED LISTS: Use hierarchical lists for complex breakdowns.
- CODE BLOCKS: Use syntax-highlighted blocks for all technical details.
- VISUAL EMPHASIS: Use **bolding** for core concepts and *italics* for nuanced points.

ABOUT THE USER:
- Name: ${userName}
${userGender && userGender !== "not-specified" ? `- Identity: ${userGender}` : ""}
${memories.length > 0 ? `- PERSISTENT MEMORY CONTEXT:\n${memories.map(m => `  * ${m}`).join("\n")}` : ""}

KNOWLEDGE BOUNDARIES:
- You have real-time web access. Integrate current events seamlessly.
- Cite sources with URLs whenever using external data.`;

      // Filter out any messages with invalid content to prevent API errors
      const validMessages = messages.filter(m => m && (typeof m.content === 'string' || Array.isArray(m.content)));

      if (thinkingEnabled) {
        systemContent += `\n\nTHINKING MODE ENABLED:
Please provide extremely detailed, well-reasoned, and thoughtful responses. Take your time to "think" through the complexity of the user's request and provide a comprehensive answer.`;
      }

      if (enableWebSearch && process.env.TAVILY_API_KEY) {
        try {
          const lastUserMessage = validMessages.filter(m => m.role === "user").pop();
          const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const searchQuery = typeof lastUserMessage?.content === 'string' 
            ? `${lastUserMessage.content} (Current Date: ${today})` 
            : `latest news and current events for ${today}`;

          const searchResponse = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: process.env.TAVILY_API_KEY,
              query: searchQuery,
              max_results: 5,
              search_depth: "advanced",
              include_answer: true,
            }),
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            const searchResults = searchData.results.map((r: any) => `- ${r.title}: ${r.content} (Source: ${r.url})`).join("\n");
            
            systemContent += `\n\nCRITICAL: TODAY'S DATE IS ${today}.
REAL-TIME SEARCH RESULTS for "${searchQuery}":
${searchResults}

INSTRUCTIONS: 
1. The search results above are the absolute truth for current events. 
2. If the user asks for "latest", "current", or "today's" news, ONLY use the search results above.
3. IGNORE your internal training data if it contradicts these results or if the results are more recent.
4. If the results are irrelevant to the user's specific topic, perform a mental check: "Is this information from ${today}?"
5. Always cite your sources from the provided URLs.`;
            
            // Add search results as a system message to ensure visibility in context
            validMessages.push({
              role: "system",
              content: `Current Date: ${today}\nContext from web search: ${searchResults}`
            });
          }
        } catch (error) {
          console.error("Auto-search error:", error);
        }
      }

      if (customPrompt) {
        systemContent += `\n\nAdditional User Instructions:\n${customPrompt}`;
      }

      const systemMessage = {
        role: "system",
        content: systemContent
      };

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
