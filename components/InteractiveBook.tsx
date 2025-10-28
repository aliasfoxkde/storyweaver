import React, { useState, useMemo, useCallback } from 'react';
import type { StorySegment } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { generateSpeech } from '../services/geminiService';
import { CloseIcon, ArrowLeftIcon, ArrowRightIcon, SpeakerIcon } from './IconComponents';

interface InteractiveBookProps {
  storySegments: StorySegment[];
  onClose: () => void;
}

export const InteractiveBook: React.FC<InteractiveBookProps> = ({ storySegments, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const { playAudio, isPlaying } = useAudioPlayer();

  const bookPages = useMemo(
    () => storySegments.filter(segment => !segment.isUser && segment.imageUrl),
    [storySegments]
  );
  
  const currentPageData = bookPages[currentPage];

  const handleNextPage = () => {
    if (currentPage < bookPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePlayAudio = useCallback(async () => {
      if (isPlaying || isTTSLoading || !currentPageData) {
        return;
      }
      setIsTTSLoading(true);
      try {
        const audioData = await generateSpeech(currentPageData.text);
        if (audioData) {
            await playAudio(audioData);
        }
      } catch (err) {
          console.error("Failed to play book audio", err);
      } finally {
          setIsTTSLoading(false);
      }
  }, [playAudio, isPlaying, isTTSLoading, currentPageData]);

  if (!currentPageData) {
      return (
           <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 text-white p-4">
                <p className="text-xl mb-4">This book has no illustrated pages yet!</p>
                <button onClick={onClose} className="bg-purple-500 text-white font-bold py-2 px-6 rounded-full">
                    Go Back
                </button>
            </div>
      )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-50">
        <CloseIcon />
      </button>

      <div className="w-full max-w-5xl aspect-[4/3] bg-white rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 relative animate-fade-in-up">
            <div className="w-full md:w-1/2 h-1/2 md:h-full bg-gray-100 rounded-lg overflow-hidden">
                {currentPageData.imageUrl ? (
                    <img
                        src={currentPageData.imageUrl}
                        alt="Story illustration"
                        className="w-full h-full object-cover opacity-0 animate-fade-in"
                        style={{ animation: 'fadeIn 0.5s ease-in-out forwards' }}
                    />
                ) : (
                    /* Image loading placeholder */
                    <div className="w-full h-full bg-gradient-to-br from-purple-200 via-pink-200 to-yellow-200 animate-pulse flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        <div className="relative z-10 text-center p-6">
                            <div className="mb-4">
                                <svg className="w-16 h-16 mx-auto text-purple-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-purple-600 font-semibold text-lg">Illustrating your story...</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center text-center md:text-left relative">
                 <p className="flex-grow text-gray-700 text-xl md:text-2xl leading-relaxed overflow-y-auto">
                    {currentPageData.text}
                 </p>
                 <button
                    onClick={handlePlayAudio}
                    disabled={isPlaying || isTTSLoading}
                    className="mt-4 mx-auto md:mx-0 bg-yellow-400 text-yellow-800 rounded-full p-4 shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-transform transform hover:scale-110 active:scale-100"
                    aria-label={isTTSLoading ? "Loading voice..." : "Read page aloud"}
                    title={isTTSLoading ? "Loading text-to-speech model..." : "Click to hear the story"}
                >
                    {isTTSLoading ? (
                        <span className="text-sm font-semibold">Loading...</span>
                    ) : (
                        <SpeakerIcon />
                    )}
                </button>
            </div>
      </div>
      
       {/* Navigation */}
      <div className="w-full max-w-5xl mt-4 flex justify-between items-center text-white">
        <button 
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="p-3 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
            <ArrowLeftIcon />
        </button>
        <span className="font-semibold text-lg">{`Page ${currentPage + 1} of ${bookPages.length}`}</span>
        <button 
            onClick={handleNextPage}
            disabled={currentPage >= bookPages.length - 1}
            className="p-3 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
            <ArrowRightIcon />
        </button>
      </div>

    </div>
  );
};