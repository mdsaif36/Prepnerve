import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, TrendingDown, Target, Clock, CheckCircle2, BarChart3 } from "lucide-react";

interface PerformanceStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  lastScore: number;
  scoreChange: number;
  totalQuestions: number;
  bestCategory: string;
  recentTrend: 'up' | 'down' | 'stable';
}

const PerformanceOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!user) return;

      try {
        const { data: sessions, error } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!sessions || sessions.length === 0) {
          setStats(null);
          setLoading(false);
          return;
        }

        const completedSessions = sessions.filter(s => s.status === 'completed');
        const scores = completedSessions.map(s => s.score).filter((s): s is number => s !== null);
        
        const avgScore = scores.length > 0 
          ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
          : 0;
        
        const lastScore = scores[0] || 0;
        const prevScore = scores[1] || lastScore;
        const scoreChange = lastScore - prevScore;

        // Calculate total questions from feedback
        let totalQuestions = 0;
        completedSessions.forEach(session => {
          const feedback = session.feedback as any;
          if (feedback?.questionsAnswered) {
            totalQuestions += feedback.questionsAnswered;
          }
        });

        // Determine trend based on last 3 sessions
        const recentScores = scores.slice(0, 3);
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (recentScores.length >= 2) {
          const avg1 = recentScores[0];
          const avg2 = recentScores[recentScores.length - 1];
          if (avg1 > avg2 + 5) trend = 'up';
          else if (avg1 < avg2 - 5) trend = 'down';
        }

        setStats({
          totalSessions: sessions.length,
          completedSessions: completedSessions.length,
          averageScore: avgScore,
          lastScore,
          scoreChange,
          totalQuestions,
          bestCategory: 'Technical', // Placeholder - could be calculated from feedback
          recentTrend: trend
        });
      } catch (error) {
        console.error('Error fetching performance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [user]);

  if (loading) {
    return (
      <Card className="glass rounded-2xl p-6 border border-border/50">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!stats || stats.completedSessions === 0) {
    return (
      <Card className="glass rounded-2xl p-6 border border-border/50">
        <h2 className="text-xl font-bold text-foreground mb-4">Your Performance</h2>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Complete your first interview to see performance stats!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass rounded-2xl p-6 border border-border/50 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Your Performance</h2>
        {stats.recentTrend === 'up' ? (
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            Improving
          </div>
        ) : stats.recentTrend === 'down' ? (
          <div className="flex items-center gap-1 text-red-400 text-sm">
            <TrendingDown className="w-4 h-4" />
            Needs Practice
          </div>
        ) : null}
      </div>

      {/* Main Score */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-neon-cyan/30 flex items-center justify-center">
            <span className="text-3xl font-bold text-neon-cyan">{stats.lastScore}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-medium bg-background border border-border">
            {stats.scoreChange >= 0 ? (
              <span className="text-green-400">+{stats.scoreChange}</span>
            ) : (
              <span className="text-red-400">{stats.scoreChange}</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Latest Score</p>
          <p className="text-lg font-semibold text-foreground">
            {stats.lastScore >= 80 ? 'Excellent!' : 
             stats.lastScore >= 60 ? 'Good Progress' : 
             'Keep Practicing'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm text-muted-foreground">Sessions</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.completedSessions}</p>
        </div>
        
        <div className="glass rounded-xl p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm text-muted-foreground">Avg Score</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.averageScore}%</p>
        </div>

        <div className="glass rounded-xl p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm text-muted-foreground">Questions</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalQuestions}</p>
        </div>

        <div className="glass rounded-xl p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm text-muted-foreground">Best Area</span>
          </div>
          <p className="text-lg font-bold text-foreground truncate">{stats.bestCategory}</p>
        </div>
      </div>
    </Card>
  );
};

export default PerformanceOverview;
