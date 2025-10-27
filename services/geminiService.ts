
import { GoogleGenAI, Modality, Chat } from "@google/genai";
import type { StorySegment } from "../types";

// FIX: Initialize GoogleGenAI with API Key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const storyGenerationModel = "gemini-2.5-pro";
const imageGenerationModel = "gemini-2.5-flash-image";
const speechGenerationModel = "gemini-2.5-flash-preview-tts";

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
};

export const startNewStory = () => {
    storyChat = null;
};

export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: imageGenerationModel,
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        // FIX: The config property responseModalities must be an array with a single Modality.IMAGE element.
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

export const generateSpeech = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: speechGenerationModel,
        contents: [{ parts: [{ text: `Say with a gentle, friendly voice: ${text}` }] }],
        config: {
          // FIX: The config property responseModalities must be an array with a single Modality.AUDIO element.
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
};
