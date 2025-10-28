
import React, { useState, useEffect } from 'react';
import { SendIcon, MicrophoneIcon } from './IconComponents';
import { startRecording, stopRecording, transcribeAudio, isRecording, isMicrophoneAvailable } from '../services/whisperService';

interface ChatInterfaceProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micAvailable, setMicAvailable] = useState(false);

  // Check microphone availability on mount
  useEffect(() => {
    isMicrophoneAvailable().then(setMicAvailable);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  const handleVoiceInput = async () => {
    if (isRecordingAudio) {
      // Stop recording and transcribe
      setIsRecordingAudio(false);
      setIsTranscribing(true);

      try {
        console.log('🎤 Stopping recording and starting transcription...');
        const audioBlob = await stopRecording();
        console.log('🎤 Audio blob received, size:', audioBlob.size, 'bytes');

        const text = await transcribeAudio(audioBlob);
        console.log('🎤 Transcription successful:', text);

        setPrompt(text);
      } catch (error) {
        console.error('Voice input failed:', error);

        // Provide more specific error messages
        let errorMessage = 'Voice input failed. Please try again or type your prompt.';
        if (error instanceof Error) {
          if (error.message.includes('No speech detected')) {
            errorMessage = 'No speech detected. Please speak louder or closer to the microphone and try again.';
          } else if (error.message.includes('Failed to load Whisper')) {
            errorMessage = 'Failed to load speech recognition model. Please check your internet connection and try again.';
          } else {
            errorMessage = `Voice input error: ${error.message}`;
          }
        }

        alert(errorMessage);
      } finally {
        setIsTranscribing(false);
      }
    } else {
      // Start recording
      try {
        console.log('🎤 Starting recording...');
        await startRecording();
        setIsRecordingAudio(true);
        console.log('🎤 Recording started successfully');
      } catch (error) {
        console.error('Failed to start recording:', error);

        let errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
        if (error instanceof Error && error.message.includes('not available')) {
          errorMessage = 'No microphone detected. Please connect a microphone and try again.';
        }

        alert(errorMessage);
      }
    }
  };

  const getPlaceholder = () => {
    if (isLoading) return "The storyteller is thinking...";
    if (isTranscribing) return "Transcribing your voice...";
    if (isRecordingAudio) return "Listening... (click mic to stop)";
    return "What should happen next?";
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
      <div className="relative">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={isLoading || isRecordingAudio || isTranscribing}
          className="w-full pl-4 pr-24 py-3 bg-gray-100 border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
        />

        {/* Voice input button */}
        {micAvailable && (
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isLoading || isTranscribing}
            className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
              isRecordingAudio
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
            aria-label={isRecordingAudio ? "Stop recording" : "Start voice input"}
            title={isRecordingAudio ? "Click to stop recording" : "Click to use voice input"}
          >
            <MicrophoneIcon />
          </button>
        )}

        {/* Send button */}
        <button
          type="submit"
          disabled={isLoading || !prompt.trim() || isRecordingAudio || isTranscribing}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          aria-label="Send prompt"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
};
