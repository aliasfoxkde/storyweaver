
import { useState, useCallback, useRef, useEffect } from 'react';

// Base64 decoding function
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Raw PCM data to AudioBuffer decoding function
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const useAudioPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    
    useEffect(() => {
        // Initialize AudioContext on the client-side after the first user interaction (or component mount)
        // Suspended by default and needs to be resumed by a user gesture.
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        return () => {
            void audioContextRef.current?.close();
        };
    }, []);

    const playAudio = useCallback(async (base64Audio: string) => {
        const audioContext = audioContextRef.current;
        if (!audioContext) {return;}

        // Resume context if it's suspended
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // Stop any currently playing audio
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
        }

        setIsPlaying(true);
        try {
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);

            source.onended = () => {
                setIsPlaying(false);
                sourceNodeRef.current = null;
            };

            source.start();
            sourceNodeRef.current = source;
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
        }
    }, []);

    return { playAudio, isPlaying };
};
