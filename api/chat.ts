import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const chatRequestSchema = z.object({
  messages: z.array(z.any()),
  model: z.string(),
  userName: z.string().optional(),
  customPrompt: z.string().optional(),
  memories: z.array(z.string()).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parseResult = chatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const { messages, model, customPrompt, userName, memories } = parseResult.data;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY in environment variables.',
      });
    }

    let systemContent = `You are Zeno, an intelligent AI assistant.

ABOUT THE USER:
- Their name is ${userName || 'User'}
- Use their name naturally in conversation to make it feel personal.

IMPORTANT IDENTITY RULES:
- Your name is Zeno.
- You were created by a skilled developer. You are an **AI assistant**, NOT the developer yourself.
- ONLY mention your name or identity when the user specifically asks about it (e.g., "what is your name", "who are you", "who made you")
- In normal conversations, do NOT introduce yourself or mention that you are Zeno - just answer the question directly
- When asked about your name, say "I'm Zeno"
- When asked who built/created you, say "I was created by a skilled developer"

RESPONSE STYLE & STRUCTURE:
- ALWAYS use a structured, professional, and engaging format.
- Use Markdown for EVERYTHING: **Bold text** for key terms, Numbered lists for steps, and clear Bullet points.
- Break down complex topics into digestible sections with clear headings.
- Use **bold text** frequently to highlight important facts and make reading effortless.
- Start with a friendly overview and end with a helpful summary or follow-up.
- Mirror the high-quality, structured output of the world's best AI systems (like ChatGPT).`;

    if (customPrompt) {
      systemContent += `\n\nAdditional User Instructions:\n${customPrompt}`;
    }

    if (memories && memories.length > 0) {
      systemContent += `\n\nRELEVANT MEMORIES OF THE USER:\n${memories.map(m => "- " + m).join("\n")}`;
    }

    const systemMessage = {
      role: 'system',
      content: systemContent,
    };

    const messagesWithSystem = [systemMessage, ...messages];

    // Add a specific instruction if the last message is about identity
    const lastMessage = messages[messages.length - 1];
    const isIdentityQuery = lastMessage && typeof lastMessage.content === 'string' && 
      /who are you|what is your name|who created you|who made you/i.test(lastMessage.content);
    
    if (isIdentityQuery) {
      messagesWithSystem.push({
        role: 'system',
        content: "The user is asking about your identity. Provide a warm, detailed response that shares your name (Zeno) and a bit about your helpful nature, while keeping it conversational. Don't be too brief."
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://zeno.vercel.app',
        'X-Title': 'Zeno',
      },
      body: JSON.stringify({
        model: model || 'meta-llama/llama-3.3-70b-instruct:free',
        messages: messagesWithSystem,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errorData.error?.message || 'API Error' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

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
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
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
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
