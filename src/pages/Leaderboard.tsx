import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Trophy, Medal, Crown, Activity, Globe } from "lucide-react";
import { getSocket } from "@/lib/socket";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface Ranker {
  rank: number;
  name: string;
  score: number;
  sessions: number;
}

const Leaderboard = () => {
  const socket = getSocket();
  const [rankings, setRankings] = useState<Ranker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      // 👇 FIXED: Points to Render Backend
      const res = await axios.get('https://prepnerveserver.onrender.com/api/leaderboard');
      setRankings(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch leaderboard");
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial Fetch
    fetchLeaderboard();

    // 2. Real-Time Listener
    socket.on('leaderboard_update', () => {
      console.log("⚡ New Score Detected! Updating Leaderboard...");
      fetchLeaderboard(); // Re-fetch when someone finishes an interview
    });

    return () => {
      socket.off('leaderboard_update');
    };
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300 fill-gray-300/20" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600 fill-amber-600/20" />;
    return <span className="font-mono text-gray-500 font-bold">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-neon-cyan/30">
      <Navbar />
      
      {/* Background FX */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" pointerEvents="none" />

      <div className="relative z-10 px-6 pt-24 pb-12 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
             </span>
             <span className="text-xs font-mono text-green-400 tracking-widest uppercase">Live Global Rankings</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
            GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">LEADERBOARD</span>
          </h1>
          <p className="text-gray-400">Compete with interviewees from around the world.</p>
        </div>

        {/* Top 3 Podium (Visual Candy) */}
        {!loading && rankings.length >= 3 && (
            <div className="flex justify-center items-end gap-4 mb-16">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full border-2 border-gray-400 bg-gray-900 flex items-center justify-center text-xl font-bold mb-2 shadow-[0_0_20px_rgba(156,163,175,0.3)]">
                        {rankings[1].name.charAt(0).toUpperCase()}
                    </div>
                    <div className="h-24 w-24 bg-gradient-to-t from-gray-800 to-gray-700 rounded-t-lg flex items-center justify-center text-2xl font-black text-gray-300">2</div>
                    <div className="text-sm font-bold mt-2 text-gray-400">{rankings[1].name}</div>
                    <div className="text-xs text-neon-cyan font-mono">{rankings[1].score} XP</div>
                </div>
                
                {/* 1st Place */}
                <div className="flex flex-col items-center z-10">
                    <Crown className="w-8 h-8 text-yellow-400 mb-2 animate-bounce" />
                    <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-yellow-900/20 flex items-center justify-center text-3xl font-bold mb-2 shadow-[0_0_30px_rgba(250,204,21,0.5)] text-yellow-400">
                        {rankings[0].name.charAt(0).toUpperCase()}
                    </div>
                    <div className="h-32 w-32 bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-lg flex items-center justify-center text-4xl font-black text-white shadow-lg">1</div>
                    <div className="text-lg font-bold mt-2 text-yellow-400">{rankings[0].name}</div>
                    <div className="text-sm text-white font-mono bg-yellow-500/20 px-2 py-0.5 rounded border border-yellow-500/50">{rankings[0].score} XP</div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full border-2 border-amber-700 bg-gray-900 flex items-center justify-center text-xl font-bold mb-2 shadow-[0_0_20px_rgba(180,83,9,0.3)]">
                        {rankings[2].name.charAt(0).toUpperCase()}
                    </div>
                    <div className="h-20 w-24 bg-gradient-to-t from-amber-800 to-amber-700 rounded-t-lg flex items-center justify-center text-2xl font-black text-amber-200">3</div>
                    <div className="text-sm font-bold mt-2 text-gray-400">{rankings[2].name}</div>
                    <div className="text-xs text-neon-cyan font-mono">{rankings[2].score} XP</div>
                </div>
            </div>
        )}

        {/* List View */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6">User</div>
            <div className="col-span-2 text-center">Sessions</div>
            <div className="col-span-2 text-right">Score</div>
          </div>

          <div className="divide-y divide-white/5">
            <AnimatePresence>
                {loading ? (
                    <div className="p-8 text-center text-gray-500 animate-pulse">Loading rankings...</div>
                ) : (
                    rankings.map((user) => (
                        <motion.div 
                            key={user.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors ${user.rank <= 3 ? 'bg-white/5' : ''}`}
                        >
                            <div className="col-span-2 flex justify-center">
                                {getRankIcon(user.rank)}
                            </div>
                            <div className="col-span-6 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    user.rank === 1 ? 'bg-yellow-500 text-black' : 
                                    user.rank === 2 ? 'bg-gray-400 text-black' : 
                                    user.rank === 3 ? 'bg-amber-600 text-white' : 
                                    'bg-slate-800 text-gray-400'
                                }`}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className={user.rank <= 3 ? "text-white font-bold" : "text-gray-300"}>
                                    {user.name}
                                </span>
                                {user.rank <= 3 && <Globe className="w-3 h-3 text-blue-500" />}
                            </div>
                            <div className="col-span-2 text-center text-gray-500 font-mono text-sm">
                                {user.sessions}
                            </div>
                            <div className="col-span-2 text-right font-mono font-bold text-neon-cyan">
                                {user.score}
                            </div>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;
