import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORKFLOW_STEPS = [
  { text: "Booting AI Engine...", delay: 0 },
  { text: "Initializing Speech Module (Whisper-v3)", delay: 800 },
  { text: "Establishing Neural Link...", delay: 1600 },
  { text: "Listening to Audio Stream", delay: 2400 },
  { text: "Analyzing Intent Vectors", delay: 3200 },
  { text: "Context Window: 128k Tokens", delay: 4000 },
  { text: "Generating Response (GPT-4o)", delay: 4800 },
  { text: "Synthesizing Voice Output", delay: 5600 },
  { text: "System Ready. Waiting for input...", delay: 6400 },
];

const LiveTerminal = ({ className = "" }: { className?: string }) => {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [activeLine, setActiveLine] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    setVisibleLines([]); 
    setActiveLine(0);
    setIsComplete(false);

    WORKFLOW_STEPS.forEach((step, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(prev => [...prev, index]);
        setActiveLine(index);
        
        if (index === WORKFLOW_STEPS.length - 1) {
          setTimeout(() => setIsComplete(true), 800);
        }
      }, step.delay);
      timers.push(timer);
    });

    const resetTimer = setTimeout(() => {
      setCycle(c => c + 1);
    }, 10000);
    timers.push(resetTimer);

    return () => timers.forEach(t => clearTimeout(t));
  }, [cycle]);

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* CONTAINER: Transparent, no box */}
      <div className="flex flex-col">
        
        {/* --- UPPER PART: TEXT ONLY (Simple Red -> Blue) --- */}
        <div className="mb-4 text-center">
            <h3 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-blue-600 opacity-100">
                SYSTEM WORKFLOW
            </h3>
        </div>

        {/* --- TERMINAL LOGS (Floating Text) --- */}
        <div className="px-6 min-h-[320px] font-mono relative flex flex-col justify-end">
          
          <AnimatePresence mode="popLayout">
            {WORKFLOW_STEPS.map((step, index) => {
              const isVisible = visibleLines.includes(index);
              const isActive = index === activeLine && !isComplete;
              
              if (!isVisible) return null;

              return (
                <motion.div
                  key={`${cycle}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 mb-2.5"
                >
                  <span className={`text-xs mt-0.5 ${isActive ? "text-cyan-400" : "text-cyan-800"}`}>➜</span>
                  <span className={`text-xs md:text-sm tracking-wide transition-all duration-500 ${
                      isActive 
                        ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" 
                        : "text-cyan-100/40"
                    }`}
                  >
                    {step.text}
                  </span>
                  {isActive && (
                     <motion.span
                       animate={{ opacity: [0, 1, 0] }}
                       transition={{ repeat: Infinity, duration: 0.8 }}
                       className="inline-block w-1.5 h-4 bg-cyan-400 align-middle ml-1 shadow-[0_0_5px_#22d3ee]"
                     />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default LiveTerminal;