import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Swords, Users, Zap, Globe, Lock, ArrowRight, Copy, 
  Crown, Activity, Shield, User, Trophy, Skull
} from "lucide-react";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket"; 
import { useAuth } from "@/hooks/useAuth"; 
import api from "@/lib/api"; 
import { Dialog, DialogContent } from "@/components/ui/dialog";

const BattleLobby = () => {
  const navigate = useNavigate();
  const socket = getSocket();
  const { user, loading } = useAuth();
  
  // --- STATE ---
  const [selectedRankedMode, setSelectedRankedMode] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [customRoomId, setCustomRoomId] = useState("");
  const [generatedId, setGeneratedId] = useState("");
  const [privatePlayerCount, setPrivatePlayerCount] = useState(2); 

  // Waiting Room
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<any[]>([]);
  const [neededPlayers, setNeededPlayers] = useState(0);

  // Profile Modal
  const [showProfile, setShowProfile] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const myName = user?.user_metadata?.username || user?.email?.split('@')[0] || "Player";
  const myEmail = user?.email || "";

  // --- 1. AUTH PROTECTION ---
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please login to enter the Battle Arena");
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  // --- 2. FETCH STATS ---
  const fetchBattleStats = async () => {
    if (!user?.email) return;
    setLoadingStats(true);
    try {
        // ✅ FIX: Added '/api' prefix to match backend route
        const { data } = await api.get(`/api/stats/battle-profile?email=${user.email}`);
        setStats(data);
        setShowProfile(true);
    } catch (error) {
        console.error("Stats fetch error:", error);
        toast.error("Could not load battle data.");
    } finally {
        setLoadingStats(false);
    }
  };

  // --- 3. SOCKET LISTENERS ---
  useEffect(() => {
    if (!user) return; 

    const handleMatchFound = (data: any) => {
        toast.dismiss();
        toast.success("🔥 Match Found! Entering Arena...");
        setIsSearching(false);
        setWaitingForOthers(false);
        navigate("/battle-arena", { state: { roomId: data.roomId, problem: data.problem, players: data.players } });
    };

    const handleRoomCreated = ({ roomId }: { roomId: string }) => {
        setGeneratedId(roomId);
        toast.success(`Room Created: ${roomId}`);
        socket.emit('join_private_room', { roomId, email: myEmail, name: myName, playerCount: privatePlayerCount });
    };

    const handleRoomUpdate = (data: any) => {
        setWaitingForOthers(true);
        setRoomPlayers(data.players);
        setNeededPlayers(data.needed);
    };

    const handleError = (err: any) => {
        toast.error(err.message);
        setIsSearching(false);
        setWaitingForOthers(false);
    };

    socket.on('match_found', handleMatchFound);
    socket.on('room_created', handleRoomCreated);
    socket.on('room_update', handleRoomUpdate);
    socket.on('error', handleError);

    return () => {
        socket.off('match_found', handleMatchFound);
        socket.off('room_created', handleRoomCreated);
        socket.off('room_update', handleRoomUpdate);
        socket.off('error', handleError);
    };
  }, [socket, navigate, user, myEmail, myName, privatePlayerCount]);

  // --- HANDLERS ---
  const handleRankedSearch = () => {
    if (!selectedRankedMode) return toast.error("Select a Ranked Mode first!");
    setIsSearching(true);
    toast.info("Searching for opponent...");
    socket.emit('join_queue', { email: myEmail, name: myName, playerCount: selectedRankedMode });
  };

  const handleCreateRoom = () => {
    toast.info("Generating Secure Room...");
    socket.emit('create_private_room', { email: myEmail, name: myName, playerCount: privatePlayerCount });
  };

  const handleJoinRoom = () => {
    const idToJoin = customRoomId || generatedId;
    if (!idToJoin || idToJoin.length < 5) return toast.error("Enter a valid Room ID");
    socket.emit('join_private_room', { roomId: idToJoin.toUpperCase(), email: myEmail, name: myName });
    toast.info("Joining Room...");
  };

  if (loading) return <div className="min-h-screen bg-[#02040a] text-white flex items-center justify-center">Connecting...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-neon-cyan/30 overflow-hidden relative">
      <Navbar />

      {/* BACKGROUND FX */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      
      {/* --- PROFILE BUTTON (Top Right) --- */}
      <div className="absolute top-24 right-6 z-20">
          <Button 
            onClick={fetchBattleStats}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-2 rounded-full h-10 px-4 backdrop-blur-md"
          >
            <User className="w-4 h-4" /> My Battle Profile
          </Button>
      </div>

      {/* --- BATTLE PROFILE MODAL (PREMIUM DESIGN) --- */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-[#050505]/95 border border-white/10 text-white sm:max-w-[800px] p-0 overflow-hidden rounded-3xl backdrop-blur-2xl">
            {stats && (
                <div className="flex flex-col md:flex-row h-[500px]">
                    {/* LEFT: ID CARD */}
                    <div className="w-full md:w-[35%] bg-black/60 border-r border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-blue-600" />
                        
                        <div className="relative mb-6 group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan to-blue-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                            <div className="w-24 h-24 rounded-full bg-[#111] border border-white/20 flex items-center justify-center relative">
                                <span className="text-3xl font-black text-white">{myName.substring(0,2).toUpperCase()}</span>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1">{myName}</h2>
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neon-cyan mb-6">
                            Tier: {stats.stats.tier}
                        </div>

                        <div className="w-full grid grid-cols-2 gap-2 text-center">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-2xl font-black text-white">{stats.stats.wins}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Victories</div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-2xl font-black text-red-500">{stats.stats.losses}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Defeats</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: MATCH HISTORY */}
                    <div className="flex-1 bg-[#0a0a0a] p-8 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-neon-cyan" /> Recent Battles
                            </h3>
                            <div className="text-xs text-gray-500 font-mono">Win Rate: {stats.stats.winRate}%</div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {stats.history.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                                    <Swords className="w-8 h-8 opacity-20" />
                                    <span className="text-xs">No matches recorded yet.</span>
                                </div>
                            ) : (
                                stats.history.map((match: any) => (
                                    <div key={match.id} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${match.result === 'VICTORY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {match.result === 'VICTORY' ? <Trophy className="w-4 h-4" /> : <Skull className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase">VS {match.opponent}</div>
                                                <div className="text-[10px] text-gray-600 font-mono">{match.date}</div>
                                            </div>
                                        </div>
                                        <div className={`text-xs font-black tracking-widest ${match.result === 'VICTORY' ? 'text-green-500' : 'text-red-500'}`}>
                                            {match.result}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>

      {/* --- WAITING ROOM OVERLAY --- */}
      {waitingForOthers && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-in fade-in backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white mb-8">Lobby Waiting Room</h2>
            <div className="flex gap-4 mb-8">
                {roomPlayers.map((p, i) => (
                    <div key={i} className="w-32 h-32 bg-slate-800 rounded-xl border border-slate-700 flex flex-col items-center justify-center gap-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xl shadow-lg relative z-10">
                            {p.name[0].toUpperCase()}
                        </div>
                        <div className="font-bold text-sm text-center truncate w-full px-2 relative z-10">{p.name}</div>
                        <div className="text-[10px] text-green-400 font-mono bg-green-900/30 px-2 py-0.5 rounded relative z-10">READY</div>
                    </div>
                ))}
                {[...Array(Math.max(0, neededPlayers - roomPlayers.length))].map((_, i) => (
                    <div key={i} className="w-32 h-32 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center animate-pulse">
                        <Users className="w-8 h-8 text-slate-700 mb-2" />
                        <span className="text-gray-600 text-xs font-mono uppercase">Waiting...</span>
                    </div>
                ))}
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4 shadow-2xl">
                <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Room ID</span>
                <span className="text-2xl font-mono text-green-500 font-bold tracking-widest">{generatedId || customRoomId}</span>
                <Button size="icon" variant="ghost" onClick={() => {navigator.clipboard.writeText(generatedId || customRoomId); toast.success("Copied to clipboard")}} className="hover:bg-slate-800 text-white">
                    <Copy className="w-4 h-4" />
                </Button>
            </div>
            <Button variant="ghost" onClick={() => {setWaitingForOthers(false); window.location.reload()}} className="mt-8 text-red-500 hover:bg-red-500/10 hover:text-red-400">
                LEAVE LOBBY
            </Button>
        </div>
      )}

      {/* --- MAIN UI --- */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 relative z-10">
        <div className="text-center mb-16 animate-in slide-in-from-top-5 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSearching ? 'bg-yellow-500' : 'bg-green-500'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSearching ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            </span>
            <span className="text-xs font-mono text-gray-300 tracking-widest uppercase">
                {isSearching ? "SEARCHING FOR PLAYERS..." : `LOGGED IN AS: ${myName.toUpperCase()}`}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4">
            CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">BATTLEFIELD</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col group">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/20">
                   <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white">COMPETITIVE LEAGUE</h2>
                   <p className="text-sm text-gray-400">Match against players of similar skill rating.</p>
                </div>
             </div>
             <div className="grid sm:grid-cols-3 gap-4 mb-8 flex-1">
                {[
                    { id: 2, label: "DUEL (1v1)", desc: "Standard competitive format.", icon: Swords, color: "text-blue-400" },
                    { id: 3, label: "TRIPLE THREAT", desc: "Three players, one winner.", icon: Activity, color: "text-purple-400" },
                    { id: 4, label: "FATAL 4-WAY", desc: "Maximum chaos. High stakes.", icon: Zap, color: "text-red-400" }
                ].map((mode) => (
                   <div 
                      key={mode.id}
                      onClick={() => setSelectedRankedMode(mode.id)}
                      className={`group cursor-pointer relative p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-40 ${
                         selectedRankedMode === mode.id 
                           ? `bg-white/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]` 
                           : `bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/20`
                      }`}
                   >
                      <div className="flex justify-between items-start">
                         <mode.icon className={`w-8 h-8 ${mode.color}`} />
                         {selectedRankedMode === mode.id && <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_lime]" />}
                      </div>
                      <div>
                         <div className="font-bold text-white text-sm mb-1">{mode.label}</div>
                         <div className="text-[10px] text-gray-500 leading-tight">{mode.desc}</div>
                      </div>
                   </div>
                ))}
             </div>
             <Button 
                onClick={handleRankedSearch}
                disabled={isSearching || !selectedRankedMode}
                className={`w-full h-16 text-lg font-bold rounded-2xl transition-all shadow-xl ${
                   isSearching ? 'bg-white/5 text-gray-400 cursor-wait' : 'bg-white text-black hover:bg-blue-500 hover:text-white hover:scale-[1.01]'
                }`}
             >
                {isSearching ? (
                   <span className="flex items-center gap-3">
                      <Zap className="w-5 h-5 animate-spin" /> SEARCHING QUEUE...
                   </span>
                ) : (
                   <span className="flex items-center gap-2">
                      FIND RANKED MATCH <ArrowRight className="w-5 h-5" />
                   </span>
                )}
             </Button>
          </div>

          <div className="lg:col-span-5 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
             <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-green-500/5 blur-[80px] rounded-full pointer-events-none" />
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center shadow-lg shadow-green-900/20">
                   <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white">PRIVATE SECTOR</h2>
                   <p className="text-sm text-gray-400">Host lobbies for friends & rivals.</p>
                </div>
             </div>
             <div className="flex-1 flex flex-col justify-center space-y-8">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                   <div className="flex justify-between items-center mb-4">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                         <Crown className="w-3 h-3 text-yellow-500" /> Host Match
                      </div>
                   </div>
                   {!generatedId && (
                       <div className="flex gap-2 mb-4 bg-black/40 p-1 rounded-lg border border-white/10">
                           {[2, 3, 4].map(num => (
                               <button 
                                   key={num}
                                   onClick={() => setPrivatePlayerCount(num)}
                                   className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                                       privatePlayerCount === num 
                                       ? 'bg-green-600 text-white shadow-lg' 
                                       : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                   }`}
                               >
                                   {num} Players
                               </button>
                           ))}
                       </div>
                   )}
                   {generatedId ? (
                      <div className="flex gap-2">
                         <div className="flex-1 bg-black/50 border border-green-500/30 text-green-500 font-mono text-xl font-bold rounded-xl flex items-center justify-center tracking-widest h-12">
                            {generatedId}
                         </div>
                         <Button size="icon" className="h-12 w-12 bg-green-600 hover:bg-green-500 rounded-xl" onClick={() => {navigator.clipboard.writeText(generatedId); toast.success("Copied!");}}>
                            <Copy className="w-5 h-5" />
                         </Button>
                      </div>
                   ) : (
                      <Button onClick={handleCreateRoom} variant="outline" className="w-full h-12 border-dashed border-white/20 hover:border-green-500 hover:text-green-500 rounded-xl font-bold uppercase tracking-wider text-xs">
                         Generate Access Code
                      </Button>
                   )}
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-px bg-white/10 flex-1" />
                   <span className="text-xs font-bold text-gray-600 uppercase">OR</span>
                   <div className="h-px bg-white/10 flex-1" />
                </div>
                <div>
                   <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Users className="w-3 h-3" /> Join Lobby
                   </div>
                   <div className="flex gap-2">
                      <Input 
                         placeholder="ROOM ID..." 
                         value={customRoomId}
                         onChange={(e) => setCustomRoomId(e.target.value)}
                         className="h-14 bg-black border-white/10 text-lg font-mono uppercase tracking-widest focus:border-green-500 rounded-xl"
                      />
                      <Button onClick={handleJoinRoom} className="h-14 w-24 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl">
                         JOIN
                      </Button>
                   </div>
                </div>
             </div>
          </div>
        </div>
        <div className="mt-12 flex justify-center gap-8 text-[10px] text-gray-600 font-mono uppercase tracking-widest">
           <div className="flex items-center gap-2"><Shield className="w-3 h-3" /> Anti-Cheat Active</div>
           <div className="flex items-center gap-2"><Globe className="w-3 h-3" /> Server: US-East</div>
           <div className="flex items-center gap-2"><Activity className="w-3 h-3" /> {1200 + Math.floor(Math.random()*100)} Players Online</div>
        </div>
      </div>
    </div>
  );
};

export default BattleLobby;