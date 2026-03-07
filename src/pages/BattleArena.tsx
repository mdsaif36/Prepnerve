import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Editor, { loader } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { 
  Trophy, XCircle, FileCode, ShieldAlert, CheckCircle, Loader2, Skull,
  Code2, Clock, Users, Zap, Terminal, AlertTriangle, Play, ChevronRight, Activity, X
} from "lucide-react";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { getSocket } from "@/lib/socket"; 
import { useProctoring } from "@/hooks/useProctoring";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

// --- MONACO CONFIG (NEURAL TERMINAL THEME) ---
loader.init().then((monaco) => {
  monaco.editor.defineTheme("neural-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
      { token: 'keyword', foreground: '22d3ee' },
      { token: 'string', foreground: 'a78bfa' },
      { token: 'identifier', foreground: 'e2e8f0' },
      { token: 'type', foreground: '3b82f6' },
      { token: 'number', foreground: 'f472b6' },
    ],
    colors: {
      "editor.background": "#02040a", // Ultra deep black for focus
      "editor.foreground": "#f8fafc",
      "editor.lineHighlightBackground": "#ffffff05",
      "editorLineNumber.foreground": "#334155",
      "editorGutter.background": "#02040a",
      "editorIndentGuide.background": "#ffffff10",
      "editorSuggestWidget.background": "#0f172a",
      "editorSuggestWidget.border": "#1e293b",
    },
  });
});

// --- EXPANDED LANGUAGES LIST ---
const LANGUAGES = [
  { id: "javascript", name: "JavaScript", ext: "js" },
  { id: "typescript", name: "TypeScript", ext: "ts" },
  { id: "python", name: "Python", ext: "py" },
  { id: "java", name: "Java", ext: "java" },
  { id: "cpp", name: "C++", ext: "cpp" },
  { id: "c", name: "C", ext: "c" },
  { id: "csharp", name: "C#", ext: "cs" },
  { id: "go", name: "Go", ext: "go" },
  { id: "rust", name: "Rust", ext: "rs" },
  { id: "php", name: "PHP", ext: "php" },
  { id: "ruby", name: "Ruby", ext: "rb" },
  { id: "swift", name: "Swift", ext: "swift" },
  { id: "kotlin", name: "Kotlin", ext: "kt" },
  { id: "scala", name: "Scala", ext: "scala" },
  { id: "r", name: "R", ext: "r" },
  { id: "sql", name: "SQL", ext: "sql" },
];

// --- COMPONENT: COUNTDOWN ---
const CyberCountdown = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const timer = setInterval(() => setCount(p => p - 1), 1000);
    if (count === 0) setTimeout(onComplete, 500); 
    return () => clearInterval(timer);
  }, [count, onComplete]);
  return (
    <div className="fixed inset-0 z-50 bg-[#060813]/95 backdrop-blur-xl flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/20 blur-[150px] rounded-full pointer-events-none" />
        
        <motion.div 
            key={count}
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-500 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)] z-10"
        >
            {count > 0 ? count : "ENGAGE"}
        </motion.div>
        <div className="text-cyan-400 font-mono tracking-[0.5em] uppercase text-sm mt-8 z-10 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin" /> Initialize Battle Sequence
        </div>
    </div>
  );
};

