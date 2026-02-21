import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  error: string | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];
      
<<<<<<< HEAD
=======
      // FIXED: Removed hardcoded sampleRate to allow high-quality native audio
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
<<<<<<< HEAD
=======
          // Removed sampleRate: 16000 to prevent downsampling artifacts
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
        }
      });
      
      streamRef.current = stream;
      
<<<<<<< HEAD
      // Determine supported mime type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const options = {
        mimeType,
        audioBitsPerSecond: 128000
=======
      // FIXED: Added higher bitrate for better clarity
      const options = {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm',
        audioBitsPerSecond: 128000 // Higher quality (128kbps)
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorder.ondataavailable = (e) => {
<<<<<<< HEAD
        if (e.data && e.data.size > 0) {
=======
        if (e.data.size > 0) {
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
<<<<<<< HEAD
      mediaRecorder.start(); // No timeslice ensures smoother capture for short audio
=======
      mediaRecorder.start(1000); 
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
      
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
<<<<<<< HEAD
      setError('Microphone access failed. Check permissions.');
=======
      setError('Failed to access microphone. Please check permissions.');
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }
      
      mediaRecorderRef.current.onstop = () => {
<<<<<<< HEAD
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        
        // Cleanup tracks
=======
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
        });
        chunksRef.current = [];
        
        // Stop all tracks
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
<<<<<<< HEAD
        chunksRef.current = [];
=======
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
        setIsRecording(false);
        resolve(blob);
      };
      
<<<<<<< HEAD
      // Request final data before stopping
      mediaRecorderRef.current.requestData(); 
=======
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
      mediaRecorderRef.current.stop();
    });
  }, []);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    error
  };
}