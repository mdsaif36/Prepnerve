import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { 
  ArrowRight, Activity, BrainCircuit, Mic, Trophy, 
  BarChart3, X, TrendingUp, TrendingDown, 
  Zap, Users, FileText, Globe
} from "lucide-react";
import Interviewer3D from "@/components/Interviewer3D";
import api from "@/lib/api"; 
import { getSocket } from "@/lib/socket";
import PageTransition from "@/components/PageTransition"; 
import { motion, AnimatePresence } from "framer-motion";

import ContourBackground from "@/components/ContourBackground";

const TrendIndicator = ({ value, size = 'md' }: { value: number, size?: 'sm' | 'md' }) => {
  const isPositive = value >= 0;
  return (
    <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
      {isPositive ? <TrendingUp size={size === 'sm' ? 12 : 14} /> : <TrendingDown size={size === 'sm' ? 12 : 14} />}
      <span className={`font-mono font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {Math.abs(value)}%
      </span>
    </div>
  );
};

const ProgressBar = ({ value, color }: { value: number, color: string }) => (
  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
    <div 
      className={`h-full ${color} transition-all duration-1000 ease-out opacity-80`} 
      style={{ width: `${value}%` }} 
    />
  </div>
);

const MetricCard = ({ label, value, trend, icon: Icon, suffix, size = 'md' }: any) => (
  <div className={size === 'sm' ? 'p-0' : 'p-0'}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      {Icon && <Icon size={14} className="text-gray-600" />}
    </div>
    <div className="flex items-end justify-between">
      <div className="flex items-baseline gap-1">
        <span className={`font-mono font-bold text-white ${size === 'sm' ? 'text-xl' : 'text-3xl'}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {suffix && <span className="text-xs text-gray-500 font-medium">{suffix}</span>}
      </div>
      {trend !== undefined && <TrendIndicator value={trend} />}
    </div>
  </div>
);

// --- PATCHY CHART COMPONENT ---
const HiringVolumeChart = () => {
  const data = [35, 55, 45, 70, 60, 85, 75, 50, 65, 80, 95, 70, 50, 60, 45];
  
  return (
    <div className="relative z-10 w-full h-full flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-sm animate-pulse" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hiring Volume</span>
            </div>
            <span className="text-[10px] font-mono text-gray-600">30D TREND</span>
        </div>
        
        <div className="flex items-end justify-between gap-1.5 h-32 w-full">
            {data.map((value, colIndex) => {
                const segments = 10; 
                const activeSegments = Math.ceil((value / 100) * segments);
                
                return (
                    <div key={colIndex} className="flex flex-col justify-end gap-[2px] w-full h-full">
                        {Array.from({ length: segments }).map((_, i) => {
                            const segmentIndex = segments - 1 - i; 
                            const isActive = segmentIndex < activeSegments;
                            
                            return (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isActive ? 1 : 0.1 }}
                                    transition={{ delay: colIndex * 0.03 + (segments - i) * 0.01 }}
                                    className={`w-full flex-1 rounded-[1px] transition-all duration-500 ${
                                        isActive 
                                            ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' 
                                            : 'bg-white/5'
                                    }`} 
                                />
                            );
                        })}
                    </div>
                )
            })}
        </div>
    </div>
  );
};

// --- NEWS TICKER ---
const DashboardTicker = ({ headlines }: { headlines: string[] }) => (
  <div className="flex items-center mb-8 overflow-hidden">
    <div className="flex animate-scroll whitespace-nowrap group hover:[animation-play-state:paused]">
      {(headlines || []).length > 0 ? (
          [...headlines, ...headlines].map((news, i) => (
            <div key={i} className="flex items-center gap-3 mx-6 text-xs font-medium text-gray-500">
              {i % 2 === 0 ? <TrendingUp size={12} className="text-green-500/50" /> : <Activity size={12} className="text-blue-500/50" />}
              {news}
            </div>
          ))
      ) : (
          <div className="mx-6 text-xs text-gray-600">Connecting to Neural Feed...</div>
      )}
    </div>
  </div>
);

