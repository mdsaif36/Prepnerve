import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; 
import { 
  Mic, StopCircle, LogOut, Code, 
  Cpu, Clock, SkipForward, ShieldAlert, AlertTriangle, Lock
} from "lucide-react";
import Interviewer3D, { InterviewState } from "@/components/Interviewer3D";
import CodeEditor from "@/components/CodeEditor";
import Navbar from "@/components/Navbar";
<<<<<<< HEAD
import NeuralSpine from "@/components/NeuralSpine";
=======
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useProctoring } from "@/hooks/useProctoring";
import { useAuth } from "@/hooks/useAuth"; 
<<<<<<< HEAD
import { useAudioRecorder } from "@/hooks/useAudioRecorder"; 

const SERVER_URL = "http://localhost:8000";
=======

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// Direct reference to your Groq-powered Node.js server
const SERVER_URL = "https://prepnerveserver.onrender.com/api/interview";
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea

const InterviewSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); 
  
  const topic = location.state?.topic || "Full Stack Developer";
<<<<<<< HEAD
  const resumeData = location.state?.resumeData; 
  const selectedDuration = location.state?.duration || 30; 

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();
  const { startRecording, stopRecording, isRecording } = useAudioRecorder();

  // --- STATE ---
  const [sessionId, setSessionId] = useState<string | null>(null);
=======
  const resumeData = location.state?.resumeData;
  const selectedDuration = location.state?.duration || 30; 

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();

  // --- STATE ---
  const [sessionId, setSessionId] = useState<number | null>(null);
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
  const [loading, setLoading] = useState(true);
  
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
<<<<<<< HEAD
  
  const [interviewState, setInterviewState] = useState<InterviewState>('idle');
  const [userTranscript, setUserTranscript] = useState("");
  const [neuralWords, setNeuralWords] = useState<{word: string, description: string}[]>([]);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false); 
  
=======
  const [isRecording, setIsRecording] = useState(false);
  const [interviewState, setInterviewState] = useState<InterviewState>('idle');
  const [userTranscript, setUserTranscript] = useState("");
  
  const recognitionRef = useRef<any>(null);
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
  const [timeLeft, setTimeLeft] = useState(selectedDuration * 60);
  const [isCoding, setIsCoding] = useState(false); 
  const [starterCode, setStarterCode] = useState("// Code will appear here if AI requests it...");

  const [showWarning, setShowWarning] = useState(false);

<<<<<<< HEAD
  // ✅ NEW: Ref to track exactly how long the user recorded
  const recordingStartTime = useRef<number>(0);

