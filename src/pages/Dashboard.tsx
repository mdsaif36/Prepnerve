import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Activity, Clock, BrainCircuit, Mic, Sparkles, Trophy, 
  Target, Share2, Download, Zap, CheckCircle, AlertCircle, 
  Code, TrendingUp, Lightbulb, XCircle, RefreshCw 
} from "lucide-react";
import PageTransition from "@/components/PageTransition"; // ✅ IMPORTED TRANSITION

// --- TYPES ---
interface DashboardStats {
  overallScore: number;
  selectionProb: string;
  duration: string;
  questionsAnswered: number;
  averagePerformance: number;
  codingAccuracy: number;
  speakingPace: number;
  skills: { [key: string]: number };
  sentimentTrend: number[];
  questionPerformance: { id: number; type: string; score: number; status: string }[];
  improvementFocus: {
    question: string;
    userAnswer: string;
    critique: string;
    aiSuggested: string;
    confidenceTip: string;
  };
  keyInsights: { type: "strength" | "improvement"; text: string }[];
}

// --- DEFAULT DATA ---
const DEFAULT_STATS: DashboardStats = {
  overallScore: 0,
  selectionProb: "Calculating...",
  duration: "0m",
  questionsAnswered: 0,
  averagePerformance: 0,
  codingAccuracy: 0, 
  speakingPace: 0, 
  skills: {
    Technical: 50,
    Communication: 50,
    Confidence: 50,
    ProblemSolving: 50,
    CulturalFit: 50
  },
  sentimentTrend: [50, 50, 50, 50, 50], 
  questionPerformance: [],
  improvementFocus: {
    question: "Loading...",
    userAnswer: "...",
    critique: "...",
    aiSuggested: "...",
    confidenceTip: "..."
  },
  keyInsights: []
};

// --- SUB-COMPONENTS ---

const RadarChart = ({ data }: { data: { [key: string]: number } }) => {
  const size = 200;
  const center = size / 2;
  const radius = 80;
  const keys = Object.keys(data);
  const total = keys.length;
  
  const getPoint = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (value / 100) * radius;
    return [center + Math.cos(angle) * r, center + Math.sin(angle) * r];
  };

  const polyPoints = keys.map((key, i) => getPoint(data[key], i).join(",")).join(" ");

  return (
    <div className="relative flex items-center justify-center h-64">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid */}
        {[20, 40, 60, 80, 100].map((r, i) => (
           <circle key={i} cx={center} cy={center} r={(r/100)*radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
        ))}
        {/* Axis Lines */}
        {keys.map((_, i) => {
          const [x, y] = getPoint(100, i);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" />;
        })}
        {/* Data Polygon */}
        <polygon points={polyPoints} fill="rgba(6, 182, 212, 0.2)" stroke="#06b6d4" strokeWidth="2" className="drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out" />
        {/* Labels */}
        {keys.map((key, i) => {
           const [x, y] = getPoint(115, i);
           return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" className="font-mono uppercase tracking-wider opacity-70">{key}</text>;
        })}
      </svg>
    </div>
  );
};

const SentimentGraph = ({ data }: { data: number[] }) => {
  if (!data || data.length === 0) return <div className="h-32 w-full flex items-center justify-center text-gray-600">No Data</div>;

  const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - val;
      return `${x},${y}`;
  }).join(" ");

  const fillPath = `M0,100 ${points.split(" ").map(p => "L" + p).join(" ")} L100,100 Z`;
  const strokePath = `M${points.split(" ").join(" L")}`;

  return (
      <div className="h-32 w-full relative">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                  </linearGradient>
              </defs>
              <path d={fillPath} fill="url(#purpleGradient)" className="transition-all duration-1000" />
              <path d={strokePath} fill="none" stroke="#a855f7" strokeWidth="2" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000" />
          </svg>
      </div>
  );
};

