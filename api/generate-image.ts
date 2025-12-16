import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const imageGenerationRequestSchema = z.object({
  prompt: z.string().min(1),
  modelId: z.string(),
});

const HF_MODEL_MAP: Record<string, string> = {
  'Tongyi-MAI/Z-Image-Turbo': 'Tongyi-MAI/Z-Image-Turbo',
  'stabilityai/stable-diffusion-xl-base-1.0': 'stabilityai/stable-diffusion-xl-base-1.0',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parseResult = imageGenerationRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Missing prompt or modelId in request body' });
    }

    const { prompt, modelId } = parseResult.data;
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;

    if (!hfApiKey) {
      return res.status(500).json({
        error: 'Hugging Face API key not configured. Please add HUGGINGFACE_API_KEY in environment variables.',
      });
    }

    const selectedHFModel = HF_MODEL_MAP[modelId];
    if (!selectedHFModel) {
      return res.status(400).json({ error: `Invalid image model ID: ${modelId}` });
    }

    const API_URL = `https://router.huggingface.co/hf-inference/models/${selectedHFModel}`;
    let parameters: Record<string, any> = {};

    if (modelId === 'Tongyi-MAI/Z-Image-Turbo') {
      parameters = {
        num_inference_steps: 9,
        guidance_scale: 0.0,
        negative_prompt: 'blurry, low quality, distorted, bad text, watermark',
      };
    } else {
      parameters = {
        num_inference_steps: 30,
        guidance_scale: 7.5,
        negative_prompt: 'blurry, low quality, distorted, bad anatomy',
      };
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json',
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
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    return res.json({ imageUrl });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
}
