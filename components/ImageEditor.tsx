
import React, { useState } from 'react';
import type { StorySegment } from '../types';
import { CloseIcon, SendIcon } from './IconComponents';

interface ImageEditorProps {
    segment: StorySegment;
    onClose: () => void;
    onSave: (segmentId: string, editPrompt: string) => void;
    isLoading: boolean;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ segment, onClose, onSave, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            onSave(segment.id, prompt);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative animate-fade-in-up flex flex-col overflow-hidden" style={{maxHeight: '90vh'}}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <CloseIcon />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 text-center p-6 border-b">Edit Illustration</h2>
                
                <div className="flex-1 p-6 overflow-y-auto">
                    <img src={segment.imageUrl} alt="Illustration to edit" className="w-full h-auto rounded-lg mb-4" />
                    <p className="text-sm text-gray-600 mb-2"><strong>Original prompt:</strong> {segment.imagePrompt}</p>
                    
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="edit-prompt" className="font-semibold text-gray-700 block mb-2">How would you like to change the image?</label>
                        <div className="relative">
                           <input
                                id="edit-prompt"
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., add a friendly dragon"
                                disabled={isLoading}
                                className="w-full pl-4 pr-12 py-3 bg-gray-100 border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                            />
                             <button
                                type="submit"
                                disabled={isLoading || !prompt.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                aria-label="Apply edit"
                            >
                                {isLoading ? 
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> 
                                    : <SendIcon />
                                }
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};
