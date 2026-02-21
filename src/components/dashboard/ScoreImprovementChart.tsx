import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ScoreData {
  session: string;
  score: number;
}

const ScoreImprovementChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      if (!user) return;

      try {
        const { data: sessions, error } = await supabase
          .from('interview_sessions')
          .select('score, created_at')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .not('score', 'is', null)
          .order('created_at', { ascending: true })
          .limit(10);

        if (error) throw error;

        if (sessions && sessions.length > 0) {
          const chartData = sessions.map((s, index) => ({
            session: `${index + 1}${getOrdinalSuffix(index + 1)}`,
            score: s.score || 0
          }));
          setData(chartData);
        }
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [user]);

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Score Improvement</h3>
        <div className="h-[250px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Score Improvement</h3>
        <div className="h-[250px] flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-10 h-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Complete interviews to track your score improvement</p>
        </div>
      </div>
    );
  }

  const minScore = Math.max(0, Math.min(...data.map(d => d.score)) - 10);
  const maxScore = Math.min(100, Math.max(...data.map(d => d.score)) + 10);

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-semibold text-foreground">Score Improvement</h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
          <XAxis 
            dataKey="session" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            domain={[minScore, maxScore]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="hsl(var(--neon-cyan))" 
            strokeWidth={3}
            dot={{ fill: "hsl(var(--neon-cyan))", r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-2 text-muted-foreground">
        <TrendingUp className="w-4 h-4" />
        <span className="text-sm">Score</span>
      </div>
    </div>
  );
};

export default ScoreImprovementChart;
