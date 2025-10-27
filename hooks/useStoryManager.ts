
import { useState, useCallback } from 'react';
import { StorySegment } from '../types';
import { generateStorySegment, generateImage, editImage, startNewStory as resetStoryChat } from '../services/geminiService';

export const useStoryManager = () => {
    const [storySegments, setStorySegments] = useState<StorySegment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startNewStory = useCallback(() => {
        setStorySegments([]);
        setError(null);
        setIsLoading(false);
        resetStoryChat();
    }, []);

    const addStorySegment = useCallback(async (userPrompt: string) => {
        setIsLoading(true);
        setError(null);

        const userSegment: StorySegment = {
            id: Date.now().toString() + '-user',
            text: userPrompt,
            isUser: true,
        };
        
        setStorySegments(prev => [...prev, userSegment]);
        
        try {
            const { storyText, imagePrompt } = await generateStorySegment(userPrompt);
            const imageBase64 = await generateImage(imagePrompt);
            const imageUrl = `data:image/png;base64,${imageBase64}`;

            const aiSegment: StorySegment = {
                id: Date.now().toString() + '-ai',
                text: storyText,
                isUser: false,
                imageUrl: imageUrl,
                imagePrompt: imagePrompt,
            };

            setStorySegments(prev => [...prev, aiSegment]);

        } catch (err) {
            console.error("Failed to generate story segment:", err);
            setError("Oh no! The magic ink spilled. Please try again.");
            // Remove the user prompt if AI fails
            setStorySegments(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const updateImage = useCallback(async (segmentId: string, editPrompt: string) => {
        const segmentToUpdate = storySegments.find(s => s.id === segmentId);
        if (!segmentToUpdate || !segmentToUpdate.imageUrl) return;

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
