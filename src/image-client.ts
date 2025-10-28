import {
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageGenerationError,
  GeneratedImage,
  ImageGenerationMetrics
} from '@/types/image';
import { generateId } from '@/lib/utils';
import { runtimeEnv } from '@/lib/config/runtime-env';

export class ImageGenerationClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    } else {
      const config = runtimeEnv.getConfig();
      this.apiKey = config.nanoGptApiKey;
    }

    this.baseUrl = baseUrl || 'https://nano-gpt.com/v1';

    if (!this.apiKey) {
      const config = runtimeEnv.getConfig();
      const isProduction = config.isProduction;
      const errorMessage = isProduction
        ? 'NanoGPT API key is required for image generation. Please set NEXT_PUBLIC_NANO_GPT_API_KEY in your Cloudflare Pages "Variables & Secrets" section.'
        : 'NanoGPT API key is required for image generation. Please set NEXT_PUBLIC_NANO_GPT_API_KEY in your .env.local file.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Generate an image using Qwen-Image model
   */
  async generateImage(
    prompt: string,
    options: Partial<ImageGenerationRequest> = {}
  ): Promise<{ image: GeneratedImage; metrics: ImageGenerationMetrics }> {
    const startTime = Date.now();
    
    const request: ImageGenerationRequest = {
      model: 'qwen-image',
      prompt,
      n: 1,
      size: '1024x576',
      response_format: 'url',
      user: 'gemma-chat-user',
      ...options,
    };

    try {
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const requestLatency = Date.now() - startTime;

      if (!response.ok) {
        const errorData: ImageGenerationError = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ImageGenerationResponse = await response.json();
      const generationTime = Date.now() - startTime;

      if (!data.data || data.data.length === 0) {
        throw new Error('No image data received from API');
      }

      const imageData = data.data[0];

      // Handle both URL and base64 responses
      let imageUrl: string;
      if (imageData.url) {
        imageUrl = imageData.url;
      } else if (imageData.b64_json) {
        // Convert base64 to blob URL for consistent handling
        const byteCharacters = atob(imageData.b64_json);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        imageUrl = URL.createObjectURL(blob);
      } else {
        throw new Error('No image URL or base64 data received from API');
      }

      const generatedImage: GeneratedImage = {
        id: generateId(),
        url: imageUrl,
        prompt: request.prompt,
        revisedPrompt: imageData.revised_prompt,
        timestamp: new Date(),
        size: request.size || '1024x576',
        model: request.model,
      };

      const metrics: ImageGenerationMetrics = {
        requestLatency,
        generationTime,
        imageSize: request.size || '1024x576',
        model: request.model,
        timestamp: Date.now(),
      };

      return { image: generatedImage, metrics };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Image generation failed: ${errorMessage}`);
    }
  }

  /**
   * Download image as blob for local saving
   */
  async downloadImage(imageUrl: string): Promise<Blob> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      throw new Error(`Image download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate image generation request
   */
  validateRequest(request: Partial<ImageGenerationRequest>): string[] {
    const errors: string[] = [];

    if (!request.prompt || request.prompt.trim().length === 0) {
      errors.push('Prompt is required');
    }

    if (request.prompt && request.prompt.length > 1000) {
      errors.push('Prompt must be less than 1000 characters');
    }

    if (request.n !== undefined && (request.n < 1 || request.n > 4)) {
      errors.push('Number of images must be between 1 and 4');
    }

    const validSizes = ['256x256', '512x512', '1024x576', '1024x1024', '1792x1024', '1024x1792'];
    if (request.size && !validSizes.includes(request.size)) {
      errors.push(`Size must be one of: ${validSizes.join(', ')}`);
    }

    const validFormats = ['url', 'b64_json'];
    if (request.response_format && !validFormats.includes(request.response_format)) {
      errors.push(`Response format must be one of: ${validFormats.join(', ')}`);
    }

    return errors;
  }
}

// Export singleton instance factory (creates instance when needed)
export function getImageClient(): ImageGenerationClient | null {
  try {
    // Only create client in browser environment
    if (typeof window === 'undefined') {
      return null;
    }

    const config = runtimeEnv.getConfig();
    if (config.nanoGptApiKey) {
      return new ImageGenerationClient();
    }
    return null;
  } catch (error) {
    console.warn('Failed to create image client:', error);
    return null;
  }
}

// Legacy export for backward compatibility - getter function to avoid SSR issues
export function getImageClientSingleton(): ImageGenerationClient | null {
  return getImageClient();
}

// Dynamic getter to avoid SSR issues - always gets fresh instance
export const imageClient = typeof window !== 'undefined' ? (() => {
  let _instance: ImageGenerationClient | null = null;
  return () => {
    if (!_instance) {
      _instance = getImageClient();
    }
    return _instance;
  };
})() : () => null;
