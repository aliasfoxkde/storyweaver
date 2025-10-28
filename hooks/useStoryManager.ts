
import { useState, useCallback } from 'react';
import { StorySegment } from '../types';
import { generateStorySegmentStream, generateImage, editImage, startNewStory as resetStoryChat } from '../services/geminiService';

export const useStoryManager = () => {
    const [storySegments, setStorySegments] = useState<StorySegment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRequestTime, setLastRequestTime] = useState<number>(0);
    const MIN_REQUEST_INTERVAL = 3000; // 3 seconds between requests

    const startNewStory = useCallback(() => {
        setStorySegments([]);
        setError(null);
        setIsLoading(false);
        resetStoryChat();
    }, []);

    const addStorySegment = useCallback(async (userPrompt: string) => {
        // Rate limiting check
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;

        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
            const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000);
            setError(`Please wait ${waitTime} more second${waitTime > 1 ? 's' : ''} before making another request.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        setLastRequestTime(now);

        const userSegment: StorySegment = {
            id: `${Date.now().toString()  }-user`,
            text: userPrompt,
            isUser: true,
        };

        setStorySegments(prev => [...prev, userSegment]);

        // Create a placeholder AI segment for streaming
        const aiSegmentId = `${Date.now().toString()  }-ai`;
        const placeholderSegment: StorySegment = {
            id: aiSegmentId,
            text: '',
            isUser: false,
            imageUrl: undefined,
            imagePrompt: undefined,
        };

        setStorySegments(prev => [...prev, placeholderSegment]);

        try {
            let fullStoryText = '';
            let imagePrompt = '';

            // Stream the story text
            for await (const chunk of generateStorySegmentStream(userPrompt)) {
                if (chunk.textChunk) {
                    fullStoryText += chunk.textChunk;

                    // Update the segment with streaming text
                    setStorySegments(prev => prev.map(seg =>
                        seg.id === aiSegmentId
                            ? { ...seg, text: fullStoryText }
                            : seg
                    ));
                }

                if (chunk.isComplete && chunk.storyText && chunk.imagePrompt) {
                    fullStoryText = chunk.storyText;
                    imagePrompt = chunk.imagePrompt;
                }
            }

            // Generate image after text is complete
            console.log('📖 Story text complete, generating image...');
            const imageBase64 = await generateImage(imagePrompt);
            const imageUrl = `data:image/png;base64,${imageBase64}`;

            // Update segment with final image
            setStorySegments(prev => prev.map(seg =>
                seg.id === aiSegmentId
                    ? { ...seg, text: fullStoryText, imageUrl, imagePrompt }
                    : seg
            ));

        } catch (err: any) {
            console.error("Failed to generate story segment:", err);

            // Better error handling for quota issues
            if (err?.status === 'RESOURCE_EXHAUSTED' || err?.message?.includes('quota')) {
                setError("We've used up our magic for today! Please try again tomorrow or contact support.");
            } else {
                setError("Oh no! The magic ink spilled. Please try again.");
            }

            // Remove both user prompt and placeholder AI segment if generation fails
            setStorySegments(prev => prev.slice(0, -2));
        } finally {
            setIsLoading(false);
        }
    }, [lastRequestTime]);
    
    const updateImage = useCallback(async (segmentId: string, editPrompt: string) => {
        const segmentToUpdate = storySegments.find(s => s.id === segmentId);
        if (!segmentToUpdate?.imageUrl) {return;}

        setIsLoading(true);
        setError(null);
        try {
            // Assumes imageUrl is a data URL
            const base64Data = segmentToUpdate.imageUrl.split(',')[1];
            const newImageBase64 = await editImage(base64Data, 'image/png', editPrompt);
            const newImageUrl = `data:image/png;base64,${newImageBase64}`;

            setStorySegments(prev => prev.map(s => 
                s.id === segmentId ? { ...s, imageUrl: newImageUrl } : s
            ));
        } catch (err) {
            console.error("Failed to edit image:", err);
            setError("The magic paintbrush slipped! Please try editing again.");
        } finally {
            setIsLoading(false);
        }
    }, [storySegments]);

    return {
        storySegments,
        isLoading,
        error,
        addStorySegment,
        updateImage,
        startNewStory,
    };
};
