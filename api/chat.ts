import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const chatRequestSchema = z.object({
  messages: z.array(z.any()),
  model: z.string(),
  customPrompt: z.string().optional(),
  enableWebSearch: z.boolean().optional(),
});

async function searchWeb(query: string, apiKey: string) {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        max_results: 5,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      answer: data.answer,
    };
  } catch (error) {
    console.error('Web search error:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parseResult = chatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const { messages, model, customPrompt, enableWebSearch } = parseResult.data;
    const isHuggingFace = model?.startsWith('hf/');
    
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

    let messagesForAPI = [...messages];

    // Perform web search if enabled
    if (enableWebSearch && process.env.TAVILY_API_KEY) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage && lastUserMessage.role === 'user') {
        const userQuery = typeof lastUserMessage.content === 'string' 
          ? lastUserMessage.content 
          : lastUserMessage.content?.[0]?.text || '';
        
        if (userQuery) {
          const searchResults = await searchWeb(userQuery, process.env.TAVILY_API_KEY);
          if (searchResults && (searchResults.results.length > 0 || searchResults.answer)) {
            let searchContext = '\n\nWEB SEARCH RESULTS:\n';
            if (searchResults.answer) {
              searchContext += `Summary: ${searchResults.answer}\n\n`;
            }
            searchContext += 'Sources:\n';
            searchResults.results.slice(0, 5).forEach((result: any, i: number) => {
              searchContext += `${i + 1}. ${result.title} - ${result.url}\n   ${result.content}\n`;
            });

            // Append search results to last user message
            if (typeof lastUserMessage.content === 'string') {
              messagesForAPI[messagesForAPI.length - 1] = {
                ...lastUserMessage,
                content: lastUserMessage.content + searchContext,
              };
            }
          }
        }
      }
    }

    const systemMessage = {
      role: 'system',
      content: systemContent,
    };

    const messagesWithSystem = [systemMessage, ...messagesForAPI];

    let response;

    if (isHuggingFace) {
      // Use HuggingFace API
      const hfApiKey = process.env.HUGGINGFACE_API_KEY;
      if (!hfApiKey) {
        return res.status(500).json({
          error: 'HuggingFace API key not configured. Please add HUGGINGFACE_API_KEY in environment variables.',
        });
      }

      const modelName = model.replace('hf/', '');
      
      response = await fetch('https://api-inference.huggingface.co/models/' + modelName, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: messagesWithSystem.map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        return res.status(500).json({ error: data.error || 'HuggingFace API Error' });
      }

      let content = '';
      if (Array.isArray(data)) {
        content = data[0]?.generated_text || 'No response generated';
      } else if (data.generated_text) {
        content = data.generated_text;
      }

      return res.json({ content });
    } else {
      // Use OpenRouter API (default)
      const apiKey = process.env.OPENROUTER_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY in environment variables.',
        });
      }

      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://bossai.vercel.app',
          'X-Title': 'BossAI',
        },
        body: JSON.stringify({
          model: model || 'meta-llama/llama-3.3-70b-instruct:free',
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
    }
  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
