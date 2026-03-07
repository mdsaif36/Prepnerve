import { useEffect, useState, useMemo, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api"; 
import { 
  Play, Trophy, ArrowUpRight, Zap, Crown, TrendingUp, 
  Swords, Users, Database, Cpu, Loader2
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

// --- TYPES ---
interface NewsItem {
  id: number;
  title: string;
  category: string;
  time: string;
  summary: string;
}

// --- BACKGROUND PARTICLES (Consistent with Auth/Index) ---
const Particles = memo(() => {
  const particlesData = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.4 + 0.2,
      yDest: Math.random() * -50 - 20,
      xDest: Math.random() * 30 - 15,
      duration: Math.random() * 4 + 4,
      color: i % 3 === 0 ? 'bg-cyan-400' : i % 3 === 1 ? 'bg-blue-500' : 'bg-purple-500',
      shadow: i % 3 === 0 ? '#22d3ee' : i % 3 === 1 ? '#3b82f6' : '#a855f7',
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particlesData.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.color}`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            top: `${p.top}%`,
            left: `${p.left}%`,
            opacity: p.opacity,
            boxShadow: `0 0 10px ${p.shadow}`,
          }}
          animate={{
            y: [0, p.yDest],
            x: [0, p.xDest],
            opacity: [p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
});
Particles.displayName = "Particles";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

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
      <div className="min-h-screen bg-[#060813] flex flex-col items-center justify-center text-cyan-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
        <span className="font-mono text-sm tracking-[0.3em] uppercase font-bold">Initializing Hub...</span>
      </div>
    );
  }

  // Safe Name Extraction
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Engineer";

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#060813] text-white font-sans selection:bg-cyan-500/30 relative overflow-hidden">
        <Navbar />
        
        {/* --- IMMERSIVE BACKGROUND --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            {/* Tech Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            {/* Ambient Glows */}
            <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full" />
            <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full" />
            {/* Floating Particles */}
            <Particles />
        </div>

        <div className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto">
          
          {/* --- DYNAMIC HEADER --- */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-16 relative"
          >
             <h1 className="text-5xl md:text-4xl font-black tracking-tighter text-white leading-[1.1] uppercase">
               {isNewUser ? (
                 <>
                    SYSTEM INITIALIZED, <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        {firstName}
                    </span>
                 </>
               ) : (
                 <>
                    WELCOME BACK, <br /> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        {firstName}
                    </span>
                 </>
               )}
             </h1>
          </motion.div>

          {/* --- MAIN ANIMATED GRID --- */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            
            {/* 1. START INTERVIEW */}
            <motion.div variants={itemVariants} onClick={() => navigate("/cv-upload")} className="md:col-span-6 relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f18]/80 backdrop-blur-md transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_60px_rgba(59,130,246,0.2)] hover:-translate-y-1 min-h-[300px]">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
                  <Play className="w-64 h-64 text-blue-500" />
               </div>
               <div className="relative z-10 p-8 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-auto">
                     <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-500">
                        <Play className="w-6 h-6 fill-current" />
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">Solo Training</div>
                  </div>
                  <div className="mt-8">
                     <h2 className="text-3xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">Neural Simulation</h2>
                     <p className="text-gray-400 max-w-sm text-sm leading-relaxed font-light">Initialize a hyper-realistic 3D AI interview session tailored to your profile.</p>
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-sm font-black text-white group-hover:text-blue-400 group-hover:translate-x-2 transition-all uppercase tracking-widest">
                      Engage Protocol <ArrowUpRight className="w-4 h-4" />
                  </div>
               </div>
            </motion.div>

            {/* 2. BATTLE ARENA */}
            <motion.div variants={itemVariants} onClick={() => navigate("/battle-lobby")} className="md:col-span-6 relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f18]/80 backdrop-blur-md transition-all duration-500 hover:border-red-500/50 hover:shadow-[0_0_60px_rgba(239,68,68,0.2)] hover:-translate-y-1 min-h-[300px]">
               <div className="absolute inset-0 bg-gradient-to-bl from-red-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="absolute top-8 right-8 flex items-center gap-3 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                   <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                   </span>
                   <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Live PvP</span>
               </div>
               <div className="absolute -left-10 -bottom-10 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                  <Swords className="w-64 h-64 text-red-500" />
               </div>
               <div className="relative z-10 p-8 h-full flex flex-col items-end text-right">
                  <div className="flex justify-end items-start mb-auto w-full">
                     <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-500">
                         <Users className="w-6 h-6" />
                     </div>
                  </div>
                  <div className="mt-8">
                     <h2 className="text-3xl font-black text-white mb-2 group-hover:text-red-400 transition-colors uppercase tracking-tight">Battle Arena</h2>
                     <p className="text-gray-400 max-w-sm text-sm leading-relaxed font-light ml-auto">Compete in real-time 1v1 algorithmic duels against global engineers.</p>
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-sm font-black text-white group-hover:text-red-400 group-hover:-translate-x-2 transition-all uppercase tracking-widest">
                      Enter Matrix <ArrowUpRight className="w-4 h-4" />
                  </div>
               </div>
            </motion.div>

            {/* 3. INTELLIGENCE BANK */}
            <motion.div variants={itemVariants} onClick={() => navigate("/intelligence")} className="md:col-span-4 relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f18]/80 backdrop-blur-md transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_50px_rgba(34,211,238,0.15)] hover:-translate-y-1 p-8 flex flex-col h-full">
               <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                     <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black group-hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300">
                        <Database className="w-6 h-6" />
                     </div>
                     <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="mt-12">
                    <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">Data Bank</h2>
                    <p className="text-gray-400 text-xs font-light leading-relaxed">Access the global corporate question dataset.</p>
                  </div>
                  <div className="mt-6 flex -space-x-2 overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity">
                    {[1,2,3].map((i) => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0a0f18] bg-cyan-950 flex items-center justify-center border border-cyan-500/30">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                    ))}
                    <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-[#0a0f18] bg-black text-[10px] font-black text-cyan-400 border border-cyan-500/50">+99</div>
                  </div>
               </div>
            </motion.div>

            {/* 4. CV INTELLIGENCE */}
            <motion.div variants={itemVariants} onClick={() => navigate("/cv-score")} className="md:col-span-4 relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f18]/80 backdrop-blur-md transition-all duration-500 hover:border-purple-500/50 hover:shadow-[0_0_50px_rgba(168,85,247,0.15)] hover:-translate-y-1 p-8 flex flex-col h-full">
               <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                     <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300">
                         <Zap className="w-6 h-6" />
                     </div>
                     <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div className="mt-12">
                     <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-purple-400 transition-colors">CV Intelligence</h3>
                     <p className="text-gray-400 text-xs font-light leading-relaxed">ATS Vector Parsing & Deep Optimization.</p>
                  </div>
               </div>
            </motion.div>

            {/* 5. GLOBAL RANKINGS */}
            <motion.div variants={itemVariants} onClick={() => navigate("/leaderboard")} className="md:col-span-4 relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f18]/80 backdrop-blur-md transition-all duration-500 hover:border-yellow-500/50 hover:shadow-[0_0_50px_rgba(234,179,8,0.15)] hover:-translate-y-1 p-8 flex flex-col h-full">
               <div className="absolute inset-0 bg-gradient-to-tl from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black group-hover:shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all duration-300">
                         <Crown className="w-6 h-6" />
                     </div>
                     <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[10px] font-black font-mono tracking-tighter">
                         <TrendingUp className="w-3 h-3" /> #{userRank.position}
                     </div>
                  </div>
                  <div className="mt-6">
                     <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-yellow-500 transition-colors">Leaderboards</h3>
                     <p className="text-gray-400 text-xs mb-4 font-light">Global Standing: <span className="text-white font-bold">{userRank.percentile}</span></p>
                     <div className="h-1.5 w-full bg-black rounded-full overflow-hidden flex items-center border border-white/5">
                         <div className="h-full bg-yellow-500 w-[85%] shadow-[0_0_10px_orange]" />
                     </div>
                  </div>
               </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Hub;
