import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
  isSupported: boolean;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<any>(null); // ✅ Track the timer

  // 1. Check Support & Load Voices
  useEffect(() => {
    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);
    
    if (supported) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
        }
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // 2. Select Best Voice
  const getBestVoice = useCallback(() => {
    if (voices.length === 0) return null;
    
    const voicePreferences = [
      (v: SpeechSynthesisVoice) => v.name.includes('Neural') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.includes('Premium') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.includes('Google US English'),
      (v: SpeechSynthesisVoice) => v.name.includes('Google UK English'),
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.name.includes('Online') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name === 'Samantha',
      (v: SpeechSynthesisVoice) => v.name === 'Daniel',
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
    ];
    
    for (const preference of voicePreferences) {
      const voice = voices.find(preference);
      if (voice) return voice;
    }
    
    return voices[0];
  }, [voices]);

  // 3. Stop Function (Fixed to clear timer)
  const stop = useCallback(() => {
    if (isSupported) {
      // ✅ FIX: Clear any pending speech start
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  // 4. Speak Function
  const speak = useCallback((text: string) => {
    if (!isSupported) return;
    
    // ✅ FIX: Stop previous audio & clear timer before starting new one
    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const bestVoice = getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsSpeaking(false);
    };
    
    const processedText = text
      .replace(/\./g, '..') 
      .replace(/\?/g, '?..') 
      .replace(/,/g, ','); 
    
    utterance.text = processedText;
    utteranceRef.current = utterance;
    
    // ✅ FIX: Save timer ID to ref so we can cancel it if user leaves
    timeoutRef.current = setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
    
  }, [isSupported, getBestVoice, stop]);

  // ✅ FIX: Cleanup on Unmount (Safety Net)
  useEffect(() => {
    return () => {
      stop(); // Ensure everything dies when component unmounts
    };
  }, [stop]);

  return {
    isSpeaking,
    speak,
    stop,
    isSupported
  };
}