const CorrectnessGraph = ({ data, mounted }: { data: { id: number; type: string; score: number }[], mounted: boolean }) => {
  return (
    <div className="h-48 w-full flex items-end justify-between gap-4 relative px-2">
      {/* Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 z-0">
         <div className="border-t border-gray-500 w-full" />
         <div className="border-t border-gray-500 w-full" />
         <div className="border-t border-gray-500 w-full" />
      </div>

      {data.map((q, i) => {
        let colorClass = "bg-green-500"; 
        if (q.score < 50) colorClass = "bg-red-500";
        else if (q.score < 80) colorClass = "bg-yellow-500";

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 relative z-10 group cursor-pointer">
             {/* Tooltip */}
             <div className="absolute -top-10 bg-black border border-white/20 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                {q.type}: {q.score}%
             </div>
             {/* Bar */}
             <div className="w-full max-w-[50px] bg-gray-800 rounded-t-sm relative h-full flex items-end overflow-hidden">
                <div 
                  className={`w-full ${colorClass} transition-all duration-1000 ease-out opacity-80 group-hover:opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                  style={{ height: mounted ? `${q.score}%` : '0%' }}
                />
             </div>
             <span className="text-[10px] font-mono text-gray-500">Q{q.id}</span>
          </div>
        );
      })}
    </div>
  );
};

// --- MAIN COMPONENT ---

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const email = user?.email || "demo@example.com";

      const { data } = await api.get(`/api/dashboard/stats?email=${email}`);

      setStats(prev => ({
        ...prev,
        ...data,
        // Ensure specific nested merges if API sends partials
        skills: data.skills || prev.skills,
        improvementFocus: data.improvementFocus || prev.improvementFocus
      }));

    } catch (err) {
      console.error("Failed to load dashboard stats", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#02040a] text-white flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-2xl font-bold">Failed to load data</h2>
        <Button onClick={fetchDashboardData} variant="outline" className="border-white/20 text-white hover:bg-white/10">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <PageTransition> {/* ✅ WRAPPED ENTIRE DASHBOARD IN TRANSITION */}
      <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-neon-cyan/30">
        <Navbar />
        
        {/* Background Ambience */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f29372e_1px,transparent_1px),linear-gradient(to_bottom,#1f29372e_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        
        <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-8">
          
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${loading ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                  {loading ? "Syncing Data..." : "Analysis Complete"}
                </span>
                <span className="text-gray-500 text-xs font-mono">ID: 8X-{Math.floor(Math.random() * 9000) + 1000}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                SESSION <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500">REPORT</span>
              </h1>
            </div>
            <div className="flex gap-3">
               <Button variant="outline" className="border-white/10 hover:bg-white/5 text-gray-300"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
               <Button className="bg-neon-cyan text-black font-bold hover:bg-white transition-colors"><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
            </div>
          </div>

          {/* --- KEY METRICS --- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
             {[
               { label: "CV Score", value: `${stats.overallScore}`, icon: Trophy, color: "text-yellow-400" },
               { label: "Selection Prob.", value: stats.selectionProb, icon: Target, color: "text-neon-cyan" },
               { label: "Interviews", value: stats.questionsAnswered, icon: Clock, color: "text-purple-400" },
               { label: "Avg. Performance", value: `${stats.averagePerformance}%`, icon: BrainCircuit, color: "text-pink-400" },
             ].map((stat, i) => (
               <Card key={i} className="bg-[#080808] border border-white/10 p-6 flex flex-col items-center justify-center hover:border-white/20 transition-colors group">
                  <stat.icon className={`w-6 h-6 ${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-500 font-mono uppercase tracking-wide">{stat.label}</div>
               </Card>
             ))}
          </div>

          {/* --- SECTION 1: PERFORMANCE OVERVIEW --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Radar Chart */}
             <Card className="bg-[#080808] border border-white/10 p-8 flex flex-col relative overflow-hidden h-[400px]">
                <div className="absolute top-0 right-0 p-4 opacity-5"><BrainCircuit className="w-32 h-32" /></div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                   <Activity className="w-4 h-4 text-neon-cyan" /> Skill Breakdown
                </h3>
                <RadarChart data={stats.skills} />
             </Card>

             {/* Sentiment & Pace */}
             <div className="lg:col-span-2 space-y-6">
                <Card className="bg-[#080808] border border-white/10 p-8 relative overflow-hidden h-[240px]">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500" /> Confidence Analysis</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-purple-500" /> Sentiment Tone</div>
                   </div>
                   <SentimentGraph data={stats.sentimentTrend} />
                </Card>

                <Card className="bg-[#080808] border border-white/10 p-8 grid md:grid-cols-2 gap-8 items-center h-[136px]">
                   <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2"><Mic className="w-4 h-4 text-orange-500" /> Speaking Pace</h3>
                      <p className="text-gray-400 text-sm mb-4">You averaged <span className="text-white font-bold">{stats.speakingPace} WPM</span>.</p>
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-orange-500/50 to-orange-500 w-[75%] transition-all duration-1000" style={{ width: mounted ? '75%' : '0%' }} />
                      </div>
                   </div>
                   <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-start gap-3">
                         <Zap className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                         <div>
                            <h4 className="text-white font-bold text-sm">Pace Insight</h4>
                            <p className="text-xs text-gray-400 mt-1">Optimized for clarity. Good modulation.</p>
                         </div>
                      </div>
                   </div>
                </Card>
             </div>
          </div>

          {/* --- SECTION 2: TECHNICAL DEEP DIVE --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Coding Accuracy */}
             <Card className="bg-[#080808] border border-white/10 p-8 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Code className="w-40 h-40" /></div>
                <div className="mb-6">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2"><Code className="w-5 h-5 text-neon-cyan" /> Coding Proficiency</h3>
                </div>
                <div className="flex items-center gap-6">
                   <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                         <circle cx="64" cy="64" r="60" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
                         <circle cx="64" cy="64" r="60" stroke="#06b6d4" strokeWidth="8" fill="transparent" strokeDasharray="377" strokeDashoffset={mounted ? 377 - (377 * stats.codingAccuracy) / 100 : 377} className="transition-all duration-1500 ease-out delay-500" />
                      </svg>
                      <span className="absolute text-3xl font-black text-white">{stats.codingAccuracy}%</span>
                   </div>
                   <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-500" /> Syntax Correct</div>
                      <div className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-500" /> Optimization</div>
                   </div>
                </div>
             </Card>

             {/* Live Correctness Graph */}
             <Card className="lg:col-span-2 bg-[#080808] border border-white/10 p-8 relative">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-purple-500" /> Answer Correctness Flow</h3>
                </div>
                <CorrectnessGraph data={stats.questionPerformance} mounted={mounted} />
             </Card>
          </div>

          {/* --- SECTION 3: AI MENTOR --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Improvement Screen */}
             <Card className="bg-[#080808] border border-white/10 p-0 overflow-hidden flex flex-col">
                <div className="bg-red-500/10 border-b border-red-500/20 p-4 flex justify-between items-center">
                   <h3 className="text-red-400 font-bold flex items-center gap-2"><XCircle className="w-5 h-5" /> Area for Improvement</h3>
                   <span className="text-xs font-mono text-red-400 opacity-70">DETECTED_WEAKNESS</span>
                </div>
                <div className="p-6 space-y-6">
                   <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Context</span>
                      <p className="text-lg font-medium text-white mt-1">"{stats.improvementFocus.question}"</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                         <div className="text-red-400 text-xs font-bold mb-2 flex items-center gap-2"><Mic className="w-3 h-3" /> YOU SAID:</div>
                         <p className="text-gray-400 text-sm italic">"{stats.improvementFocus.userAnswer}"</p>
                      </div>
                      <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4 relative overflow-hidden">
                         <div className="text-green-400 text-xs font-bold mb-2 flex items-center gap-2"><Lightbulb className="w-3 h-3" /> BETTER ANSWER:</div>
                         <p className="text-gray-300 text-sm">"{stats.improvementFocus.aiSuggested}"</p>
                      </div>
                   </div>
                </div>
             </Card>

             {/* Confidence Booster */}
             <Card className="bg-[#080808] border border-white/10 p-0 overflow-hidden flex flex-col">
                <div className="bg-purple-500/10 border-b border-purple-500/20 p-4 flex justify-between items-center">
                   <h3 className="text-purple-400 font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Confidence Booster</h3>
                   <span className="text-xs font-mono text-purple-400 opacity-70">BEHAVIORAL_COACH</span>
                </div>
                <div className="p-6 flex flex-col justify-center h-full relative text-center space-y-6">
                   <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto border border-purple-500/30">
                      <Sparkles className="w-10 h-10 text-purple-400" />
                   </div>
                   <div>
                      <h4 className="text-xl font-bold text-white mb-2">Confidence Level: <span className="text-purple-400">Moderate</span></h4>
                      <p className="text-gray-400 text-sm max-w-sm mx-auto">Voice modulation analysis suggests room for stronger assertiveness.</p>
                   </div>
                   <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left max-w-sm mx-auto">
                      <h5 className="text-neon-cyan text-xs font-bold uppercase mb-2 flex items-center gap-2"><Zap className="w-3 h-3" /> Actionable Tip</h5>
                      <p className="text-gray-300 text-sm">{stats.improvementFocus.confidenceTip}</p>
                   </div>
                </div>
             </Card>
          </div>

          {/* --- SECTION 4: QUICK INSIGHTS --- */}
          <div className="grid md:grid-cols-3 gap-6">
             {stats.keyInsights.map((insight, i) => (
               <Card key={i} className={`bg-[#080808] border p-6 flex items-start gap-4 ${
                 insight.type === 'strength' ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
               }`}>
                  <div className={`p-2 rounded-full ${insight.type === 'strength' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                     {insight.type === 'strength' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                     <h4 className={`font-bold text-sm mb-1 ${insight.type === 'strength' ? 'text-green-500' : 'text-red-500'}`}>
                        {insight.type === 'strength' ? 'Strength Detected' : 'Area for Improvement'}
                     </h4>
                     <p className="text-gray-300 text-sm">{insight.text}</p>
                  </div>
               </Card>
             ))}
          </div>

        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;