
import React, { useRef, useEffect } from 'react';
import { StorySegment } from '../types';
import { LoadingPencil } from './LoadingPencil';
import { EditIcon } from './IconComponents';

interface StoryPageProps {
  segments: StorySegment[];
  isLoading: boolean;
  onEditImage: (segment: StorySegment) => void;
}

export const StoryPage: React.FC<StoryPageProps> = ({ segments, isLoading, onEditImage }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [segments, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-100">
            {segments.map((segment) => (
                <div key={segment.id} className={`flex ${segment.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl p-4 rounded-2xl shadow-md ${segment.isUser ? 'bg-purple-500 text-white' : 'bg-white'}`}>
                        {segment.isUser ? (
                             <p className="text-lg">{segment.text}</p>
                        ) : (
                            <div className="space-y-4">
                                {/* Show image or placeholder */}
                                {segment.text && (
                                    <div className="relative group">
                                        {segment.imageUrl ? (
                                            <>
                                                <img
                                                    src={segment.imageUrl}
                                                    alt="Story illustration"
                                                    className="rounded-lg w-full h-auto opacity-0 animate-fade-in"
                                                    style={{ animation: 'fadeIn 0.5s ease-in-out forwards' }}
                                                />
                                                <button
                                                    onClick={() => onEditImage(segment)}
                                                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label="Edit image"
                                                >
                                                    <EditIcon />
                                                </button>
                                            </>
                                        ) : (
                                            /* Image loading placeholder */
                                            <div className="rounded-lg w-full aspect-video bg-gradient-to-br from-purple-200 via-pink-200 to-yellow-200 animate-pulse flex items-center justify-center relative overflow-hidden">
                                                {/* Animated shimmer effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>

                                                {/* Loading content */}
                                                <div className="relative z-10 text-center p-6">
                                                    <div className="mb-4">
                                                        <svg className="w-16 h-16 mx-auto text-purple-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-purple-600 font-semibold text-lg">Illustrating your story...</p>
                                                    <div className="flex justify-center mt-3 space-x-1">
                                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <p className="text-gray-700 text-lg leading-relaxed">{segment.text}</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-center">
                    <LoadingPencil />
                </div>
            )}
            <div ref={endOfMessagesRef} />
        </div>
    );
};