=======
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
  // --- PROCTORING ---
  const { violationCount, triggerFullScreen, isFullScreen, lastViolationType } = useProctoring({
    active: !loading && sessionId !== null, 
    enableTabSwitchDetection: true,
    enableFullScreen: true,
    disableCopyPaste: true,
    maxViolations: 2, 
    onTerminate: () => handleFinish(true) 
  });

  useEffect(() => {
    triggerFullScreen();
<<<<<<< HEAD
    const forceFs = () => { triggerFullScreen(); window.removeEventListener('click', forceFs); };
=======
    const forceFs = () => {
        triggerFullScreen();
        window.removeEventListener('click', forceFs);
    };
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
    window.addEventListener('click', forceFs);
    return () => window.removeEventListener('click', forceFs);
  }, [triggerFullScreen]);

  useEffect(() => {
    if (violationCount > 0 && violationCount < 2) {
      setShowWarning(true);
      const timer = setTimeout(() => setShowWarning(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [violationCount]);

<<<<<<< HEAD
  // INITIALIZE SESSION
=======
  // INITIALIZE SESSION via Node.js Server (Groq)
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
  useEffect(() => {
    const initSession = async () => {
      try {
        setInterviewState('preparing');
        const userEmail = user?.email || "guest@prepnerve.com";
<<<<<<< HEAD
        const safeResumeData = typeof resumeData === 'object' ? JSON.stringify(resumeData) : (resumeData || "");
=======
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea

        const res = await axios.post(`${SERVER_URL}/start`, {
            email: userEmail,
            topic: topic,
<<<<<<< HEAD
            resumeData: safeResumeData
=======
            resumeData: resumeData
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
        });

        setSessionId(res.data.sessionId);
        setCurrentQuestionText(res.data.question);
<<<<<<< HEAD
        if (res.data.neural_keywords) {
            setNeuralWords(res.data.neural_keywords.map((w: string) => ({ word: w, description: "Context Loaded" })));
        }
        setLoading(false);
        setInterviewState('idle');
      } catch (err) {
=======
        setLoading(false);
        setInterviewState('idle');
        
      } catch (err) {
        console.error(err);
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
        toast.error("Failed to connect to Neural Server.");
        setLoading(false);
      }
    };
<<<<<<< HEAD
    initSession(); 
  }, [user, topic, resumeData, navigate]);

  // TEXT TYPING EFFECT & SPEAKING
  useEffect(() => {
    if (!currentQuestionText) return;
    window.speechSynthesis.cancel();
=======

    if (user) {
        initSession();
    } else {
        setTimeout(() => {
            if (!user) {
                toast.error("Authentication required.");
                navigate("/auth");
            }
        }, 1000);
    }

    return () => {
        stopSpeaking();
        if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [user, topic, resumeData, navigate, stopSpeaking]);

  useEffect(() => {
    if (!currentQuestionText) return;
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
    setDisplayedText(""); 
    let index = 0;
    const words = currentQuestionText.split(" ");
    const typingInterval = setInterval(() => {
      if (index < words.length) {
        setDisplayedText(prev => prev + (index === 0 ? "" : " ") + words[index]);
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);
<<<<<<< HEAD

    if (!isRecording && !isProcessingAudio) {
        const speechTimeout = setTimeout(() => speak(currentQuestionText), 200);
        return () => clearTimeout(speechTimeout);
    }
    return () => { clearInterval(typingInterval); window.speechSynthesis.cancel(); };
  }, [currentQuestionText]);

  // UPDATE 3D BRAIN STATE
  useEffect(() => {
    if (isSpeaking) setInterviewState('asking');
    else if (isRecording) setInterviewState('listening');
    else if (isProcessingAudio || loading) setInterviewState('thinking');
    else setInterviewState('idle');
  }, [isSpeaking, isRecording, loading, isProcessingAudio]);

  // TIMER
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleFinish(); return 0; }
=======
    speak(currentQuestionText);
    return () => clearInterval(typingInterval);
  }, [currentQuestionText, speak]);

  useEffect(() => {
    if (isSpeaking) setInterviewState('asking');
    else if (isRecording) setInterviewState('listening');
    else if (loading) setInterviewState('thinking');
    else setInterviewState('idle');
  }, [isSpeaking, isRecording, loading]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

<<<<<<< HEAD

  // ==================== UPDATED HANDLERS ====================

  const handleStartRecording = async () => {
    stopSpeaking();
    window.speechSynthesis.cancel();
    setUserTranscript(""); 
    recordingStartTime.current = Date.now(); // ✅ Start the clock
    await startRecording(); 
  };

  const handleStopAndSubmit = async () => {
    // ✅ 1. Time-Based Validation (Must record for at least 1.5 seconds)
    const recordingDuration = Date.now() - recordingStartTime.current;
    
    if (recordingDuration < 1500) {
        toast.warning("Recording was too short. Please speak a bit longer.");
        await stopRecording(); // Stop the mic without submitting
        return;
    }

    setIsProcessingAudio(true); 
    
    try {
        // 2. Stop Recording & Get Blob
        const audioBlob = await stopRecording();
        
        // ✅ 3. Safer File Size Validation (WebM metadata is usually 3-4KB)
        if (!audioBlob || audioBlob.size < 4000) { 
            toast.warning("Audio file is empty. Please check your microphone.");
            setIsProcessingAudio(false);
            return;
        }

        // 4. Upload to Python /transcribe Endpoint
        const formData = new FormData();
        formData.append("file", audioBlob, "input.webm");

        const transRes = await axios.post(`${SERVER_URL}/transcribe`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        const transcribedText = transRes.data.text;
        
        // 5. Hallucination Filtering (Fixes Whisper dropping ghost words)
        const cleanText = transcribedText ? transcribedText.trim().toLowerCase() : "";
        const hallucinations = ["you", "yes", "thank you", "bye", "okay", ".", "thank you."];
        
        if (!cleanText || hallucinations.includes(cleanText) || cleanText.length < 2) {
             toast.warning("I didn't quite catch that. Please try again.");
             setUserTranscript("..."); 
             setIsProcessingAudio(false);
             return;
        }

        setUserTranscript(transRes.data.text); 

        // 6. Send Valid Text to Interview Logic
        const safeResumeData = typeof resumeData === 'object' ? JSON.stringify(resumeData) : (resumeData || "");
        
        const chatRes = await axios.post(`${SERVER_URL}/chat`, {
            sessionId, 
            userAnswer: transRes.data.text,
            resumeData: safeResumeData,
=======
  // HANDLERS
  const startListening = () => {
    if (!SpeechRecognition) return toast.error("Browser not supported.");
    if (isSpeaking) stopSpeaking();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => { setIsRecording(true); setUserTranscript(""); };
    recognition.onresult = (event: any) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) final += event.results[i][0].transcript;
        }
        if(final) setUserTranscript(final);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListeningAndSubmit = async () => {
    if (recognitionRef.current) { 
        recognitionRef.current.stop(); 
        setIsRecording(false); 
    }
    
    if (!userTranscript.trim()) return toast.warning("Say something!");
    
    setInterviewState('thinking'); 
    
    try {
        const res = await axios.post(`${SERVER_URL}/chat`, {
            sessionId, 
            userAnswer: userTranscript, 
            resumeData,
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
            timeLeft: timeLeft, 
            totalDuration: selectedDuration * 60 
        });

<<<<<<< HEAD
        // 7. Update UI
        if (chatRes.data.neural_keywords) {
            setNeuralWords(chatRes.data.neural_keywords.map((w: string) => ({ 
                word: w, description: "Neural Activation" 
            })));
        }

        if (chatRes.data.mode === 'coding') {
            setIsCoding(true);
            setStarterCode(chatRes.data.starterCode || "// Write your solution here...");
=======
        if (res.data.mode === 'coding') {
            setIsCoding(true);
            setStarterCode(res.data.starterCode || "// Write your solution here...");
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
            toast.info("Practical Challenge Initiated");
        } else {
            setIsCoding(false);
        }

<<<<<<< HEAD
        setCurrentQuestionText(chatRes.data.question);
        if (chatRes.data.feedback) toast.success(chatRes.data.feedback);

    } catch (err) {
        console.error(err);
        toast.error("Processing failed. Please check your connection.");
    } finally {
        setIsProcessingAudio(false);
    }
  };

  const handleToggleMic = () => { isRecording ? handleStopAndSubmit() : handleStartRecording(); };

  const handleSkip = async () => {
    toast.info("Requesting new question...");
    if (isSpeaking) {
        stopSpeaking();
        window.speechSynthesis.cancel();
    }
    
=======
        setCurrentQuestionText(res.data.question);
        
        if (res.data.feedback) {
            toast.success(res.data.feedback);
        }

    } catch (err) { 
        console.error(err);
        setInterviewState('idle'); 
        toast.error("Connection glitch. Retry.");
    }
  };

  const handleToggleMic = () => { isRecording ? stopListeningAndSubmit() : startListening(); };

  const handleSkip = async () => {
    toast.info("Requesting new question...");
    if (isSpeaking) stopSpeaking();
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
    try {
        const res = await axios.post(`${SERVER_URL}/chat`, {
            sessionId: sessionId,
            userAnswer: "I'd like to skip this question.",
            timeLeft: timeLeft,
            totalDuration: selectedDuration * 60
        });
        setCurrentQuestionText(res.data.question);
<<<<<<< HEAD
        if (res.data.neural_keywords) {
            setNeuralWords(res.data.neural_keywords.map((w: string) => ({ 
                word: w, 
                description: "Skipping Node..." 
            })));
        }
=======
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
    } catch (e) { toast.error("Could not skip"); }
  };

  const handleFinish = async (forced = false) => {
    if (isSpeaking) stopSpeaking();
<<<<<<< HEAD
    window.speechSynthesis.cancel();
    
    setIsProcessingAudio(true);
=======
    if (recognitionRef.current) recognitionRef.current.stop();
    setInterviewState('thinking');
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
    
    if(!forced) toast.info("Analyzing session data...");
    else toast.error("SESSION TERMINATED DUE TO VIOLATION");

    try {
        const res = await axios.post(`${SERVER_URL}/end`, { sessionId });
        const finalData = forced ? { ...res.data, final_score: 0 } : res.data;
        setTimeout(() => navigate("/dashboard", { state: { newReport: finalData } }), 2000);
    } catch (e) { setTimeout(() => navigate("/dashboard"), 2000); }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-[#02040a] text-white font-sans overflow-hidden flex flex-col relative selection:bg-neon-cyan/30">
      <Navbar />

      {!isFullScreen && !loading && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
            <Lock className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
            <h1 className="text-3xl font-black text-white mb-2">SESSION PAUSED</h1>
            <p className="text-gray-400 mb-8 max-w-md">
                Full screen mode is required to maintain interview integrity.
            </p>
            <Button 
                onClick={triggerFullScreen}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all hover:scale-105"
            >
                RESUME SESSION
            </Button>
        </div>
      )}

      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
          <div className="bg-slate-900 border border-red-500 rounded-xl p-6 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200">
             <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">Security Warning</h3>
             <p className="text-gray-300 mb-4">{lastViolationType || "Proctoring Protocol Violated"}</p>
             <div className="inline-block bg-red-900/30 border border-red-500/30 text-red-400 font-bold px-4 py-2 rounded-lg text-sm">
                Strike {violationCount}/2
             </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] mt-16">
          <div className="flex-1 flex flex-col border-r border-white/10 bg-[#050505] relative p-6 gap-4 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="flex items-center justify-between relative z-10 mb-2">
               <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full border flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${isCoding ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-neon-cyan/10 border-neon-cyan/20 text-neon-cyan'}`}>
                     {isCoding ? <Code className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
                     {loading ? "INITIALIZING..." : isCoding ? "ALGORITHM PHASE" : "CONCEPTUAL PHASE"}
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 text-xs font-bold border px-3 py-1 rounded-full transition-colors ${violationCount > 0 ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                      <ShieldAlert className="w-3 h-3" /> 
                      {violationCount > 0 ? `STRIKE ${violationCount}/2` : "SECURE"}
                  </div>
               </div>
            </div>

            {isCoding ? (
               <div className="flex-1 flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-700">
                   <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a] relative">
                       <CodeEditor 
                          initialCode={starterCode} 
                          onRunComplete={(success) => success && toast.success("Solution Verified")}
                       />
                   </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col relative z-10 border border-white/10 bg-black/40 rounded-2xl p-8 backdrop-blur-sm overflow-hidden">
                   <div className="flex-1 border-b border-white/10 pb-6 mb-6 overflow-y-auto custom-scrollbar">
                       <div className="flex items-center gap-2 mb-4 text-neon-cyan">
                          <Cpu className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">AI Interviewer</span>
                       </div>
                       <h2 className="text-2xl md:text-3xl font-light leading-normal text-white">
                          "{displayedText}"
                          {isSpeaking && <span className="inline-block w-2 h-6 bg-neon-cyan ml-1 animate-pulse align-middle" />}
                       </h2>
                   </div>

                   <div className="h-1/3 flex flex-col justify-end">
                       <div className="flex items-center gap-2 mb-3 text-green-500">
                          <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                          <span className="text-xs font-bold uppercase tracking-widest">
<<<<<<< HEAD
                             {isRecording ? "Recording..." : isProcessingAudio ? "Processing Audio..." : "Your Answer"}
                          </span>
                       </div>
                       <div className={`text-xl font-mono leading-relaxed max-h-32 overflow-y-auto ${isRecording ? 'text-white' : 'text-gray-500 italic'}`}>
                          {isRecording 
                            ? "Listening... (Speak clearly)" 
                            : isProcessingAudio 
                              ? "Transcribing... (Please wait)" 
                              : userTranscript || "Tap microphone to speak..."}
=======
                             {isRecording ? "Listening..." : "Your Answer"}
                          </span>
                       </div>
                       <div className={`text-xl font-mono leading-relaxed max-h-32 overflow-y-auto ${isRecording ? 'text-white' : 'text-gray-500 italic'}`}>
                          {userTranscript || "Tap microphone to speak..."}
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
                       </div>
                   </div>
               </div>
            )}
          </div>

          <div className="w-full lg:w-[30%] bg-[#02040a] border-l border-white/10 flex flex-col relative z-20">
            <div className="absolute top-6 right-6 z-30">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                  <Clock className="w-3 h-3 text-red-500 animate-pulse" />
                  <span className="font-mono font-bold text-red-400 text-sm tracking-widest">{formatTime(timeLeft)}</span>
               </div>
            </div>

            <div className="h-[45%] w-full relative bg-gradient-to-b from-blue-900/10 to-transparent flex items-center justify-center overflow-hidden border-b border-white/5">
               <div className="w-56 h-56 relative">
                   <div className="absolute inset-0 rounded-full border border-neon-cyan/20 animate-[spin_10s_linear_infinite]" />
                   <div className="absolute inset-8 rounded-full border border-purple-500/20 animate-[spin_15s_linear_infinite_reverse]" />
                   <Interviewer3D className="w-full h-full" interviewState={interviewState} />
               </div>
               <div className="absolute bottom-6">
                   <Badge variant="outline" className={`bg-black/50 backdrop-blur px-4 py-1 border-white/10 ${isSpeaking ? 'text-neon-cyan border-neon-cyan/30 animate-pulse' : 'text-gray-400'}`}>
<<<<<<< HEAD
                      {isSpeaking ? 'SPEAKING' : isProcessingAudio ? 'ANALYZING AUDIO' : isRecording ? 'LISTENING' : 'IDLE'}
=======
                      {isSpeaking ? 'SPEAKING' : interviewState === 'thinking' ? 'PROCESSING' : isRecording ? 'LISTENING' : 'IDLE'}
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
                   </Badge>
               </div>
            </div>

<<<<<<< HEAD
            <div className="flex-1 p-8 flex flex-col bg-[#050505] relative overflow-hidden">
               {/* Neural Engine Visualizer */}
               <div className="flex-1 overflow-y-auto mb-4 min-h-0 mask-gradient-b">
                   <NeuralSpine words={neuralWords} />
               </div>

               <div className="space-y-4">
                  <Button 
                     onClick={handleToggleMic}
                     disabled={loading || isProcessingAudio || isSpeaking}
=======
            <div className="flex-1 p-8 flex flex-col bg-[#050505]">
               <div className="flex-1"></div>
               <div className="space-y-4">
                  <Button 
                     onClick={handleToggleMic}
                     disabled={loading || interviewState === 'thinking' || isSpeaking}
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
                     className={`w-full h-16 text-lg font-bold tracking-widest rounded-xl transition-all duration-300 shadow-xl ${isRecording ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-black hover:bg-neon-cyan'}`}
                  >
                     <div className="flex items-center gap-3">
                        {isRecording ? <StopCircle className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
<<<<<<< HEAD
                        {isRecording ? "STOP & SUBMIT" : isProcessingAudio ? "PROCESSING..." : "START ANSWER"}
=======
                        {isRecording ? "STOP & SUBMIT" : "START ANSWER"}
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
                     </div>
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                     <Button variant="outline" className="h-12 border-white/10 hover:bg-white/5 text-gray-400 font-bold uppercase tracking-wider text-[10px]" onClick={handleSkip} disabled={loading}>
                        <SkipForward className="w-3 h-3 mr-2" /> Skip
                     </Button>
                     <Button variant="ghost" className="h-12 bg-red-500/5 text-red-500 hover:bg-red-500/10 border border-red-500/10 font-bold uppercase tracking-wider text-[10px]" onClick={() => handleFinish(false)}>
                        End Session <LogOut className="w-3 h-3 ml-2" />
                     </Button>
                  </div>
               </div>
            </div>
          </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default InterviewSession;
=======
export default InterviewSession;
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
