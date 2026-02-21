import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { CheckCircle2, Code2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PerformanceData {
  category: string;
  score: number;
}

const CodingPerformanceChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallPass, setOverallPass] = useState(0);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!user) return;

      try {
        const { data: sessions, error } = await supabase
          .from('interview_sessions')
          .select('feedback, score, role')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (sessions && sessions.length > 0) {
          // Group by role/category
          const categoryScores: { [key: string]: number[] } = {};
          let totalScore = 0;
          let count = 0;

          sessions.forEach(session => {
            const role = session.role || 'General';
            if (!categoryScores[role]) {
              categoryScores[role] = [];
            }
            if (session.score) {
              categoryScores[role].push(session.score);
              totalScore += session.score;
              count++;
            }
          });

          const performanceData = Object.entries(categoryScores).map(([category, scores]) => ({
            category: category.length > 10 ? category.substring(0, 10) + '...' : category,
            score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          }));

          setData(performanceData.slice(0, 6)); // Limit to 6 categories
          setOverallPass(count > 0 ? Math.round(totalScore / count) : 0);
        }
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
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Interview Performance</h3>
        <div className="h-[220px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Interview Performance</h3>
        <div className="h-[220px] flex flex-col items-center justify-center text-center">
          <Code2 className="w-10 h-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Complete interviews to see performance by role</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Interview Performance</h3>
        {overallPass > 0 && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            overallPass >= 70 
              ? 'bg-green-500/20 border border-green-500/30' 
              : 'bg-yellow-500/20 border border-yellow-500/30'
          }`}>
            <CheckCircle2 className={`w-4 h-4 ${overallPass >= 70 ? 'text-green-400' : 'text-yellow-400'}`} />
            <span className={`text-sm font-semibold ${overallPass >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
              {overallPass}% Avg
            </span>
          </div>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
          <XAxis 
            dataKey="category"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
            formatter={(value: number) => [`${value}%`, "Score"]}
          />
          <Bar 
            dataKey="score" 
            fill="hsl(var(--neon-cyan))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CodingPerformanceChart;
