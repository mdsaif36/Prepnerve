import { useState, useEffect } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { 
  Play, Terminal, Layers, RefreshCw, Activity, Box, Code, 
} from "lucide-react";
import { toast } from "sonner";

// --- FIX: Configure Loader Source ---
// We explicitly point to unpkg to avoid 'Tracking Prevention' blocking jsdelivr
loader.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.45.0/min/vs" } });

loader.init().then((monaco) => {
  monaco.editor.defineTheme("glass-theme", {
    base: "vs-dark",
    inherit: true,
    rules: [{ background: "00000000" }],
    colors: {
      "editor.background": "#00000000",
      "minimap.background": "#00000000",
      "editorGutter.background": "#ffffff05",
      "scrollbar.shadow": "#00000000",
    },
  });
});

interface CodeEditorProps {
  initialCode?: string;
  onRunComplete?: (success: boolean) => void;
}

const LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python 3" },
  { id: "java", name: "Java 17" },
  { id: "cpp", name: "C++ 20" },
];

const CodeEditor = ({ 
  initialCode = "", 
  onRunComplete
}: CodeEditorProps) => {
  
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState("javascript");
  const [isCompiling, setIsCompiling] = useState(false);
  const [output, setOutput] = useState<string[]>([]);

  // Reset when question changes
  useEffect(() => {
    setCode(initialCode);
    setOutput(["> Console ready.", "> Waiting for execution..."]);
  }, [initialCode]);

  const handleRunCode = () => {
    setIsCompiling(true);
    setOutput(["> Compiling script...", "> Running test cases..."]);
    
    setTimeout(() => {
      setIsCompiling(false);
      
      // --- LOGIC FIX: Compare current code vs starter code ---
      const cleanCurrent = code.replace(/\s/g, '');
      const cleanInitial = initialCode.replace(/\s/g, '');

      if (cleanCurrent === cleanInitial || cleanCurrent.length <= cleanInitial.length) {
        setOutput([
          "> Build Failed.",
          "> Error: No solution detected.",
          "> Hint: You must implement the logic inside the function.",
          "> Execution terminated."
        ]);
        toast.error("No solution detected");
        if (onRunComplete) onRunComplete(false);
        return;
      }

      // If passed check, Simulate Success
      setOutput([
        "> Build Successful.",
        "> Running Tests:",
        "  [✓] Test Case 1: Input 'abcabcbb' -> Expected 3 -> PASSED (4ms)",
        "  [✓] Test Case 2: Input 'bbbbb'    -> Expected 1 -> PASSED (2ms)",
        "  [✓] Test Case 3: Input 'pwwkew'   -> Expected 3 -> PASSED (3ms)",
        "> Result: Accepted",
        "> Runtime: 56ms (Beats 82%)"
      ]);
      toast.success("All Test Cases Passed");
      if (onRunComplete) onRunComplete(true);
      
    }, 2000);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput(["> Code reverted to original state."]);
    toast.info("Editor Reset");
  };

  return (
    <div className="flex flex-col h-full w-full bg-black/80 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden shadow-2xl relative z-30 animate-in fade-in zoom-in-95 duration-500">
       
       {/* TOOLBAR */}
       <div className="h-12 bg-white/5 border-b border-white/10 flex justify-between items-center px-4 shrink-0">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-neon-cyan text-xs font-bold uppercase tracking-widest">
                <Code className="w-4 h-4" /> Code Environment
             </div>
             <div className="h-4 w-px bg-white/10" />
             <select 
               value={language} 
               onChange={(e) => setLanguage(e.target.value)}
               className="bg-transparent text-xs text-gray-400 font-bold focus:outline-none cursor-pointer hover:text-white uppercase"
             >
                {LANGUAGES.map(lang => (
                   <option key={lang.id} value={lang.id} className="bg-[#1e1e1e]">{lang.name}</option>
                ))}
             </select>
          </div>

          <div className="flex items-center gap-2">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="h-7 text-xs text-gray-500 hover:text-white hover:bg-white/5"
             >
                <RefreshCw className="w-3 h-3 mr-1" /> Reset
             </Button>
             <Button 
                size="sm" 
                onClick={handleRunCode}
                disabled={isCompiling}
                className={`h-7 text-xs font-bold border-none transition-all ${isCompiling ? 'bg-yellow-500/80 text-black' : 'bg-green-600 hover:bg-green-500 text-white'}`}
             >
                {isCompiling ? <Activity className="w-3 h-3 animate-spin mr-2" /> : <Play className="w-3 h-3 mr-2 fill-current" />}
                {isCompiling ? "RUNNING..." : "RUN CODE"}
             </Button>
          </div>
       </div>

       {/* EDITOR */}
       <div className="flex-1 relative min-h-0 bg-transparent">
          <Editor
             height="100%"
             defaultLanguage="javascript"
             language={language}
             value={code}
             onChange={(val) => setCode(val || "")}
             theme="glass-theme"
             options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 },
                fontFamily: "'JetBrains Mono', monospace",
                cursorBlinking: "smooth",
             }}
          />
       </div>

       {/* TERMINAL */}
       <div className="h-[30%] bg-black/90 border-t border-white/10 flex flex-col shrink-0">
          <div className="h-8 bg-white/5 flex items-center px-4 gap-2 border-b border-white/5 justify-between">
             <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3 text-neon-cyan" />
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Console Output</span>
             </div>
             {isCompiling && <Box className="w-3 h-3 text-yellow-500 animate-spin" />}
          </div>
          <div className="flex-1 p-3 font-mono text-xs overflow-y-auto custom-scrollbar space-y-1">
             {output.map((line, i) => (
                <div key={i} className={`${line.includes("Failed") || line.includes("Error") ? "text-red-400" : line.includes("PASSED") ? "text-green-400" : "text-gray-300"}`}>
                   {line}
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default CodeEditor;