import { useEffect, useState } from "react";

// --- SUB-COMPONENT: TIME BLOCK ---
const TimeBlock = ({ value, label }: { value: string, label: string }) => {
  return (
    <div className="flex flex-col items-center justify-center w-24 md:w-56">
      
      {/* The Massive Number Container */}
      <div className="relative h-24 md:h-56 flex items-center justify-center">
         {/* We use a simple key key-based re-render for animation to ensure visibility */}
         <div key={value} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span 
                className="text-7xl md:text-[10rem] font-black leading-none tracking-tighter text-white font-sans tabular-nums block"
                style={{ textShadow: "0 0 30px rgba(255,255,255,0.3)" }}
            >
                {value}
            </span>
         </div>
      </div>
      
      {/* The Label */}
      <div className="mt-4 md:mt-8 text-[10px] md:text-sm font-bold text-gray-400 tracking-[0.4em] uppercase w-full text-center border-t border-white/10 pt-4">
        {label}
      </div>
    </div>
  );
};

const GlobalTimeDilation = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Standard 1-second interval
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const format = (num: number) => num.toString().padStart(2, "0");
  const hours = format(time.getHours());
  const minutes = format(time.getMinutes());
  const seconds = format(time.getSeconds());

  return (
    <div className="relative w-full py-32 flex flex-col items-center justify-center select-none z-20">
      
      {/* --- BACKGROUND CONTAINER (Ensures Visibility) --- */}
      {/* This semi-transparent black box ensures text pops against any background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm border-t border-b border-white/5" />
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen opacity-50" />
      </div>

      {/* --- THE CLOCK LAYOUT --- */}
      <div className="relative z-50 flex items-start gap-4 md:gap-16 lg:gap-24 transition-transform duration-500 hover:scale-105">
        
        <TimeBlock value={hours} label="HRS" />
        
        <TimeBlock value={minutes} label="MIN" />
        
        <TimeBlock value={seconds} label="SEC" />

      </div>

    </div>
  );
};

export default GlobalTimeDilation;