import { pipeline } from '@xenova/transformers';

// Whisper model instance (singleton)
let whisperPipeline: any = null;
let whisperLoadingPromise: Promise<any> | null = null;

// Get or initialize Whisper pipeline
const getWhisperPipeline = async () => {
    if (whisperPipeline) {
        return whisperPipeline;
    }
    
    // If already loading, wait for that promise
    if (whisperLoadingPromise) {
        return whisperLoadingPromise;
    }
    
    // Start loading
    whisperLoadingPromise = (async () => {
        try {
            console.log('Loading Whisper STT model (first time only, ~40MB)...');
            const pipe = await pipeline(
                'automatic-speech-recognition',
                'Xenova/whisper-tiny.en',
                { quantized: true } // Use quantized model for better performance
            );
            console.log('✓ Whisper STT model loaded successfully');
            whisperPipeline = pipe;
            return pipe;
        } catch (error) {
            console.error('Failed to load Whisper STT:', error);
            whisperLoadingPromise = null; // Reset so we can retry
            throw error;
        }
    })();
    
    return whisperLoadingPromise;
};

// Audio recording state
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let audioStream: MediaStream | null = null;

/**
 * Request microphone permission and start recording
 */
export const startRecording = async (): Promise<void> => {
    try {
        // Request microphone access
        audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                channelCount: 1,
                sampleRate: 16000, // Whisper expects 16kHz
            } 
        });
        
        // Create media recorder
        mediaRecorder = new MediaRecorder(audioStream, {
            mimeType: 'audio/webm;codecs=opus'
        });
        
        audioChunks = [];
        
        // Collect audio chunks
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        // Start recording
        mediaRecorder.start();
        console.log('🎤 Recording started');
    } catch (error) {
        console.error('Failed to start recording:', error);
        throw new Error('Microphone access denied or not available');
    }
};

/**
 * Stop recording and return the audio blob
 */
export const stopRecording = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        if (!mediaRecorder) {
            reject(new Error('No active recording'));
            return;
        }
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            // Clean up
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
                audioStream = null;
            }
            mediaRecorder = null;
            audioChunks = [];
            
            console.log('🎤 Recording stopped');
            resolve(audioBlob);
        };
        
        mediaRecorder.onerror = (error) => {
            reject(error);
        };
        
        mediaRecorder.stop();
    });
};

/**
 * Check if currently recording
 */
export const isRecording = (): boolean => {
    return mediaRecorder !== null && mediaRecorder.state === 'recording';
};

/**
 * Convert audio blob to text using Whisper
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
        const pipe = await getWhisperPipeline();

        // Create a URL for the blob - Whisper pipeline can handle this directly
        const audioUrl = URL.createObjectURL(audioBlob);

        try {
            // Transcribe using the blob URL
            console.log('🎤 Transcribing audio...');
            console.log('   Audio blob size:', audioBlob.size, 'bytes');
            console.log('   Audio blob type:', audioBlob.type);

            const result = await pipe(audioUrl);

            const text = result.text.trim();
            console.log('✓ Transcription complete:', text);

            // Clean up the blob URL
            URL.revokeObjectURL(audioUrl);

            if (!text || text.length === 0) {
                throw new Error('No speech detected. Please try speaking louder or closer to the microphone.');
            }

            return text;
        } catch (error) {
            // Clean up the blob URL in case of error
            URL.revokeObjectURL(audioUrl);
            throw error;
        }
    } catch (error) {
        console.error('Transcription failed:', error);
        console.error('Error details:', error);

        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('No speech detected')) {
                throw error; // Re-throw our custom error
            }
            throw new Error(`Failed to transcribe audio: ${error.message}`);
        }
        throw new Error('Failed to transcribe audio. Please try again.');
    }
};

/**
 * Record audio and transcribe in one step
 */
export const recordAndTranscribe = async (durationMs: number = 5000): Promise<string> => {
    await startRecording();
    
    // Wait for specified duration
    await new Promise(resolve => setTimeout(resolve, durationMs));
    
    const audioBlob = await stopRecording();
    const text = await transcribeAudio(audioBlob);
    
    return text;
};

/**
 * Check if microphone is available
 */
export const isMicrophoneAvailable = async (): Promise<boolean> => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some(device => device.kind === 'audioinput');
    } catch (error) {
        console.error('Failed to check microphone availability:', error);
        return false;
    }
};

