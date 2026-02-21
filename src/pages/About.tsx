import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Cpu, Database, Cloud, Shield, Zap, ArrowLeft, Code, Server } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-neon-cyan/30">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-16">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 text-gray-400 hover:text-white pl-0">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to System
          </Button>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
            SYSTEM ARCHITECTURE
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl border-l-2 border-neon-cyan pl-6">
            Technical specifications and operational logic behind the Prepnerve AI Interview Engine.
          </p>
        </div>

        {/* Core Modules Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-24">
          
          <div className="bg-white/5 border border-white/10 p-8 rounded-none relative overflow-hidden group hover:border-neon-cyan/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Cpu className="w-24 h-24" /></div>
            <div className="text-neon-cyan mb-4"><Zap className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold mb-2">Generative Core</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Powered by OpenAI's GPT-4o architecture. The system utilizes dynamic prompt engineering to construct context-aware interview questions based on the candidate's CV data.
            </p>
            <div className="flex gap-2 text-xs font-mono text-gray-500">
               <span className="bg-black/50 px-2 py-1">NLP</span>
               <span className="bg-black/50 px-2 py-1">Context Window: 128k</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-none relative overflow-hidden group hover:border-purple-500/50 transition-colors">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Database className="w-24 h-24" /></div>
            <div className="text-purple-500 mb-4"><Database className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold mb-2">Vector Memory</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Session history is stored using Supabase PostgreSQL with vector embeddings, allowing the AI to recall previous answers and ask follow-up questions for deeper analysis.
            </p>
            <div className="flex gap-2 text-xs font-mono text-gray-500">
               <span className="bg-black/50 px-2 py-1">PostgreSQL</span>
               <span className="bg-black/50 px-2 py-1">RLS Security</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-none relative overflow-hidden group hover:border-blue-500/50 transition-colors">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Cloud className="w-24 h-24" /></div>
            <div className="text-blue-500 mb-4"><Server className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold mb-2">Audio Pipeline</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Hybrid speech recognition utilizing WebSpeech API for low-latency browser transcription and OpenAI Whisper for high-fidelity post-processing analysis.
            </p>
            <div className="flex gap-2 text-xs font-mono text-gray-500">
               <span className="bg-black/50 px-2 py-1">WebRTC</span>
               <span className="bg-black/50 px-2 py-1">Whisper-1</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-none relative overflow-hidden group hover:border-green-500/50 transition-colors">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Shield className="w-24 h-24" /></div>
            <div className="text-green-500 mb-4"><Code className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold mb-2">Evaluation Logic</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Responses are graded against a strict rubric for technical accuracy, clarity, and relevance. The scoring engine penalizes brevity and rewards specific examples.
            </p>
            <div className="flex gap-2 text-xs font-mono text-gray-500">
               <span className="bg-black/50 px-2 py-1">Algorithm v2.1</span>
            </div>
          </div>

        </div>

        {/* Developer Note */}
        <div className="border-t border-white/10 pt-16">
          <h2 className="text-2xl font-bold mb-8">DEVELOPER NOTES</h2>
          <div className="font-mono text-sm text-gray-400 space-y-4 max-w-3xl">
            <p>{`> System Status: OPTIMAL`}</p>
            <p>{`> Latest Deployment: Full-Stack React + Vite + Supabase`}</p>
            <p>{`> Integration: Real-time 3D rendering (Three.js) enabled for immersive user experience.`}</p>
            <p className="pt-4 text-neon-cyan">{`> "We built Prepnerve to bridge the gap between technical knowledge and interview performance."`}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;