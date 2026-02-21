import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/dashboard/StatCard";
import ScoreImprovementChart from "@/components/dashboard/ScoreImprovementChart";
import SkillProfileChart from "@/components/dashboard/SkillProfileChart";
import TimePerQuestionChart from "@/components/dashboard/TimePerQuestionChart";
import CodingPerformanceChart from "@/components/dashboard/CodingPerformanceChart";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download, BarChart3, AlertCircle } from "lucide-react"; // Added AlertCircle
import { useAuth } from "@/hooks/useAuth";
import axios from "axios"; 
import { toast } from "sonner";

// Define a safe default to prevent crashes
const DEFAULT_STAT_ITEM = { value: 0, change: 0 };

interface AnalyticsStats {
  technical: { value: number; change: number };
  behavioral: { value: number; change: number };
  coding: { value: number; change: number };
  confidence: { value: number; change: number };
  hasData: boolean;
}

const Analytics = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        const userEmail = user.email || "demo@user.com";
        
        const response = await axios.get(`https://prepnerveserver.onrender.com/api/dashboard/stats`, {
            params: { email: userEmail }
        });

        const data = response.data || {}; // Safety check for null response

        if (data.hasData === false) {
          setStats({ 
            technical: DEFAULT_STAT_ITEM,
            behavioral: DEFAULT_STAT_ITEM,
            coding: DEFAULT_STAT_ITEM,
            confidence: DEFAULT_STAT_ITEM,
            hasData: false 
          });
        } else {
          // Ensure all fields exist even if API returns partials
          setStats({
            technical: data.technical || DEFAULT_STAT_ITEM,
            behavioral: data.behavioral || DEFAULT_STAT_ITEM,
            coding: data.coding || DEFAULT_STAT_ITEM,
            confidence: data.confidence || DEFAULT_STAT_ITEM,
            hasData: true
          });
        }

      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error("Failed to load analytics data.");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  // Helper to safely get trend direction
  const getTrend = (change: number | undefined) => (change || 0) >= 0 ? "up" : "down";

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#02040a] text-white">
          <div className="animate-pulse text-neon-cyan">Loading Profile...</div>
        </div>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-6 pt-24 pb-12 bg-[#02040a] text-white">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" pointerEvents="none" />
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-white">PERFORMANCE <span className="text-neon-cyan">HUB</span></h1>
                <p className="text-gray-400 mt-1">Track your interview growth and AI insights.</p>
            </div>
            {/* Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-10 border-white/10 bg-black/40 hover:bg-white/10 text-gray-300 gap-2">This Month <ChevronDown className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 bg-black/40 hover:bg-white/10 text-gray-300"><Download className="w-4 h-4" /></Button>
            </div>
          </div>

          {loadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5"></div>
              ))}
            </div>
          ) : !stats?.hasData ? (
            <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6"><BarChart3 className="w-8 h-8 text-gray-500" /></div>
              <h2 className="text-2xl font-bold text-white mb-2">No Performance Data Yet</h2>
              <p className="text-gray-400 mb-6 max-w-md">Complete your first AI Interview session to unlock detailed performance analytics.</p>
              <Button onClick={() => navigate('/cv-upload')} className="h-12 px-8 bg-neon-cyan text-black font-bold hover:bg-cyan-400 rounded-xl">Start First Interview</Button>
            </div>
          ) : (
            <>
              {/* Stat Cards with Safe Access */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Technical Proficiency" 
                    value={stats.technical?.value || 0} 
                    change={stats.technical?.change || 0} 
                    trend={getTrend(stats.technical?.change)} 
                />
                <StatCard 
                    title="Behavioral Skills" 
                    value={stats.behavioral?.value || 0} 
                    change={stats.behavioral?.change || 0} 
                    trend={getTrend(stats.behavioral?.change)} 
                />
                <StatCard 
                    title="Coding Efficiency" 
                    value={stats.coding?.value || 0} 
                    change={stats.coding?.change || 0} 
                    trend={getTrend(stats.coding?.change)} 
                />
                <StatCard 
                    title="Confidence Level" 
                    value={stats.confidence?.value || 0} 
                    change={stats.confidence?.change || 0} 
                    trend={getTrend(stats.confidence?.change)} 
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ScoreImprovementChart />
                <SkillProfileChart />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimePerQuestionChart />
                <CodingPerformanceChart />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Analytics;
