import { useEffect, useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SkillData {
  skill: string;
  score: number;
}

const SkillProfileChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      if (!user) return;

      try {
        const { data: sessions, error } = await supabase
          .from('interview_sessions')
          .select('feedback, score')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (sessions && sessions.length > 0) {
          // Aggregate category scores from all sessions
          let technical = 0, behavioral = 0, communication = 0, coding = 0, confidence = 0;
          let count = 0;

          sessions.forEach(session => {
            const feedback = session.feedback as any;
            if (feedback?.categoryScores) {
              technical += feedback.categoryScores.technical || 0;
              behavioral += feedback.categoryScores.behavioral || 0;
              communication += feedback.categoryScores.communication || 0;
              coding += feedback.categoryScores.coding || 0;
              confidence += feedback.categoryScores.confidence || 0;
              count++;
            } else if (session.score) {
              // Fallback: use overall score if no category scores
              technical += session.score;
              behavioral += session.score;
              communication += session.score;
              coding += session.score;
              confidence += session.score;
              count++;
            }
          });

          if (count > 0) {
            setData([
              { skill: "Technical", score: Math.round(technical / count) },
              { skill: "Behavioral", score: Math.round(behavioral / count) },
              { skill: "Communication", score: Math.round(communication / count) },
              { skill: "Coding", score: Math.round(coding / count) },
              { skill: "Confidence", score: Math.round(confidence / count) },
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [user]);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Skill Profile</h3>
        <div className="h-[250px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Skill Profile</h3>
        <div className="h-[250px] flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-10 h-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Complete interviews to see your skill profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-semibold text-foreground">Skill Profile</h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" opacity={0.3} />
          <PolarAngleAxis 
            dataKey="skill"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Radar
            dataKey="score"
            stroke="hsl(var(--neon-cyan))"
            fill="hsl(var(--neon-cyan))"
            fillOpacity={0.5}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillProfileChart;
