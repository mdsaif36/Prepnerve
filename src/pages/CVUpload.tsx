import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import {
  UploadCloud,
  FileText,
  Clock,
  Play,
  Cpu
=======
import { 
  UploadCloud, FileText, Cpu, ShieldCheck, Play, 
  Settings2, Target, Gauge, Fingerprint 
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
} from "lucide-react";
import { toast } from "sonner";

const CVUpload = () => {
  const navigate = useNavigate();
<<<<<<< HEAD

  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState("30");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const selectedFile = e.target.files[0];
    if (selectedFile.type !== "application/pdf") {
      toast.error("PDF protocol required.");
      return;
    }

    setFile(selectedFile);
    toast.success("Resume ingested.");
=======
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [difficulty, setDifficulty] = useState("adaptive");
  const [focus, setFocus] = useState("Full Stack Developer"); 
  const [duration, setDuration] = useState("15");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
          toast.error("Protocol Mismatch: Only PDF files accepted.");
          return;
      }
      setFile(selectedFile);
      toast.success("Resume calibrated for simulation.");
    }
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
  };

  const startSimulation = async () => {
    if (!file) {
<<<<<<< HEAD
      toast.error("No resume detected.");
=======
      toast.error("Please upload a resume to initialize the neural engine.");
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
<<<<<<< HEAD
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      const resumeData = {
        fileName: data.filename,
        processed: true,
        chunks: data.chunks_created,
      };

      localStorage.setItem("resumeData", JSON.stringify(resumeData));

      navigate("/interview-session", {
        state: {
          resumeData,
          topic: "Auto-detected",
          duration,
          difficulty: "Auto-calibrated",
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Uplink failure.");
=======
      formData.append("resume", file);

      console.log("🚀 Sending Resume via Secure Fetch...");

      // 👇 FIXED: Points to Render Backend
      const response = await fetch("https://prepnerveserver.onrender.com/api/resume/upload", {
          method: "POST",
          body: formData,
          // ⚠️ IMPORTANT: Do NOT set Content-Type header. Fetch does it automatically.
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.error || "Server rejected the uplink.");
      }

      if (data.success) {
          const resumeData = data.data;

          localStorage.setItem("resumeData", JSON.stringify(resumeData));
          console.log("Neural Link Established:", resumeData);
          toast.success("Neural Link Established.");

          setTimeout(() => {
            navigate("/interview-session", { 
              state: { 
                resumeData: resumeData,
                topic: focus,
                duration: duration,
                difficulty: difficulty
              } 
            });
          }, 2000); 
      }

    } catch (error: any) {
      console.error("Upload Error:", error);
      toast.error(error.message || "Neural Uplink Failed. Check Backend Connection.");
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
      setIsAnalyzing(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#05070c] text-slate-200 font-mono">
      <Navbar />

      {/* Cyber Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-40" />

      {/* Loader */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <p className="text-xs tracking-widest text-cyan-400">
              INTERVIEW SESSION
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-16 space-y-10">

        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
           Candidate Resume
          </h1>
          
        </div>

        {/* Main Panels */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Resume Panel */}
          <div className="bg-[#0a0f1c] border border-slate-800 rounded-lg p-8">
            <h2 className="text-sm tracking-widest text-cyan-400 mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              CONTEXT INGESTION
            </h2>

            <label className="block h-56 border border-dashed border-slate-700 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition">
              <input type="file" accept=".pdf" hidden onChange={handleFileUpload} />

              {file ? (
                <>
                  <FileText className="w-8 h-8 text-cyan-400 mb-2" />
                  <p className="text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Resume vectorized
                  </p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-slate-500 mb-2" />
                  <p className="text-sm text-slate-400">
                    Upload resume (PDF)
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Drag or click
                  </p>
                </>
              )}
            </label>
          </div>

          {/* Duration Panel */}
          <div className="bg-[#0a0f1c] border border-slate-800 rounded-lg p-8">
            <h2 className="text-sm tracking-widest text-cyan-400 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              RUNTIME PARAMETERS
            </h2>

            <div className="space-y-3">
              {["15", "30", "45"].map((time) => (
                <button
                  key={time}
                  onClick={() => setDuration(time)}
                  className={`w-full px-4 py-4 rounded-md border text-left transition ${
                    duration === time
                      ? "border-cyan-400 bg-cyan-400/5"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <span className="text-sm tracking-wide">
                    {time} MINUTES
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <Button
            onClick={startSimulation}
            disabled={isAnalyzing}
            className="h-12 px-10 bg-cyan-400/90 hover:bg-cyan-400 text-black rounded-md tracking-widest text-sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Session
          </Button>
=======
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-neon-cyan/30">
      <Navbar />
      
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f29372e_1px,transparent_1px),linear-gradient(to_bottom,#1f29372e_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center">
           <div className="w-24 h-24 rounded-full border-4 border-neon-cyan/30 border-t-neon-cyan animate-spin mb-8" />
           <h2 className="text-3xl font-black text-white tracking-widest animate-pulse">SYSTEM CHECK INITIATED</h2>
           <div className="mt-4 space-y-2 text-center font-mono text-xs text-neon-cyan">
              <p>LOADING_NEURAL_MODELS... [OK]</p>
              <p>PARSING_RESUME_VECTORS... [OK]</p>
              <p>ESTABLISHING_SECURE_UPLINK... [OK]</p>
           </div>
        </div>
      )}

      <div className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
        
        <div className="mb-12 border-b border-white/10 pb-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan text-xs font-mono tracking-widest uppercase mb-4">
              <Cpu className="w-3 h-3" /> PRE-FLIGHT CONFIGURATION
           </div>
           <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              INITIALIZE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500">SIMULATION</span>
           </h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <FileText className="w-4 h-4" /> 1. Upload Context
            </h3>
            
            <div className={`relative group border-2 border-dashed border-white/20 hover:border-neon-cyan/50 bg-white/5 h-[400px] rounded-[2rem] flex flex-col items-center justify-center transition-all duration-300 ${file ? 'border-neon-cyan bg-neon-cyan/5' : ''}`}>
               <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
               
               {file ? (
                 <div className="text-center p-6">
                    <div className="w-20 h-20 bg-neon-cyan/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neon-cyan/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                       <Fingerprint className="w-10 h-10 text-neon-cyan" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1 truncate max-w-[200px] mx-auto">{file.name}</h4>
                    <p className="text-neon-cyan text-xs font-mono uppercase tracking-widest">Context Loaded</p>
                 </div>
               ) : (
                 <div className="text-center p-6">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                       <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-neon-cyan" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Drop Resume</h4>
                    <p className="text-gray-500 text-sm max-w-[200px] mx-auto">AI will parse your skills to generate relevant questions.</p>
                 </div>
               )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
             <div className="space-y-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <Settings2 className="w-4 h-4" /> 2. Mission Parameters
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                   <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 text-neon-cyan mb-3">
                         <Gauge className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Complexity</span>
                      </div>
                      <div className="flex gap-2">
                         {['Junior', 'Adaptive', 'Senior'].map((level) => (
                            <button
                               key={level}
                               onClick={() => setDifficulty(level.toLowerCase())}
                               className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                                  difficulty === level.toLowerCase() 
                                    ? 'bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                               }`}
                            >
                               {level}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 text-purple-500 mb-3">
                         <Target className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Duration</span>
                      </div>
                      <div className="flex gap-2">
                         {['15m', '30m', '45m'].map((time) => (
                            <button
                               key={time}
                               onClick={() => setDuration(time.replace('m', ''))}
                               className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                                  duration === time.replace('m', '') 
                                    ? 'bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                               }`}
                            >
                               {time}
                            </button>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl">
                   <div className="mb-4">
                      <label className="text-sm font-bold text-white">Technical Focus</label>
                      <p className="text-xs text-gray-500">Select the primary domain for this interview session.</p>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'Frontend Developer', label: 'Frontend' },
                        { id: 'Backend Developer', label: 'Backend' },
                        { id: 'Full Stack Developer', label: 'Full Stack' },
                        { id: 'System Architect', label: 'Sys Design' }
                      ].map((item) => (
                         <button
                            key={item.id}
                            onClick={() => setFocus(item.id)}
                            className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                               focus === item.id 
                                 ? 'bg-white text-black border-white' 
                                 : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                         >
                            {item.label}
                         </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="pt-4">
                <Button 
                   onClick={startSimulation}
                   disabled={isAnalyzing}
                   className="w-full h-16 bg-gradient-to-r from-neon-cyan to-blue-600 hover:to-blue-500 text-white font-black text-lg tracking-widest uppercase rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] transition-all transform hover:scale-[1.02]"
                >
                   <Play className="w-6 h-6 mr-3 fill-current" /> {isAnalyzing ? "Initializing..." : "Initialize Interface"}
                </Button>
                <div className="mt-4 flex justify-center items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
                   <ShieldCheck className="w-3 h-3" /> Secure Neural Connection
                </div>
             </div>

          </div>
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
        </div>
      </div>
    </div>
  );
};

export default CVUpload;
