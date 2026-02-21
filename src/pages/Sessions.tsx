import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Clock, TrendingUp, ChevronDown, ChevronUp, Target, Trash2, Trophy, BarChart3, Activity, XCircle } from "lucide-react";
import { toast } from "sonner";

interface InterviewSession {
  id: string;
  role: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  score: number | null;
  feedback: any;
  cv_filename: string | null;
}

const Sessions = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Stats for the Hero Section
  const [stats, setStats] = useState({ total: 0, avgScore: 0, bestScore: 0 });

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) {
        toast.error("Failed to load history");
      } else {
        const dataSessions = data || [];
        setSessions(dataSessions);
        calculateStats(dataSessions);
      }
      setLoadingSessions(false);
    };

    if (user) fetchSessions();
  }, [user]);

  const calculateStats = (dataSessions: InterviewSession[]) => {
    const completed = dataSessions.filter(s => s.score !== null);
    const total = dataSessions.length;
    const avgScore = completed.length ? Math.round(completed.reduce((acc, curr) => acc + (curr.score || 0), 0) / completed.length) : 0;
    const bestScore = completed.length ? Math.max(...completed.map(s => s.score || 0)) : 0;
    setStats({ total, avgScore, bestScore });
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure? This action is permanent.")) return;

    try {
      const { error } = await supabase.from('interview_sessions').delete().eq('id', sessionId);
      if (error) throw error;
      
      const updatedSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(updatedSessions);
      calculateStats(updatedSessions);
      toast.success("Session deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleClearAll = async () => {
    if (sessions.length === 0) return;
    if (!window.confirm("⚠️ WARNING: This will permanently delete ALL your interview history. Are you sure?")) return;

    try {
      const { error } = await supabase.from('interview_sessions').delete().eq('user_id', user?.id);
      if (error) throw error;

      setSessions([]);
      setStats({ total: 0, avgScore: 0, bestScore: 0 });
      toast.success("All history cleared successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear history");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 px-3 py-1">Completed</Badge>;
      case 'incomplete': return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 px-3 py-1">Incomplete</Badge>;
      default: return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 px-3 py-1">In Progress</Badge>;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-neon-cyan";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading || loadingSessions) return <div className="min-h-screen bg-background flex items-center justify-center text-neon-cyan animate-pulse">Loading History...</div>;
  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-20 px-6 md:px-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-cyan/10 via-background to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          {/* 1. Hero / Stats Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500">Progress</span></h1>
              <p className="text-muted-foreground">Track every step of your interview journey.</p>
            </div>
            
            {/* Stat Cards */}
            <Card className="glass border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-400 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Score</p>
                  <p className="text-3xl font-bold text-white">{stats.avgScore}%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-neon-cyan/20 text-neon-cyan group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best Score</p>
                  <p className="text-3xl font-bold text-white">{stats.bestScore}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. Control Bar */}
          {sessions.length > 0 && (
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">Recent Sessions</h2>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleClearAll}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All History
              </Button>
            </div>
          )}

          {/* 3. Sessions Grid */}
          {sessions.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center glass rounded-3xl border-dashed border-2 border-white/10">
              <div className="w-20 h-20 rounded-full bg-neon-cyan/10 flex items-center justify-center mb-6">
                <Target className="w-10 h-10 text-neon-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Interviews Yet</h3>
              <p className="text-muted-foreground mb-8 text-center max-w-md">Your history is empty. Complete an interview to see your analytics here.</p>
              {/* Button Removed as requested */}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  className={`relative group transition-all duration-500 ${expandedSession === session.id ? 'lg:col-span-2 xl:col-span-2 row-span-2' : ''}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <Card className="relative h-full glass border-white/10 hover:border-neon-cyan/30 bg-card/40 hover:bg-card/60 transition-all duration-300 overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-4">
                        {getStatusBadge(session.status)}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                            onClick={(e) => handleDeleteSession(e, session.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-white line-clamp-1" title={session.role}>
                          {session.role}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(session.started_at), "MMM dd, yyyy • h:mm a")}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-end justify-between mt-4 mb-6">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">Score</p>
                          <p className={`text-4xl font-bold ${getScoreColor(session.score)}`}>
                            {session.score !== null ? session.score : '--'}
                            <span className="text-lg text-muted-foreground align-top">%</span>
                          </p>
                        </div>
                        {session.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                            className="border-neon-cyan/30 hover:bg-neon-cyan/10 hover:text-neon-cyan text-xs"
                          >
                            {expandedSession === session.id ? "Hide Details" : "View Report"}
                            {expandedSession === session.id ? <ChevronUp className="ml-2 w-3 h-3" /> : <ChevronDown className="ml-2 w-3 h-3" />}
                          </Button>
                        )}
                      </div>

                      {/* EXPANDED DETAILS */}
                      {expandedSession === session.id && session.feedback && (
                        <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {session.feedback.strengths?.length > 0 && (
                              <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                                <h4 className="text-xs font-bold text-green-400 uppercase mb-2">Strengths</h4>
                                <ul className="space-y-2">
                                  {session.feedback.strengths.slice(0, 3).map((s: string, i: number) => (
                                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                      <span className="text-green-500">✓</span> {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {session.feedback.weaknesses?.length > 0 && (
                              <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                                <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Focus Areas</h4>
                                <ul className="space-y-2">
                                  {session.feedback.weaknesses.slice(0, 3).map((w: string, i: number) => (
                                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                      <span className="text-red-500">!</span> {w}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          {session.feedback.overall && (
                            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
                              <p className="text-sm text-gray-300 italic">"{session.feedback.overall}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sessions;