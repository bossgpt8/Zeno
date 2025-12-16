import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const chatRequestSchema = z.object({
  messages: z.array(z.any()),
  model: z.string(),
  customPrompt: z.string().optional(),
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

    const { messages, model, customPrompt } = parseResult.data;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY in environment variables.',
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
      role: 'system',
      content: systemContent,
    };

    const messagesWithSystem = [systemMessage, ...messages];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://bossai.vercel.app',
        'X-Title': 'BossAI',
      },
      body: JSON.stringify({
        model: model || 'amazon/nova-2-lite-v1:free',
        messages: messagesWithSystem,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'API Error' });
    }

    return res.json({
      content: data.choices?.[0]?.message?.content || 'No response generated',
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
