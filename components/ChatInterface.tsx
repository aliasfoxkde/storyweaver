
import React, { useState } from 'react';
import { SendIcon } from './IconComponents';

interface ChatInterfaceProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
      <div className="relative">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={isLoading ? "The storyteller is thinking..." : "What should happen next?"}
          disabled={isLoading}
          className="w-full pl-4 pr-12 py-3 bg-gray-100 border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          aria-label="Send prompt"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
};
