
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
                                {segment.imageUrl && (
                                    <div className="relative group">
                                        <img src={segment.imageUrl} alt="Story illustration" className="rounded-lg w-full h-auto" />
                                        <button 
                                            onClick={() => onEditImage(segment)}
                                            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Edit image"
                                        >
                                            <EditIcon />
                                        </button>
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
