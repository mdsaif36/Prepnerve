import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Editor, { loader } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { 
  Trophy, XCircle, FileCode, ShieldAlert, CheckCircle, Loader2, Skull,
  Code2, Clock, Users, Zap, Terminal, AlertTriangle, Play, ChevronRight,
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

// --- MONACO CONFIG (ZEN DARK THEME) ---
loader.init().then((monaco) => {
  monaco.editor.defineTheme("zen-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'identifier', foreground: '9CDCFE' },
      { token: 'type', foreground: '4EC9B0' },
    ],
    colors: {
      "editor.background": "#0b111c",
      "editor.foreground": "#d4d4d4",
      "editor.lineHighlightBackground": "#ffffff0a",
      "editorLineNumber.foreground": "#4f617d",
      "editorGutter.background": "#0b111c",
      "editorIndentGuide.background": "#ffffff1a",
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
    const timer = setInterval(() => setCount(p => p - 1), 1200);
    if (count === 0) setTimeout(onComplete, 500); 
    return () => clearInterval(timer);
  }, [count, onComplete]);
  return (
    <div className="fixed inset-0 z-50 bg-[#0b111c] flex flex-col items-center justify-center">
        <motion.div 
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600"
        >
            {count > 0 ? count : "GO"}
        </motion.div>
        <div className="text-gray-400 font-mono tracking-[0.5em] uppercase text-sm mt-8">
            Initialize Battle Sequence
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

    // ✅ NEW: Listen for AI Run results
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

  // ✅ UPDATED: Trigger Real AI Execution
  const handleRunCode = () => {
    if (!myEmail || !roomId) return;
    
    setIsRunning(true);
    setActiveTab("console");
    setOutput(["> Compiling on Neural Cloud...", "> Allocating resources..."]);

    // Emit event to backend
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

  if (!problem || !roomId) return <div className="bg-[#0b111c] h-screen flex items-center justify-center text-white">Loading Arena...</div>;

  return (
    <div className="h-screen bg-[#0b111c] text-white font-sans flex flex-col overflow-hidden relative selection:bg-cyan-500/30">
      
      {/* 1. COUNTDOWN */}
      {gameStatus === 'countdown' && <CyberCountdown onComplete={() => setGameStatus('active')} />}

      {/* 2. WAITING STATE */}
      {gameStatus === 'waiting_results' && (
          <div className="absolute inset-0 z-40 bg-[#0b111c]/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="bg-[#0f172a] border border-[#1e293b] p-8 rounded-2xl flex flex-col items-center shadow-2xl max-w-md text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                    <Loader2 className="w-16 h-16 text-cyan-400 animate-spin relative z-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Code Submitted</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    AI Judge is analyzing your solution complexity. 
                    <br/>Waiting for opponents...
                  </p>
              </div>
          </div>
      )}

      {/* 3. GAME OVER / RESULTS */}
      {(gameStatus === 'finished' || gameStatus === 'disqualified') && (
        <div className="absolute inset-0 z-50 bg-[#0b111c]/95 backdrop-blur-xl flex items-center justify-center animate-in zoom-in duration-300">
           {gameStatus === 'finished' && winner === myEmail && <Confetti recycle={false} numberOfPieces={800} />}
           
           <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-8 shadow-2xl max-w-4xl w-full text-center relative overflow-hidden">
              {/* STATUS HEADER */}
              {gameStatus === 'disqualified' ? (
                 <div className="mb-8">
                    <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-4 animate-pulse" />
                    <h1 className="text-5xl font-black text-white tracking-tighter">DISQUALIFIED</h1>
                    <p className="text-gray-400">Security violations detected.</p>
                 </div>
              ) : winner === myEmail ? (
                 <div className="mb-8">
                    <Trophy className="w-20 h-20 text-yellow-400 animate-bounce mx-auto mb-4" />
                    <h1 className="text-5xl font-black text-white tracking-tighter">VICTORY!</h1>
                    <p className="text-gray-400">Your algorithm was superior.</p>
                 </div>
              ) : (
                 <div className="mb-8">
                    <Skull className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                    <h1 className="text-5xl font-black text-white tracking-tighter">DEFEAT</h1>
                    <p className="text-gray-400">Better efficiency found elsewhere.</p>
                 </div>
              )}

              {/* SCOREBOARD */}
              {gameStatus === 'finished' && (
                  <div className="bg-[#0b111c] rounded-xl overflow-hidden border border-[#1e293b] mb-8 text-left">
                      <div className="grid grid-cols-12 bg-[#1e293b]/50 p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <div className="col-span-3">Player</div>
                          <div className="col-span-2 text-center">Score</div>
                          <div className="col-span-2 text-center">Status</div>
                          <div className="col-span-5">AI Feedback</div>
                      </div>
                      <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {results.map((r, i) => (
                            <div key={i} className={`grid grid-cols-12 p-4 items-center border-t border-[#1e293b] ${r.email === winner ? 'bg-yellow-500/5' : ''}`}>
                                <div className="col-span-3 font-bold text-white flex items-center gap-2 truncate text-sm">
                                    {r.email === winner && <Trophy className="w-3.5 h-3.5 text-yellow-500" />} 
                                    {r.name} {r.email === myEmail && '(You)'}
                                </div>
                                <div className="col-span-2 text-center text-xl font-black text-cyan-400">{r.score}</div>
                                <div className="col-span-2 text-center">
                                    <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold border ${r.status === 'submitted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {r.status}
                                    </span>
                                </div>
                                <div className="col-span-5 text-xs text-gray-500 italic leading-relaxed">{r.feedback}</div>
                            </div>
                        ))}
                      </div>
                  </div>
              )}
              
              <Button onClick={() => navigate('/battle-lobby')} className="w-full h-12 font-bold bg-white text-[#0b111c] hover:bg-gray-200 rounded-xl">
                  RETURN TO LOBBY
              </Button>
           </div>
        </div>
      )}

      {/* --- MAIN HEADER --- */}
      <header className="h-14 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between px-6 z-10 relative shadow-sm">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold text-gray-200 tracking-tight">{problem.title}</span>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-bold ${timeLeft < 300 ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse" : "bg-[#1e293b] border-[#334155] text-gray-300"}`}>
                <Clock className="w-3.5 h-3.5" />
                {formatTime(timeLeft)}
            </div>

            <div className={`flex items-center gap-2 text-[10px] font-bold px-3 py-1 rounded-full border transition-colors ${violationCount > 0 ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-[#1e293b] text-gray-400 border-[#334155]"}`}>
               <ShieldAlert className="w-3 h-3" /> 
               VIOLATIONS: {violationCount}/3
            </div>
         </div>

         <div className="flex gap-3">
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/battle-lobby')}
                className="hover:bg-red-500/10 hover:text-red-400 text-gray-500 w-9 h-9"
             >
                 <XCircle className="w-5 h-5" />
             </Button>
         </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex-1 flex overflow-hidden">
         
         {/* LEFT: DESCRIPTION */}
         <div className="w-[25%] bg-[#0b111c] border-r border-[#1e293b] flex flex-col hidden lg:flex">
            <div className="h-10 border-b border-[#1e293b] flex items-center px-4 bg-[#0f172a]">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex gap-2 items-center">
                  <FileCode className="w-3.5 h-3.5"/> Problem Description
               </span>
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
               <h2 className="text-xl font-bold text-white mb-4">{problem.title}</h2>
               <div className="prose prose-invert prose-sm text-gray-400 max-w-none">
                   {problem.description}
               </div>
            </div>
         </div>

         {/* MIDDLE: EDITOR & CONSOLE */}
         <div className="flex-1 flex flex-col bg-[#0b111c] relative border-r border-[#1e293b]">
            
            <div className="h-12 border-b border-[#1e293b] bg-[#0f172a] flex items-center justify-between px-4">
               <div className="flex items-center gap-3">
                  <Select value={languageId} onValueChange={setLanguageId}>
                    <SelectTrigger className="w-[130px] h-8 bg-[#1e293b] border-none text-xs font-medium text-gray-300 focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f172a] border-[#1e293b] text-gray-300 max-h-[300px]">
                        {LANGUAGES.map(lang => (
                            <SelectItem key={lang.id} value={lang.id} className="text-xs hover:bg-[#1e293b] focus:bg-[#1e293b] cursor-pointer">
                                {lang.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="h-4 w-px bg-[#334155]" />
                  <span className="text-xs text-gray-500 font-mono">solution.{currentLang.ext}</span>
               </div>

               <div className="flex items-center gap-2">
                   <Button 
                      size="sm" 
                      onClick={handleRunCode}
                      disabled={isRunning || gameStatus !== 'active'}
                      className={`h-8 text-xs font-bold gap-2 ${isRunning ? 'bg-yellow-500/10 text-yellow-500' : 'bg-[#1e293b] text-cyan-400 hover:bg-[#334155]'}`}
                   >
                      {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      RUN CODE
                   </Button>
                   <Button 
                      size="sm" 
                      onClick={handleSubmit} 
                      disabled={gameStatus !== 'active'} 
                      className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                   >
                      <Zap className="w-3 h-3 fill-current" /> SUBMIT
                   </Button>
               </div>
            </div>

            <div className={`flex-1 transition-all duration-300 ${activeTab === 'console' ? 'h-[60%]' : 'h-full'}`}>
                <Editor 
                    height="100%" 
                    language={languageId} 
                    theme="zen-dark" 
                    value={myCode} 
                    onChange={handleCodeChange} 
                    options={{ 
                        readOnly: gameStatus !== 'active', 
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        lineHeight: 24,
                        padding: { top: 16 },
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontLigatures: true,
                    }}
                />
            </div>

            <AnimatePresence>
                {activeTab === 'code' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-4 right-6 z-20"
                    >
                        <Button 
                            onClick={() => setActiveTab('console')} 
                            className="bg-[#0f172a] border border-[#1e293b] text-xs text-cyan-400 h-8 gap-2 shadow-lg hover:bg-[#1e293b]"
                        >
                            <Terminal className="w-3 h-3" /> Console
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div 
                 initial={false}
                 animate={{ 
                    height: activeTab === 'console' ? '40%' : '0px',
                    opacity: activeTab === 'console' ? 1 : 0
                 }}
                 className="border-t border-[#1e293b] bg-[#090e17] flex flex-col overflow-hidden relative z-10"
            >
                 <div className="h-9 shrink-0 flex items-center justify-between px-4 border-b border-[#1e293b] bg-[#0f172a]">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-white text-gray-400" onClick={() => setActiveTab('code')}>
                       <ChevronRight className="w-4 h-4 rotate-90 text-gray-500" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Console Output</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-500 hover:bg-[#1e293b]" onClick={() => setActiveTab('code')}>
                        <ChevronRight className="w-3 h-3 rotate-90" />
                    </Button>
                 </div>
                 <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
                    {output.map((line, i) => (
                        <div key={i} className={`mb-1 ${line.includes("PASSED") || line.includes("Correct") ? "text-emerald-400" : line.includes("Error") ? "text-red-400" : "text-gray-400"}`}>
                            {line}
                        </div>
                    ))}
                    {isRunning && (
                       <div className="flex gap-1 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                       </div>
                    )}
                 </div>
            </motion.div>
         </div>

         <div className="w-[20%] bg-[#0b111c] border-l border-[#1e293b] flex flex-col">
             <div className="h-10 border-b border-[#1e293b] flex items-center px-4 bg-[#0f172a]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex gap-2 items-center">
                    <Users className="w-3.5 h-3.5"/> Live Standings
                </span>
             </div>
             
             <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                 <div className={`p-3 rounded-lg border transition-all duration-300 relative overflow-hidden group ${me.status === 'submitted' ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-cyan-500/50 bg-[#0f172a]'}`}>
                     <div className="flex justify-between mb-2 text-white font-bold text-xs relative z-10">
                         <span className="flex items-center gap-2">{myName} <span className="text-[10px] text-gray-500 font-normal">(You)</span></span>
                         {me.status === 'submitted' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                     </div>
                     <div className="relative h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden mb-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${me.progress}%` }} className={`h-full rounded-full ${me.status === 'submitted' ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
                     </div>
                     <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider relative z-10">
                         <span className={me.status === 'submitted' ? 'text-emerald-400' : 'text-cyan-400'}>{me.status === 'submitted' ? 'Submitted' : 'Coding...'}</span>
                         <span className="text-gray-500">{me.progress}%</span>
                     </div>
                 </div>

                 {opponents.map((op, i) => (
                     <div key={i} className={`p-3 rounded-lg border bg-[#0b111c] transition-all ${op.status === 'submitted' ? 'border-emerald-500/30 opacity-70' : op.status === 'disqualified' ? 'border-red-500/30 opacity-50 bg-red-950/5' : 'border-[#1e293b] opacity-100'}`}>
                         <div className="flex justify-between mb-2 text-gray-300 font-medium text-xs">
                             <span>{op.name}</span>
                             {op.status === 'submitted' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                             {op.status === 'disqualified' && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                         </div>
                         <div className="relative h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden mb-2">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${op.progress}%` }} className={`h-full rounded-full ${op.status === 'submitted' ? 'bg-emerald-500' : op.status === 'disqualified' ? 'bg-red-500' : 'bg-gray-600'}`} />
                         </div>
                         <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                             {op.status === 'submitted' ? 'Done' : op.status === 'disqualified' ? 'DQ' : 'Coding...'}
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
