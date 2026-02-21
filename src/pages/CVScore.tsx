import { useState } from "react";
import axios from "axios";
import { 
  UploadCloud, FileText, CheckCircle2, XCircle, 
  AlertTriangle, Trash2, Search, Cpu, 
  ScanLine, ShieldCheck, Binary, Activity, 
  Terminal, Share2, Image as ImageIcon, AlertOctagon
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// --- TYPES ---
interface AnalysisItem {
  type: 'success' | 'warning' | 'critical' | 'remove';
  msg: string;
}

interface AnalysisCategory {
  category: string;
  items: AnalysisItem[];
}

const CVScore = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [score, setScore] = useState(0);
  const [selectionChance, setSelectionChance] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisCategory[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  
  // --- ACTIONS ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      await startAnalysis(uploadedFile);
    }
  };

  const startAnalysis = async (fileToUpload: File) => {
    setStatus('scanning');
    setLogs([]);
    setScore(0);
    setAnalysis([]);

    const systemSteps = [
      "ESTABLISHING SECURE CONNECTION...",
      "QUANTUM PARSING INITIATED...",
      "DECODING TEXT LAYERS...",
      "RUNNING HEURISTIC ALGORITHMS...",
      "COMPILING NEURAL REPORT..."
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < systemSteps.length) {
        setLogs(prev => [...prev, `> ${systemSteps[stepIndex]}`]);
        stepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 600);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      // 👇 FIXED: Points to Render Backend
      const response = await axios.post('https://prepnerveserver.onrender.com/api/cv-score/analyze', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const data = response.data;
      
      setTimeout(() => {
        setStatus('complete');
        setScore(data.score || 0);
        setSelectionChance(data.selectionChance || 0);
        setAnalysis(data.analysis || []);
        toast.success("SYSTEM ANALYSIS COMPLETE");
      }, 3500);

    } catch (error: any) {
      console.error(error);
      setStatus('idle');
      toast.error(error.response?.data?.error || "SYSTEM FAILURE. CHECK CONNECTION.");
    }
  };

  const resetUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setStatus('idle');
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-cyan-50 font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* CYBER BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-cyan-500/20 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
               <div className="px-2 py-0.5 border border-cyan-500/30 bg-cyan-950/30 text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                 System v4.0 Online
               </div>
               <div className="h-1 w-1 bg-cyan-500 rounded-full animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase glitch-text">
              Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-200 to-purple-400">Architect</span>
            </h1>
            <p className="text-cyan-400/60 font-mono text-xs md:text-sm max-w-lg">
              // ADVANCED RESUME TELEMETRY & OPTIMIZATION ENGINE
            </p>
          </div>
          
          <div className="hidden md:block text-right space-y-1">
             <div className="flex items-center gap-2 justify-end text-xs text-cyan-500/70 font-mono">
               <ShieldCheck className="w-3 h-3" /> ENCRYPTED CONNECTION
             </div>
             <div className="flex items-center gap-2 justify-end text-xs text-cyan-500/70 font-mono">
               <Cpu className="w-3 h-3" /> PROCESSING POWER: 100%
             </div>
          </div>
        </div>

        {/* MAIN INTERFACE GRID */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: UPLOAD MODULE */}
          <div className="lg:col-span-4 space-y-6">
             <div className={`relative group h-96 flex flex-col items-center justify-center transition-all duration-500 overflow-hidden
                 backdrop-blur-xl border-2 
                 ${status === 'scanning' 
                   ? 'border-cyan-400/50 bg-black/80 shadow-[0_0_40px_rgba(6,182,212,0.2)]' 
                   : 'border-cyan-500/10 bg-cyan-950/10 hover:border-cyan-400/40 hover:bg-cyan-950/20'
                 } rounded-[20px]`}>
                
                {status === 'idle' && (
                  <>
                    <input 
                      type="file" 
                      accept=".pdf, .png, .jpg, .jpeg, .webp" 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer z-50" 
                    />
                    
                    <div className="relative mb-6 group-hover:scale-110 transition-transform duration-500">
                       <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
                       <div className="relative w-20 h-20 bg-black/40 border border-cyan-500/30 rounded-xl flex items-center justify-center backdrop-blur-md">
                          <UploadCloud className="w-10 h-10 text-cyan-400" />
                       </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white tracking-widest uppercase">Upload Data</h3>
                    <p className="text-xs text-cyan-400/50 font-mono mt-2 text-center px-8">
                      [ SUPPORTED FORMATS: PDF / IMG ]
                    </p>
                  </>
                )}

                {status === 'scanning' && (
                  <div className="w-full h-full p-6 flex flex-col relative">
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(6,182,212,0.1)_50%,transparent_100%)] animate-scan" style={{ backgroundSize: '100% 200%' }} />
                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-4 border-b border-cyan-500/20 pb-2">
                       <ScanLine className="w-4 h-4 animate-pulse" /> SYSTEM_ANALYSIS_IN_PROGRESS
                    </div>
                    <div className="flex-1 font-mono text-[10px] text-cyan-300 space-y-1 overflow-hidden opacity-80">
                       {logs.map((log, i) => (
                         <div key={i} className="animate-in fade-in slide-in-from-left-2">{log}</div>
                       ))}
                       <div className="w-2 h-4 bg-cyan-400 animate-pulse inline-block align-middle ml-1" />
                    </div>
                  </div>
                )}

                {status === 'complete' && file && (
                   <div className="flex flex-col items-center w-full px-6 z-10">
                      <div className="w-16 h-16 bg-cyan-950/50 rounded-xl flex items-center justify-center border border-cyan-500/40 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                         {file.type.includes('image') ? <ImageIcon className="w-8 h-8 text-cyan-400"/> : <FileText className="w-8 h-8 text-cyan-400"/>}
                      </div>
                      <p className="font-bold text-white text-sm truncate max-w-[200px]">{file.name}</p>
                      <Badge variant="outline" className="mt-2 border-cyan-500/30 text-cyan-400 bg-cyan-950/30 font-mono text-[10px]">
                        ANALYSIS_SUCCESS
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={resetUpload} className="mt-6 text-cyan-400 hover:text-white hover:bg-cyan-950/50 font-mono text-xs">
                        {`< UPLOAD_NEW_FILE />`}
                      </Button>
                   </div>
                )}
             </div>

             {/* METRICS */}
             {status === 'complete' && (
               <div className="space-y-4 animate-in slide-in-from-bottom-10 duration-700">
                 <div className="relative overflow-hidden rounded-[20px] border border-cyan-500/20 bg-black/40 p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-4">
                       <p className="text-[10px] font-bold text-cyan-500/60 font-mono tracking-widest uppercase">Compatibility Index</p>
                       <Binary className="w-4 h-4 text-cyan-500/40" />
                    </div>
                    <div className="flex items-end gap-2">
                       <span className="text-6xl font-black text-white tracking-tighter" style={{ textShadow: `0 0 30px ${score >= 70 ? 'rgba(6,182,212,0.5)' : 'rgba(239,68,68,0.5)'}` }}>
                         {score}
                       </span>
                       <span className="text-xl text-cyan-500/40 font-mono mb-2">/100</span>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-cyan-950 rounded-full overflow-hidden">
                       <div className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-1000" style={{ width: `${score}%` }} />
                    </div>
                 </div>

                 <div className="relative overflow-hidden rounded-[20px] border border-purple-500/20 bg-black/40 p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-[10px] font-bold text-purple-500/60 font-mono tracking-widest uppercase">Selection Probability</p>
                       <Activity className="w-4 h-4 text-purple-500/40" />
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-4xl font-bold text-white">{selectionChance}%</span>
                       <Badge className={`${selectionChance > 70 ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'} border font-mono text-[10px]`}>
                         {selectionChance > 70 ? 'HIGH_PROBABILITY' : 'LOW_PROBABILITY'}
                       </Badge>
                    </div>
                 </div>
               </div>
             )}
          </div>

          {/* RIGHT: DATA TERMINAL */}
          <div className="lg:col-span-8">
            {status === 'complete' ? (
              <Card className="bg-black/60 border border-cyan-500/20 rounded-[20px] overflow-hidden backdrop-blur-xl h-full min-h-[600px] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in duration-1000">
                <Tabs defaultValue="critical" className="flex-1 flex flex-col">
                  
                  {/* Tab Header */}
                  <div className="border-b border-cyan-500/10 p-6 bg-cyan-950/5">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <Terminal className="w-5 h-5 text-cyan-400" />
                          <h2 className="text-xl font-bold text-white tracking-wide">DIAGNOSTIC REPORT</h2>
                       </div>
                    </div>
                    
                    <TabsList className="bg-black border border-cyan-500/20 w-full justify-start h-auto p-1 rounded-lg">
                      <TabsTrigger value="critical" className="flex-1 py-3 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300 data-[state=active]:border-red-500/50 border border-transparent rounded-md font-mono text-xs transition-all text-red-500/50 hover:text-red-400">
                         [ ! ] CRITICAL ALERTS
                      </TabsTrigger>
                      <TabsTrigger value="remove" className="flex-1 py-3 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300 data-[state=active]:border-orange-500/50 border border-transparent rounded-md font-mono text-xs transition-all text-orange-500/50 hover:text-orange-400">
                         [ - ] REDUNDANT DATA
                      </TabsTrigger>
                      <TabsTrigger value="tech" className="flex-1 py-3 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-500/50 border border-transparent rounded-md font-mono text-xs transition-all text-cyan-500/50 hover:text-cyan-400">
                         [ + ] SKILL MATRIX
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 p-0 relative"> 
                    <ScrollArea className="h-[500px] p-6">
                      
                      {/* CRITICAL TAB (Fixing Color Visibility) */}
                      <TabsContent value="critical" className="mt-0 space-y-4">
                        {analysis.find(a => a.category === "Critical Fixes")?.items.map((item, i) => (
                           <div key={i} className="group relative overflow-hidden p-5 rounded-lg border border-red-500/50 bg-red-950/20 hover:bg-red-900/30 transition-all shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 group-hover:shadow-[0_0_10px_#ef4444] transition-all" />
                              <div className="flex gap-4 items-start pl-2">
                                 <AlertOctagon className="w-6 h-6 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                                 <div className="space-y-1">
                                    <h4 className="text-red-400 font-bold text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
                                       Error Code: CRITICAL
                                    </h4>
                                    <p className="text-base text-red-100 font-medium leading-relaxed font-mono">{item.msg}</p>
                                 </div>
                              </div>
                           </div>
                        ))}
                        {!analysis.find(a => a.category === "Critical Fixes")?.items.length && (
                           <div className="flex flex-col items-center justify-center h-48 text-cyan-500/40">
                              <ShieldCheck className="w-16 h-16 mb-4 opacity-50 text-emerald-500" />
                              <p className="font-mono text-lg text-emerald-400/80">SYSTEM OPTIMAL. NO THREATS.</p>
                           </div>
                        )}
                      </TabsContent>

                      {/* REMOVE TAB (High Contrast Orange) */}
                      <TabsContent value="remove" className="mt-0 space-y-3">
                        {analysis.find(a => a.category === "What To Remove")?.items.map((item, i) => (
                           <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-orange-500/40 bg-orange-950/20 hover:border-orange-400/60 hover:bg-orange-900/30 transition-all shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                              <div className="flex items-center gap-4">
                                 <div className="w-8 h-8 rounded bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-mono text-xs">
                                   0{i+1}
                                 </div>
                                 <span className="text-base text-orange-100 font-medium">{item.msg}</span>
                              </div>
                              <Trash2 className="w-5 h-5 text-orange-500" />
                           </div>
                        ))}
                      </TabsContent>

                      {/* TECH TAB */}
                      <TabsContent value="tech" className="mt-0">
                         <div className="grid gap-3">
                           {analysis.find(a => a.category.includes("Tech"))?.items.map((item, i) => (
                              <div key={i} className={`p-4 rounded-lg border flex items-center gap-3 ${
                                item.type === 'success' 
                                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-100' 
                                  : 'border-yellow-500/30 bg-yellow-950/20 text-yellow-100'
                              }`}>
                                 <div className={`w-2 h-2 rounded-full ${item.type === 'success' ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-yellow-400 shadow-[0_0_10px_#facc15]'}`} />
                                 <span className="text-sm font-mono tracking-wide">{item.msg}</span>
                              </div>
                           ))}
                         </div>
                      </TabsContent>

                    </ScrollArea>
                  </div>
                </Tabs>
              </Card>
            ) : (
              /* EMPTY STATE */
              <div className="h-full min-h-[600px] border border-dashed border-cyan-500/20 rounded-[20px] bg-cyan-950/5 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(6,182,212,0.05)_50%,transparent_100%)] animate-[float_4s_ease-in-out_infinite]" />
                 <div className="relative z-10 text-center space-y-4">
                    <div className="w-24 h-24 bg-black border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                       <Search className="w-10 h-10 text-cyan-500/50" />
                    </div>
                    <h2 className="text-2xl font-bold text-cyan-100 tracking-widest uppercase">Awaiting Input</h2>
                    <p className="text-sm text-cyan-500/60 font-mono max-w-xs mx-auto">
                       INITIATE UPLOAD TO BEGIN NEURAL DIAGNOSTICS SEQUENCE.
                    </p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .glitch-text { position: relative; }
        @keyframes scan {
          from { background-position: 0% 0%; }
          to { background-position: 0% 200%; }
        }
        .animate-scan { animation: scan 2s linear infinite; }
      `}</style>
    </div>
  );
};

export default CVScore;
