import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api"; 
import { 
  Play, Trophy, ArrowUpRight, Zap, Crown, TrendingUp, 
  Swords, Users, Radio, ArrowRight, Clock, ShieldAlert
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
interface NewsItem {
  id: number;
  title: string;
  category: string;
  time: string;
  summary: string;
}

const Hub = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  // --- STATE ---
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Handle New User State
  const queryParams = new URLSearchParams(location.search);
  const isNewUser = location.state?.isNewUser || queryParams.get("new") === "true";

  // Mock User Rank Data
  const userRank = {
    position: 42,
    percentile: "Top 5%",
    trend: "up" 
  };

  // 1. Auth Redirect
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // 2. Fetch Data (News Only)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const newsRes = await api.get('/api/news');
        setNews(newsRes.data || []); 
      } catch (error) {
        console.error("Data Fetch Error:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-neon-cyan animate-pulse">
        LOADING COMMAND CENTER...
      </div>
    );
  }

  // Safe Name Extraction
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Candidate";

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-neon-cyan/30">
        <Navbar />
        
        {/* Background Ambience */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f29372e_1px,transparent_1px),linear-gradient(to_bottom,#1f29372e_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-neon-cyan/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10 pt-32 pb-12 px-6 max-w-7xl mx-auto">
          
          {/* --- DYNAMIC HEADER --- */}
          <div className="mb-16 relative animate-in slide-in-from-top-4 duration-700">
             <div 
               onClick={() => navigate('/intelligence')}
               className="flex items-center gap-2 mb-3 cursor-pointer group"
             >
                 <div className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-cyan"></span>
                 </div>
                 <span className="text-xs font-mono text-neon-cyan tracking-[0.2em] uppercase group-hover:underline transition-all">
                    {isNewUser ? "INITIATING ONBOARDING SEQUENCE" : "SYSTEM OPERATIONAL // VIEW LATEST FEED"}
                 </span>
             </div>

             <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-tight">
               {isNewUser ? (
                 <>WELCOME, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-purple-500 animate-gradient-x">{firstName.toUpperCase()}</span></>
               ) : (
                 <>WELCOME BACK, <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">{firstName.toUpperCase()}</span></>
               )}
             </h1>
          </div>

          {/* --- MAIN GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* 1. START INTERVIEW */}
            <div onClick={() => navigate("/cv-upload")} className="md:col-span-6 relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-[#080808] transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_60px_rgba(59,130,246,0.15)] min-h-[300px]">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                  <Play className="w-64 h-64 text-blue-500" />
               </div>
               <div className="relative z-10 p-8 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-auto">
                     <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                        <Play className="w-6 h-6 fill-current" />
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">Solo Training</div>
                  </div>
                  <div className="mt-8">
                     <h2 className="text-4xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors uppercase">Neural Simulation</h2>
                     <p className="text-gray-400 max-w-sm text-sm leading-relaxed">Practice with our hyper-realistic 3D interviewer.</p>
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-sm font-bold text-white group-hover:translate-x-2 transition-transform">INITIALIZE <ArrowUpRight className="w-4 h-4" /></div>
               </div>
            </div>

            {/* 2. BATTLE ARENA */}
            <div onClick={() => navigate("/battle-lobby")} className="md:col-span-6 relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-[#080808] transition-all duration-500 hover:border-red-500/50 hover:shadow-[0_0_60px_rgba(239,68,68,0.15)] min-h-[300px]">
               <div className="absolute inset-0 bg-gradient-to-bl from-red-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="absolute top-8 right-8 flex items-center gap-2">
                   <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
                   <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live PvP</span>
               </div>
               <div className="absolute -left-10 -bottom-10 opacity-10 group-hover:opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                  <Swords className="w-64 h-64 text-red-500" />
               </div>
               <div className="relative z-10 p-8 h-full flex flex-col items-end text-right">
                  <div className="flex justify-end items-start mb-auto w-full">
                     <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-500"><Users className="w-6 h-6" /></div>
                  </div>
                  <div className="mt-8">
                     <h2 className="text-4xl font-black text-white mb-2 group-hover:text-red-500 transition-colors uppercase">Battle Arena</h2>
                     <p className="text-gray-400 max-w-sm text-sm leading-relaxed ml-auto">Real-time 1v1 coding duels.</p>
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-sm font-bold text-white group-hover:-translate-x-2 transition-transform">ENTER LOBBY <ArrowUpRight className="w-4 h-4" /></div>
               </div>
            </div>

            {/* 3. ANALYTICS */}
            <div onClick={() => navigate("/dashboard")} className="md:col-span-4 relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-[#080808] transition-all duration-500 hover:border-purple-500/50 hover:shadow-[0_0_50px_rgba(168,85,247,0.15)] p-8 flex flex-col h-full">
               <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                     <div className="p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300"><Trophy className="w-6 h-6" /></div>
                  </div>
                  <div><h2 className="text-xl font-bold text-white mb-1">Deep Analytics</h2><p className="text-gray-400 text-xs">View selection probability.</p></div>
                  <div className="flex items-end gap-1 h-12 w-full opacity-50 group-hover:opacity-100 transition-opacity mt-4">{[40, 70, 45, 90, 60, 80].map((h, i) => (<div key={i} className="flex-1 bg-white/10 hover:bg-purple-500 transition-colors duration-300 rounded-t-sm" style={{ height: `${h}%` }} />))}</div>
               </div>
            </div>

            {/* 4. CV INTELLIGENCE */}
            <div onClick={() => navigate("/cv-score")} className="md:col-span-4 relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-[#080808] transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] p-8">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300"><Zap className="w-6 h-6" /></div>
                     <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">CV Intelligence</h3>
                  <p className="text-gray-500 text-xs group-hover:text-gray-400 transition-colors">ATS Parsing & Optimization.</p>
               </div>
            </div>

            {/* 5. GLOBAL RANKINGS */}
            <div onClick={() => navigate("/leaderboard")} className="md:col-span-4 relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-[#080808] transition-all duration-500 hover:border-yellow-500/50 hover:shadow-[0_0_50px_rgba(234,179,8,0.15)] p-8">
               <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300"><Crown className="w-6 h-6" /></div>
                     <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[10px] font-bold font-mono"><TrendingUp className="w-3 h-3" /> #{userRank.position}</div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Leaderboards</h3>
                  <p className="text-gray-500 text-xs mb-3">Top <span className="text-white font-bold">{userRank.percentile}</span>.</p>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex items-center"><div className="h-full bg-yellow-500 w-[85%] shadow-[0_0_10px_orange]" /></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Hub;