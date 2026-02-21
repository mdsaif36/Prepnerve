import { useState } from "react";

interface NeuralItemProps {
  word: string;
  description?: string;
  delay?: number;
}

const NeuralItem = ({ word, description, delay = 0 }: NeuralItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const capital = word.charAt(0).toUpperCase();
  const rest = word.slice(1).toLowerCase();

  return (
    <div
      className="group cursor-pointer opacity-0 animate-slide-in-left flex items-center gap-4 py-3 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Text Container */}
      <div className="flex flex-col">
        <div className="text-3xl md:text-5xl tracking-tight flex items-baseline">
          
          {/* Capital Letter - ALWAYS RED/BLUE GRADIENT */}
          <span 
            className={`font-bold transition-all duration-300 text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-blue-600 ${
              isHovered 
                ? 'scale-110 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]' 
                : 'opacity-100'
            }`}
          >
            {capital}
          </span>
          
          {/* Rest of Word */}
          <span className={`font-light transition-all duration-300 ${
            isHovered ? 'text-white pl-0.5' : 'text-slate-600'
          }`}>
            {rest}
          </span>
        </div>
        
        {/* Description (Visible on Hover) */}
        {description && (
          <p 
            className={`text-xs text-cyan-400/80 font-mono mt-1 transition-all duration-300 absolute transform translate-y-10 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
            }`}
          >
            // {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default NeuralItem;
