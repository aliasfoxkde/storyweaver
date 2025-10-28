
import { GoogleGenAI, Modality, Chat } from "@google/genai";
import type { StorySegment } from "../types";
import { KokoroTTS } from "kokoro-js";

// FIX: Initialize GoogleGenAI with API Key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Using models with better free tier quotas
const storyGenerationModel = "gemini-1.5-flash"; // Better quota than 2.5-pro
const imageGenerationModel = "gemini-2.0-flash-exp"; // Alternative with higher limits
const speechGenerationModel = "gemini-2.0-flash-exp"; // Using same model for TTS

const storyPromptSystemInstruction = `You are a master storyteller for children. 
Your stories are imaginative, engaging, and always age-appropriate.
The user will provide prompts to guide the story.
You must continue the story with one new paragraph.
After the paragraph, on a new line, create a concise, visually descriptive prompt for an image that illustrates the paragraph. This prompt must start with "IMAGE PROMPT:".
Do not add any other formatting.
The story should be magical and fun.`;

let storyChat: Chat | null = null;

const getStoryChat = () => {
    if (!storyChat) {
        storyChat = ai.chats.create({
            model: storyGenerationModel,
            config: {
                systemInstruction: storyPromptSystemInstruction,
                temperature: 0.8,
            }
        });
    }
    return storyChat;
}

export const generateStorySegment = async (prompt: string): Promise<{storyText: string, imagePrompt: string}> => {
    try {
        // Try primary model first
        const chat = getStoryChat();
        const response = await chat.sendMessage({ message: prompt });

        const text = response.text.trim();
        const parts = text.split("IMAGE PROMPT:");

        if (parts.length < 2) {
            console.error("Model did not return an image prompt correctly.");
            return { storyText: text, imagePrompt: `A beautiful and magical illustration of: ${text}` };
        }

        const storyText = parts[0].trim();
        const imagePrompt = parts[1].trim();

        return { storyText, imagePrompt };
    } catch (error: any) {
        // Check if it's a quota exhaustion error
        const isQuotaError =
            error?.status === 'RESOURCE_EXHAUSTED' ||
            error?.message?.includes('quota') ||
            error?.message?.includes('RESOURCE_EXHAUSTED') ||
            error?.status === 429;

        if (isQuotaError) {
            console.warn('Primary model quota exhausted, using fallback model (gemma-3-27b-it)...');

            // Retry with fallback model (gemma-3-27b-it has 14,400 free requests/day)
            try {
                const fallbackChat = ai.chats.create({
                    model: 'gemma-3-27b-it',
                    config: {
                        systemInstruction: storyPromptSystemInstruction,
                        temperature: 0.8,
                    }
                });

                const fallbackResponse = await fallbackChat.sendMessage({ message: prompt });
                const text = fallbackResponse.text.trim();
                const parts = text.split("IMAGE PROMPT:");

                if (parts.length < 2) {
                    console.error("Fallback model did not return an image prompt correctly.");
                    return { storyText: text, imagePrompt: `A beautiful and magical illustration of: ${text}` };
                }

                const storyText = parts[0].trim();
                const imagePrompt = parts[1].trim();

                // Notify user that fallback was used
                console.info('✓ Story generated using fallback model');

                return { storyText, imagePrompt };
            } catch (fallbackError) {
                console.error('Fallback model also failed:', fallbackError);
                throw new Error('Both primary and fallback models failed. Please try again later.');
            }
        }

        // If it's not a quota error, rethrow the original error
        throw error;
    }
};

export const startNewStory = () => {
    storyChat = null;
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        // Use NanoGPT API for image generation (free tier, no quota limits)
        const response = await fetch('https://nano-gpt.com/api/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NANO_GPT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'qwen-image',
                prompt: prompt,
                n: 1,
                size: '1024x1024',
                response_format: 'b64_json', // Get base64 directly
                user: 'storyweaver-app'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`NanoGPT API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // Extract base64 image data from response
        if (data.data && data.data[0] && data.data[0].b64_json) {
            return data.data[0].b64_json;
        }

        // If URL format was returned instead, fetch and convert to base64
        if (data.data && data.data[0] && data.data[0].url) {
            const imageResponse = await fetch(data.data[0].url);
            const blob = await imageResponse.blob();
            return await blobToBase64(blob);
        }

        throw new Error("No image data returned from NanoGPT API.");
    } catch (error) {
        console.error("NanoGPT image generation failed, falling back to Gemini:", error);

        // Fallback to Gemini if NanoGPT fails
        const response = await ai.models.generateContent({
            model: imageGenerationModel,
            contents: {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }

        throw new Error("No image data returned from API.");
    }
};

// Helper function to convert Blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/png;base64,")
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: imageGenerationModel,
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType: mimeType,
                    },
                },
                { text: prompt },
            ],
        },
        // FIX: The config property responseModalities must be an array with a single Modality.IMAGE element.
        config: {
            responseModalities: [Modality.IMAGE],
        }
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("No edited image data returned from API.");
}

// Kokoro TTS instance (singleton to avoid reloading model)
let kokoroInstance: any = null;
let kokoroLoadingPromise: Promise<any> | null = null;

// Helper function to get or initialize Kokoro TTS
const getKokoroTTS = async () => {
    if (kokoroInstance) {
        return kokoroInstance;
    }

    // If already loading, wait for that promise
    if (kokoroLoadingPromise) {
        return kokoroLoadingPromise;
    }

    // Start loading
    kokoroLoadingPromise = (async () => {
        try {
            console.log('Loading Kokoro TTS model (first time only, ~82MB)...');
            const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
                dtype: "q8", // 8-bit quantized for smaller size and faster loading
                device: "wasm", // Use WebAssembly (works in all browsers)
            });
            console.log('✓ Kokoro TTS model loaded successfully');
            kokoroInstance = tts;
            return tts;
        } catch (error) {
            console.error('Failed to load Kokoro TTS:', error);
            kokoroLoadingPromise = null; // Reset so we can retry
            throw error;
        }
    })();

    return kokoroLoadingPromise;
};

// Helper function to convert Float32Array audio to WAV format base64
const audioToWavBase64 = (audioData: Float32Array, sampleRate: number): string => {
    // WAV file format constants
    const numChannels = 1; // Mono
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = audioData.length * bitsPerSample / 8;
    const fileSize = 44 + dataSize;

    // Create WAV buffer
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, fileSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Convert float32 audio data to int16 PCM
    let offset = 44;
    for (let i = 0; i < audioData.length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
    }

    // Convert to base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
        // Use Kokoro.js for browser-based TTS (100% local, no API calls!)
        const tts = await getKokoroTTS();

        const audio = await tts.generate(text, {
            voice: "af_heart", // Best quality voice (Grade A, female, American English)
        });

        // Convert audio to WAV format base64
        const base64Audio = audioToWavBase64(audio.audio, audio.sampling_rate);

        return base64Audio;
    } catch (error) {
        console.error("Kokoro TTS failed, falling back to Gemini:", error);

        // Fallback to Gemini TTS if Kokoro fails
        const response = await ai.models.generateContent({
            model: speechGenerationModel,
            contents: [{ parts: [{ text: `Say with a gentle, friendly voice: ${text}` }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                  },
              },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned from API.");
        }
        return base64Audio;
    }
};