// --- MAIN PAGE ---
const Index = () => {
  const navigate = useNavigate();
  const socket = getSocket();
  const [mounted, setMounted] = useState(false);
  
  // State
  const [newsFeed, setNewsFeed] = useState<any[]>([]);
  const [tickerHeadlines, setTickerHeadlines] = useState<string[]>([
    "Global Tech Hiring Index: Stable",
    "Remote Work Trends: Increasing Demand for Async Comms",
  ]);
  const [selectedNews, setSelectedNews] = useState<any>(null); 
  
  // Metrics
  const [skills, setSkills] = useState([
    { name: "React / Next.js", value: 94, trend: 12.3, color: "bg-cyan-400" },
    { name: "TypeScript", value: 89, trend: 18.7, color: "bg-blue-500" },
    { name: "Python / AI", value: 87, trend: 34.2, color: "bg-purple-500" },
    { name: "Cloud / DevOps", value: 82, trend: 8.4, color: "bg-orange-500" },
  ]);

  const [salaries, setSalaries] = useState([
    { role: "Staff Engineer", range: "₹45L - ₹80L", trend: 12.4 },
    { role: "Eng. Lead", range: "₹32L - ₹60L", trend: 6.8 },
    { role: "Senior Dev", range: "₹18L - ₹40L", trend: 8.2 },
    { role: "Mid-Level", range: "₹8L - ₹18L", trend: 4.1 },
  ]);

  const [marketStatus, setMarketStatus] = useState({ label: "Bullish", velocity: "+14%" });

  useEffect(() => {
    setMounted(true);
    const initData = async () => {
        try {
            const [newsRes, marketRes] = await Promise.all([
                api.get('/api/news'),
                api.get('/api/market')
            ]);

            if (newsRes.data && Array.isArray(newsRes.data)) {
                const formattedNews = newsRes.data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    type: item.category ? item.category : 'Tech', 
                    time: item.time,
                    summary: item.summary || "Click to read full insights.",
                    fullContent: item.content || "Content preview.",
                    color: 'text-blue-400'
                }));
                setNewsFeed(formattedNews);
                if (formattedNews.length > 0) {
                   setTickerHeadlines(formattedNews.slice(0, 5).map((n: any) => n.title));
                }
            }

            if (marketRes.data) {
                if (marketRes.data.skills) setSkills(marketRes.data.skills);
                if (marketRes.data.salaries) setSalaries(marketRes.data.salaries);
                if (marketRes.data.marketStatus) setMarketStatus(marketRes.data.marketStatus);
            }
        } catch (err) { console.error("Data load failed", err); }
    };
    initData();

    socket.on('news_update', (newItem: any) => {
        if (!newItem) return;
        setNewsFeed(prev => [{ ...newItem, type: 'Alert', time: 'Now' }, ...prev].slice(0, 50)); 
    });

    socket.on('market_pulse', (data: any) => {
        if (data) {
            if (data.skills) setSkills(data.skills);
            if (data.salaries) setSalaries(data.salaries);
            if (data.marketStatus) setMarketStatus(data.marketStatus);
        }
    });

    return () => {
        socket.off('news_update');
        socket.off('market_pulse');
    };
  }, [socket]);

  const featuredNews = newsFeed.length > 0 ? newsFeed[0] : null;
  const listNews = newsFeed.length > 1 ? newsFeed.slice(1) : []; 

  return (
    <PageTransition> 
      <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30 relative overflow-x-hidden bg-black">
        <Navbar />

        {/* --- FIXED BACKGROUND LAYER --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            {/* Integrated the Gradient Horizon background */}
            <ContourBackground />
        </div>

        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-12 px-12 min-h-screen flex flex-col justify-center z-10">
          <div className="w-full max-w-[1800px] mx-auto px-6 lg:px-16 grid lg:grid-cols-2 gap-12 items-center">
            
            <div className={`space-y-8 xl:pl-48 ${mounted ? 'animate-in fade-in slide-in-from-bottom-8 duration-1000' : 'opacity-0'}`}>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                The Benchmark for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                  Technical Preparation
                </span>
              </h1>
              <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                Experience real-time AI simulations that adapt to your skill level. Practice coding, system design, and behavioral questions in a stress-free environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-base font-semibold bg-cyan-500 text-black hover:bg-cyan-400 rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  onClick={() => navigate('/auth')}
                >
                  Get Started Free
                </Button>
              </div>
            </div>
            
            <div className={`relative h-[500px] w-full flex items-center justify-center ${mounted ? 'animate-in fade-in zoom-in-95 duration-1000 delay-200' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-[100px]" />
                <div className="relative w-full h-full">
                  <Interviewer3D className="w-full h-full" interviewState="idle" />
                </div>
            </div>
          </div>
        </section>

        {/* --- SYSTEM WORKFLOW --- */}
        <section className="py-24 relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        From resume to offer letter in four simple steps.
                    </p>
                </div>

                <div className="relative">
                    <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-white/5 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {[
                            { icon: FileText, title: "Upload CV", desc: "Our parser extracts your skills and experience instantly." },
                            { icon: BrainCircuit, title: "AI Analysis", desc: "We generate a custom interview tailored to your profile." },
                            { icon: Mic, title: "Live Simulation", desc: "Speak with our AI interviewer in a real-time voice session." },
                            { icon: Trophy, title: "Get Feedback", desc: "Receive detailed scoring and actionable tips to improve." }
                        ].map((step, i) => (
                            <div key={i} className="flex flex-col items-center text-center group cursor-default">
                                <div className="w-20 h-20 rounded-full bg-[#050a14] border border-white/10 flex items-center justify-center mb-6 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-500 relative z-10">
                                    <step.icon className="w-8 h-8 text-gray-500 group-hover:text-cyan-400 transition-colors duration-500" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{step.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* --- MARKET PULSE --- */}
        <section className="py-20 relative z-10">
            <div className="max-w-6xl mx-auto px-6">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Market Pulse</h2>
                    <span className="text-xs text-gray-500 font-mono">LIVE TELEMETRY · GLOBAL</span>
                </div>
                <DashboardTicker headlines={tickerHeadlines} />
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-12 lg:gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">System Status</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-gray-400"><Activity size={14}/> Sentiment</div>
                                    <span className="text-sm font-medium text-green-400">{marketStatus.label}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-gray-400"><Zap size={14}/> Velocity</div>
                                    <span className="text-sm font-medium text-green-400">High</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-gray-400"><Users size={14}/> Competition</div>
                                    <span className="text-sm font-medium text-yellow-400">Moderate</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-gray-400"><Globe size={14}/> Remote</div>
                                    <span className="text-sm font-medium text-blue-400">73%</span>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Overall Health</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xl font-bold text-white">92</span>
                                    <TrendIndicator value={4.2} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-6 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <MetricCard label="Active Listings" value={124847} trend={8.4} icon={BarChart3} />
                            <MetricCard label="Avg Time to Hire" value={23} trend={-12.3} suffix="days" icon={Activity} />
                        </div>
                        <div className="flex-1 relative flex flex-col justify-end pb-4">
                            <HiringVolumeChart />
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
                            <MetricCard label="Apps" value="2.4M" trend={15.2} size="sm" />
                            <MetricCard label="New" value="12.8K" trend={3.1} size="sm" />
                            <MetricCard label="Resp." value="34%" trend={-2.1} size="sm" />
                        </div>
                    </div>
                    <div className="lg:col-span-3 space-y-10">
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Skills Demand</h3>
                            <div className="space-y-5">
                                {skills.map((skill) => (
                                    <div key={skill.name} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-300 font-medium">{skill.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-gray-400">{skill.value}%</span>
                                                <TrendIndicator value={skill.trend} size="sm" />
                                            </div>
                                        </div>
                                        <ProgressBar value={skill.value} color={skill.color || "bg-blue-500"} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Salary Index</h3>
                            <div className="space-y-4">
                                {salaries.map((item) => (
                                    <div key={item.role} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">{item.role}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-white">{item.range}</span>
                                            <TrendIndicator value={item.trend} size="sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- LATEST NEWS --- */}
        <section className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
              <div className="mb-12">
                  <h2 className="text-3xl font-bold text-white">Latest Insights</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {featuredNews && (
                    <div className="lg:col-span-5 sticky top-32">
                       <motion.div 
                         layoutId={`card-${featuredNews.id}`}
                         className="relative h-[600px] rounded-3xl overflow-hidden bg-white/[0.02] border border-white/10 cursor-pointer group shadow-2xl backdrop-blur-sm"
                         onClick={() => setSelectedNews(featuredNews)}
                         whileHover={{ scale: 1.01 }}
                       >
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                         <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-blue-900/200" />
                         
                         <div className="relative h-full p-10 flex flex-col justify-end z-10">
                             <div className="mb-6">
                                <span className="px-3 py-1.5 rounded-full bg-cyan-500 text-black text-xs font-bold uppercase tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                                  {featuredNews.type}
                                </span>
                             </div>
                             <h3 className="text-4xl font-bold text-white mb-6 leading-tight group-hover:text-cyan-400 transition-colors">
                                {featuredNews.title}
                             </h3>
                             <p className="text-gray-300 text-base line-clamp-4 mb-8 leading-relaxed">
                                {featuredNews.summary}
                             </p>
                             <div className="flex items-center text-sm font-bold text-white uppercase tracking-widest">
                                Read Article <ArrowRight className="ml-2 w-4 h-4" />
                             </div>
                         </div>
                       </motion.div>
                    </div>
                  )}

                  <div className="lg:col-span-7 h-[600px] overflow-y-auto custom-scrollbar pr-4">
                     <div className="grid sm:grid-cols-2 gap-6 pb-4">
                        {listNews.map((item) => (
                           <motion.div 
                              key={item.id}
                              layoutId={`card-${item.id}`}
                              className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 cursor-pointer transition-colors flex flex-col justify-between h-[280px]"
                              onClick={() => setSelectedNews(item)}
                              whileHover={{ y: -3 }}
                           >
                             <div>
                                  <div className="flex justify-between items-start mb-4">
                                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{item.type}</span>
                                      <span className="text-xs text-gray-500">{item.time}</span>
                                  </div>
                                  <h4 className="text-lg font-bold text-gray-200 leading-snug mb-3 group-hover:text-white line-clamp-3">
                                      {item.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                                      {item.summary}
                                  </p>
                             </div>
                             <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                                  <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">Read more</span>
                                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                                      <ArrowRight className="w-4 h-4" />
                                  </div>
                             </div>
                           </motion.div>
                        ))}
                     </div>
                  </div>
              </div>
            </div>
        </section>

        {/* --- NEWS MODAL --- */}
        <AnimatePresence>
            {selectedNews && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedNews(null)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            layoutId={`card-${selectedNews.id}`} 
                            className="bg-[#050a14] w-full max-w-2xl max-h-[80vh] rounded-3xl border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)] overflow-hidden flex flex-col pointer-events-auto"
                        >
                            <div className="relative h-40 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 flex-shrink-0">
                                <button 
                                    onClick={() => setSelectedNews(null)} 
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-6 left-8">
                                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase">
                                        {selectedNews.type}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                                    {selectedNews.title}
                                </h2>
                                <p className="text-gray-300 text-base leading-relaxed mb-8">
                                    {selectedNews.summary}
                                </p>
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                    <h4 className="text-cyan-400 font-bold text-sm uppercase mb-3 flex items-center gap-2">
                                        <BrainCircuit className="w-4 h-4" /> AI Analysis
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {selectedNews.fullContent}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>

        <footer className="relative pt-10 pb-10 z-10 bg-transparent border-t border-white/5">
          <div className="text-center text-gray-600 text-sm">
            &copy; 2025 Prepnerve AI Systems. All rights reserved.
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;