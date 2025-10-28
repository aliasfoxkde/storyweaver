
import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="text-center bg-white/60 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-bold text-purple-600 mb-4">
          StoryWeaver AI
        </h1>
        <p className="text-gray-700 text-lg md:text-2xl mb-8">
          Let&apos;s create a magical story together! I&apos;ll draw pictures and read every page for you.
        </p>
        <p className="text-gray-600 text-base md:text-xl mb-10">
          How should our story begin?
        </p>
        <button
          onClick={onStart}
          className="bg-pink-500 text-white font-bold py-4 px-10 rounded-full text-xl md:text-2xl shadow-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-transform transform hover:scale-105 active:scale-95"
        >
          Start the Adventure!
        </button>
      </div>
    </div>
  );
};