const BattleArena = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = getSocket();
  const { user } = useAuth();

  const { roomId, problem, players } = location.state || {};

  const myEmail = user?.email;
  const myName = user?.email?.split('@')[0] || "YOU";

  // --- STATE ---
  const [timeLeft, setTimeLeft] = useState(problem?.duration_seconds || 1800); 
  const [myCode, setMyCode] = useState(problem?.starter_code || "// Loading...");
  const [gameStatus, setGameStatus] = useState<'countdown' | 'active' | 'waiting_results' | 'finished' | 'disqualified'>('countdown');
  const [languageId, setLanguageId] = useState("javascript");
  
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"code" | "console">("code");

  const [winner, setWinner] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const [me, setMe] = useState({ socketId: 'me', name: myName, progress: 0, status: 'coding' });
  const [opponents, setOpponents] = useState<any[]>([]);

  const currentLang = LANGUAGES.find(l => l.id === languageId) || LANGUAGES[0];

  // --- PROCTORING ---
  const { violationCount } = useProctoring({
    active: gameStatus === 'active',
    enableTabSwitchDetection: true,
    enableFullScreen: true,
    maxViolations: 3,
    onTerminate: () => {
        setGameStatus('disqualified');
        socket.emit('send_progress', { roomId, percent: 0, status: 'disqualified' });
    }
  });

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    if (!roomId || !problem) { 
        toast.error("Session Expired. Returning to Lobby.");
        navigate('/battle-lobby'); 
        return; 
    }

    if (players && myEmail && opponents.length === 0) {
        const otherPlayers = players.filter((p: any) => p.email !== myEmail);
        setOpponents(otherPlayers.map((p: any) => ({ 
            ...p, 
            progress: 0, 
            status: 'coding' 
        })));
    }

    const handleProgress = (data: any) => {
        setOpponents(prev => prev.map(op => 
            op.socketId === data.socketId ? { ...op, progress: data.percent, status: data.status } : op
        ));
    };

    const handleGameOver = (data: any) => {
        setWinner(data.winnerEmail);
        setResults(data.results);
        setGameStatus('finished');
    };

    const handleSubmissionResult = (data: any) => {
        if (data.success) {
            toast.success(data.message);
            setGameStatus('waiting_results'); 
            setMe(p => ({ ...p, progress: 100, status: 'submitted' }));
        } else {
            toast.error(data.message);
        }
    };

    const handleRunResult = (data: any) => {
        setIsRunning(false);
        if (data.logs) {
            setOutput(data.logs);
        }
    };

    socket.on('opponent_progress', handleProgress);
    socket.on('game_over', handleGameOver);
    socket.on('submission_result', handleSubmissionResult);
    socket.on('run_result', handleRunResult);

    return () => {
        socket.off('opponent_progress');
        socket.off('game_over');
        socket.off('submission_result');
        socket.off('run_result');
    };
  }, [roomId, myEmail, players, problem, navigate]);

  // --- TIMER ---
  useEffect(() => {
    if (gameStatus !== 'active') return;
    const timer = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [gameStatus]);

  // --- HANDLERS ---
  const handleCodeChange = (value: string | undefined) => {
    setMyCode(value || "");
    
    const lengthProgress = Math.min(80, Math.floor((value || "").length / 5)); 
    
    if (lengthProgress > me.progress && gameStatus === 'active') {
        setMe(p => ({ ...p, progress: lengthProgress }));
        socket.emit('send_progress', { roomId, percent: lengthProgress, status: 'coding' });
    }
  };

  const handleRunCode = () => {
    if (!myEmail || !roomId) return;
    
    setIsRunning(true);
    setActiveTab("console");
    setOutput(["> Compiling on Neural Cloud...", "> Allocating resources..."]);

    socket.emit('request_run', { roomId, code: myCode, email: myEmail });
  };

  const handleSubmit = () => {
    if (!myEmail) return toast.error("User identity missing!");
    toast.info("Submitting to AI Judge...");
    socket.emit('submit_code', { roomId, code: myCode, email: myEmail });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!problem || !roomId) return <div className="bg-[#060813] h-screen flex items-center justify-center text-white">Initializing Protocol...</div>;

  return (
    <div className="h-screen bg-[#060813] text-white font-sans flex flex-col overflow-hidden relative selection:bg-cyan-500/30">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 pointer-events-none" />

      {/* 1. COUNTDOWN */}
      {gameStatus === 'countdown' && <CyberCountdown onComplete={() => setGameStatus('active')} />}

      {/* 2. WAITING STATE */}
      {gameStatus === 'waiting_results' && (
          <div className="absolute inset-0 z-40 bg-[#060813]/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="bg-[#0a0f18]/80 border border-white/10 p-10 rounded-[2rem] flex flex-col items-center shadow-[0_0_60px_-15px_rgba(34,211,238,0.3)] max-w-md text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-[30px] rounded-full" />
                    <Loader2 className="w-20 h-20 text-cyan-400 animate-spin relative z-10" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-3 tracking-wide uppercase">Processing</h2>
                  <p className="text-gray-400 text-sm leading-relaxed font-light">
                    The AI Judge is analyzing your algorithmic complexity. 
                    <br/>Stand by for opponent synchronization...
                  </p>
              </div>
          </div>
      )}

      {/* 3. GAME OVER / RESULTS */}
      {(gameStatus === 'finished' || gameStatus === 'disqualified') && (
        <div className="absolute inset-0 z-50 bg-[#060813]/95 backdrop-blur-2xl flex items-center justify-center animate-in zoom-in duration-500">
           {gameStatus === 'finished' && winner === myEmail && <Confetti recycle={false} numberOfPieces={800} colors={['#22d3ee', '#3b82f6', '#a855f7', '#ffffff']} />}
           
           <div className="bg-[#0a0f18] border border-white/10 rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(0,0,0,0.8)] max-w-5xl w-full text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
              
              {/* STATUS HEADER */}
              {gameStatus === 'disqualified' ? (
                 <div className="mb-10">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 mb-6">
                        <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
                    </div>
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-red-500 tracking-tighter uppercase">Disqualified</h1>
                    <p className="text-gray-400 mt-4 tracking-widest uppercase text-sm font-bold">Security Protocols Breached</p>
                 </div>
              ) : winner === myEmail ? (
                 <div className="mb-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none -z-10" />
                    <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                        <Trophy className="w-14 h-14 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                    </div>
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 tracking-tighter uppercase">Victory Achieved</h1>
                    <p className="text-cyan-500/80 mt-4 tracking-widest uppercase text-sm font-bold">Superior Algorithm Detected</p>
                 </div>
              ) : (
                 <div className="mb-10">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-800/30 border border-gray-700 mb-6">
                        <Skull className="w-12 h-12 text-gray-500" />
                    </div>
                    <h1 className="text-6xl font-black text-gray-300 tracking-tighter uppercase">Defeat</h1>
                    <p className="text-gray-500 mt-4 tracking-widest uppercase text-sm font-bold">Sub-optimal efficiency</p>
                 </div>
              )}

              {/* SCOREBOARD */}
              {gameStatus === 'finished' && (
                 <div className="bg-white/[0.02] rounded-3xl overflow-hidden border border-white/5 mb-10 text-left backdrop-blur-md">
                     <div className="grid grid-cols-12 bg-black/40 p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                         <div className="col-span-3">Engineer</div>
                         <div className="col-span-2 text-center">Score</div>
                         <div className="col-span-2 text-center">Status</div>
                         <div className="col-span-5">AI Diagnostic</div>
                     </div>
                     <div className="max-h-64 overflow-y-auto custom-scrollbar">
                       {results.map((r, i) => (
                           <div key={i} className={`grid grid-cols-12 p-5 items-center border-b border-white/5 last:border-0 transition-colors ${r.email === winner ? 'bg-cyan-500/5' : 'hover:bg-white/[0.02]'}`}>
                               <div className="col-span-3 font-bold text-white flex items-center gap-3 truncate text-sm">
                                   {r.email === winner ? (
                                       <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                            <Trophy className="w-4 h-4 text-cyan-400" />
                                       </div>
                                   ) : (
                                       <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            <Users className="w-4 h-4 text-gray-400" />
                                       </div>
                                   )}
                                   <div>
                                       <span className="block">{r.name}</span>
                                       {r.email === myEmail && <span className="text-[10px] text-cyan-500 uppercase tracking-wider font-black">You</span>}
                                   </div>
                               </div>
                               <div className="col-span-2 text-center text-2xl font-black text-white">{r.score}</div>
                               <div className="col-span-2 text-center">
                                   <span className={`text-[10px] px-3 py-1.5 rounded-full uppercase font-black tracking-widest border ${r.status === 'submitted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                       {r.status}
                                   </span>
                               </div>
                               <div className="col-span-5 text-sm text-gray-400 font-light leading-relaxed pl-4 border-l border-white/5">
                                   {r.feedback}
                               </div>
                           </div>
                       ))}
                     </div>
                 </div>
              )}
              
              <Button onClick={() => navigate('/battle-lobby')} className="h-14 px-12 font-black uppercase tracking-widest bg-white text-black hover:bg-gray-200 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-all">
                  Return to Matrix
              </Button>
           </div>
        </div>
      )}

      {/* --- FLOATING HEADER --- */}
      <header className="h-16 flex items-center justify-between px-6 z-20 relative bg-white/[0.01] border-b border-white/5 backdrop-blur-md">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
                    <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                    <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Simulation</span>
                    <span className="text-sm font-bold text-white tracking-tight">{problem.title}</span>
                </div>
            </div>
            
            <div className="h-8 w-px bg-white/10" />

            <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-black/40 text-xs font-mono font-bold ${timeLeft < 300 ? "text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse" : "text-cyan-400 shadow-inner"}`}>
                <Clock className="w-4 h-4 opacity-70" />
                <span className="text-sm">{formatTime(timeLeft)}</span>
            </div>

            <div className={`flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full border transition-colors uppercase tracking-widest ${violationCount > 0 ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-white/5 text-gray-400 border-white/5"}`}>
               <ShieldAlert className="w-3.5 h-3.5" /> 
               Violations: {violationCount}/3
            </div>
         </div>

         <Button 
            variant="ghost" 
            onClick={() => navigate('/battle-lobby')}
            className="text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors uppercase tracking-widest text-[10px] font-bold gap-2"
         >
             Abort <X className="w-4 h-4" />
         </Button>
      </header>

      {/* --- MAIN PADDED LAYOUT --- */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden z-10">
         
         {/* LEFT: DESCRIPTION PANEL */}
         <div className="w-[25%] bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col hidden lg:flex overflow-hidden backdrop-blur-md shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
            <div className="h-14 border-b border-white/5 flex items-center px-6 bg-black/20">
               <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex gap-2 items-center">
                  <FileCode className="w-4 h-4"/> Mission Briefing
               </span>
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
               <h2 className="text-2xl font-black text-white mb-6 leading-tight">{problem.title}</h2>
               <div className="prose prose-invert prose-sm text-gray-300 max-w-none font-light leading-relaxed">
                   {problem.description}
               </div>
            </div>
         </div>

         {/* MIDDLE: EDITOR & CONSOLE */}
         <div className="flex-1 flex flex-col bg-[#02040a] rounded-2xl border border-white/5 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            
            {/* Editor Toolbar */}
            <div className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-4">
               <div className="flex items-center gap-4">
                  <Select value={languageId} onValueChange={setLanguageId}>
                    <SelectTrigger className="w-[140px] h-9 bg-black/40 border border-white/10 text-xs font-bold text-gray-300 rounded-lg hover:border-cyan-500/50 transition-colors focus:ring-0">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-white/10 text-gray-300 max-h-[300px]">
                        {LANGUAGES.map(lang => (
                            <SelectItem key={lang.id} value={lang.id} className="text-xs font-mono hover:bg-white/5 cursor-pointer">
                                {lang.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="h-5 w-px bg-white/10" />
                  <span className="text-[11px] text-gray-500 font-mono tracking-widest bg-white/5 px-3 py-1 rounded-md">solution.{currentLang.ext}</span>
               </div>

               <div className="flex items-center gap-3">
                   <Button 
                      size="sm" 
                      onClick={handleRunCode}
                      disabled={isRunning || gameStatus !== 'active'}
                      className={`h-9 px-4 text-[10px] uppercase tracking-widest font-black gap-2 rounded-lg transition-all ${isRunning ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-transparent border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]'}`}
                   >
                      {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      Run Test
                   </Button>
                   <Button 
                      size="sm" 
                      onClick={handleSubmit} 
                      disabled={gameStatus !== 'active'} 
                      className="h-9 px-6 text-[10px] uppercase tracking-widest font-black bg-cyan-500 hover:bg-cyan-400 text-black gap-2 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all hover:scale-[1.02]"
                   >
                      <Zap className="w-3.5 h-3.5 fill-current" /> Submit
                   </Button>
               </div>
            </div>

            {/* Monaco Editor */}
            <div className={`flex-1 transition-all duration-500 ${activeTab === 'console' ? 'h-[50%]' : 'h-full'} pt-2`}>
                <Editor 
                    height="100%" 
                    language={languageId} 
                    theme="neural-dark" 
                    value={myCode} 
                    onChange={handleCodeChange} 
                    options={{ 
                        readOnly: gameStatus !== 'active', 
                        fontSize: 15,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        lineHeight: 26,
                        padding: { top: 16, bottom: 16 },
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        formatOnPaste: true,
                    }}
                />
            </div>

            {/* Console Drawer Toggle */}
            <AnimatePresence>
                {activeTab === 'code' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-6 right-6 z-20"
                    >
                        <Button 
                            onClick={() => setActiveTab('console')} 
                            className="bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-300 h-10 px-5 gap-3 shadow-2xl hover:border-cyan-500/50 hover:text-cyan-400 transition-all rounded-full"
                        >
                            <Terminal className="w-4 h-4" /> Open Terminal
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Console Panel */}
            <motion.div 
                 initial={false}
                 animate={{ 
                    height: activeTab === 'console' ? '50%' : '0px',
                    opacity: activeTab === 'console' ? 1 : 0
                 }}
                 className="border-t border-white/10 bg-[#060813] flex flex-col overflow-hidden relative z-10 backdrop-blur-xl"
            >
                 <div className="h-10 shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3 cursor-pointer hover:text-cyan-400 text-gray-400 transition-colors" onClick={() => setActiveTab('code')}>
                       <Terminal className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Output Terminal</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:bg-white/10 hover:text-white rounded-full" onClick={() => setActiveTab('code')}>
                        <X className="w-4 h-4" />
                    </Button>
                 </div>
                 <div className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar bg-black/40">
                    {output.length === 0 && !isRunning && (
                        <div className="text-gray-600 italic">No output yet. Run your code to see the results.</div>
                    )}
                    {output.map((line, i) => (
                        <div key={i} className={`mb-1.5 ${line.includes("PASSED") || line.includes("Correct") ? "text-emerald-400" : line.includes("Error") || line.includes("FAILED") ? "text-red-400" : "text-gray-300"}`}>
                            {line}
                        </div>
                    ))}
                    {isRunning && (
                       <div className="flex gap-2 mt-4 items-center text-cyan-500 text-xs">
                          <span className="w-2 h-2 rounded-sm bg-cyan-500 animate-pulse" />
                          Executing sequence...
                       </div>
                    )}
                 </div>
            </motion.div>
         </div>

         {/* RIGHT: LEADERBOARD */}
         <div className="w-[22%] bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md shadow-2xl relative">
             <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-purple-500/50 to-transparent" />
             <div className="h-14 border-b border-white/5 flex items-center px-6 bg-black/20">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex gap-2 items-center">
                    <Users className="w-4 h-4"/> Telemetry Sync
                </span>
             </div>
             
             <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scrollbar">
                 {/* Current User Card */}
                 <div className={`p-4 rounded-xl border transition-all duration-500 relative overflow-hidden group ${me.status === 'submitted' ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-cyan-500/50 bg-cyan-950/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]'}`}>
                     <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-[20px]" />
                     <div className="flex justify-between items-center mb-3 text-white relative z-10">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold text-xs">
                                ME
                             </div>
                             <span className="font-bold text-sm">{myName}</span>
                         </div>
                         {me.status === 'submitted' && <CheckCircle className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                     </div>
                     <div className="relative h-2 w-full bg-black/50 rounded-full overflow-hidden mb-3 border border-white/5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${me.progress}%` }} className={`h-full rounded-full shadow-[0_0_10px_currentColor] ${me.status === 'submitted' ? 'bg-emerald-500 text-emerald-500' : 'bg-cyan-500 text-cyan-500'}`} />
                     </div>
                     <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest relative z-10">
                         <span className={me.status === 'submitted' ? 'text-emerald-400' : 'text-cyan-400'}>{me.status === 'submitted' ? 'System Locked' : 'Compiling...'}</span>
                         <span className="text-gray-300">{me.progress}%</span>
                     </div>
                 </div>

                 {/* Opponent Cards */}
                 {opponents.map((op, i) => (
                     <div key={i} className={`p-4 rounded-xl border bg-black/40 transition-all duration-500 ${op.status === 'submitted' ? 'border-emerald-500/30' : op.status === 'disqualified' ? 'border-red-500/30 bg-red-950/10' : 'border-white/5'}`}>
                         <div className="flex justify-between items-center mb-3 text-gray-300">
                             <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${op.status === 'submitted' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : op.status === 'disqualified' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                     {op.name.substring(0, 2).toUpperCase()}
                                 </div>
                                 <span className="font-bold text-sm truncate max-w-[80px]">{op.name}</span>
                             </div>
                             {op.status === 'submitted' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                             {op.status === 'disqualified' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                         </div>
                         <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${op.progress}%` }} className={`h-full rounded-full ${op.status === 'submitted' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : op.status === 'disqualified' ? 'bg-red-500' : 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]'}`} />
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                             <span className={op.status === 'submitted' ? 'text-emerald-500/70' : op.status === 'disqualified' ? 'text-red-500/70' : 'text-gray-500'}>
                                 {op.status === 'submitted' ? 'Done' : op.status === 'disqualified' ? 'Terminated' : 'Syncing...'}
                             </span>
                             <span className="text-gray-600">{op.progress}%</span>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
};

export default BattleArena;