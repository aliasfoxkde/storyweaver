
import React from 'react';
import type { StorySegment } from '../types';

interface HistoryPanelProps {
  segments: StorySegment[];
  isOpen: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ segments, isOpen }) => {
  return (
    <aside className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white/80 backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-in-out z-30 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Story So Far</h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {segments.map(segment => (
                    <div key={segment.id} className={`p-3 rounded-lg ${segment.isUser ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                        <span className="font-bold text-sm">{segment.isUser ? 'You:' : 'Storyteller:'}</span>
                        <p className="text-sm">{segment.text}</p>
                    </div>
                ))}
                {segments.length === 0 && <p className="text-gray-500">Your adventure hasn't begun yet!</p>}
            </div>
        </div>
    </aside>
  );
};
