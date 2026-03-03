import { useState, useEffect } from "react"; 
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Lock, Mail, Github, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; 
import { motion } from "framer-motion";

// Custom Google Icon
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const { signIn, signUp, user, loading: authLoading } = useAuth(); 
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // --- 1. HANDLE SOCIAL LOGIN & MESSAGES ---
  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");
    const authType = searchParams.get("type"); 
    const error = searchParams.get("error");

    if (error) {
        toast.error("Social login failed. Please try again.");
    } else if (token && userStr) {
        try {
            const userData = JSON.parse(decodeURIComponent(userStr));
            
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userData));

            const isNewUser = authType === 'signup';
            
            if (isNewUser) {
               toast.success(`Welcome, ${userData.full_name}!`);
            } else {
               toast.success("Welcome back!");
            }
            
            navigate("/hub", { state: { isNewUser }, replace: true });
        } catch (e) {
            console.error("Social Auth Parse Error:", e);
            toast.error("Failed to process login data.");
        }
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const tab = searchParams.get("tab") === "signup" ? "signup" : "login";
    setActiveTab(tab);
  }, [searchParams]);

  // --- 2. HANDLE REDIRECT AFTER LOCAL AUTH ---
  useEffect(() => {
    if (user && !authLoading) {
      const from = location.state?.from?.pathname || "/hub";
      const isNewUser = activeTab === "signup";
      navigate(from, { replace: true, state: { isNewUser } });
    }
  }, [user, authLoading, navigate, location, activeTab]);

  const handleSocialLogin = (provider: "google" | "github") => {
      const BACKEND_URL = "https://prepnerveserver.onrender.com"; 
      window.location.href = `${BACKEND_URL}/api/auth/${provider}`;
  };

  const handleAuth = async (type: "login" | "signup") => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (type === "signup" && !fullName) {
      toast.error("Please enter your full name");
      return;
    }

    setLoading(true);
    try {
      let result;
      if (type === "signup") {
        result = await signUp(email, password, fullName);
      } else {
        result = await signIn(email, password);
      }
      
      if (result.error) throw result.error;

    } catch (error: any) {
      console.error("Auth Error:", error);
      toast.error(error.message || "Authentication failed");
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-cyan-500/30 flex flex-col relative overflow-hidden">

      {/* --- DEEP BACKGROUND ORBS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[80vw] h-[80vw] rounded-full bg-cyan-900/30 blur-[150px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[80vw] h-[80vw] rounded-full bg-blue-900/30 blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-cyan-500/10 rounded-full blur-[150px]" />
      </div>

      {/* --- FULL SCREEN GLASS OVERLAY --- */}
      <div className="fixed inset-0 z-0 bg-white/[0.01] backdrop-blur-2xl pointer-events-none" />

      {/* --- MAIN CENTERED CONTENT --- */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10 min-h-screen w-full">
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-[420px] relative"
        >
            {/* Top Navigation & Header */}
            <div className="flex flex-col items-center mb-10 relative">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")} 
                className="absolute -left-6 -top-2 pl-0 hover:text-white hover:bg-transparent text-gray-500 group"
              >
                <ArrowLeft className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" />
              </Button>
              
              <h1 className="text-4xl font-black tracking-tight text-white mb-3 text-center mt-2">
                {activeTab === "login" ? "Welcome Back" : "Initialize"}
              </h1>
              <p className="text-gray-400 text-sm text-center max-w-[280px]">
                {activeTab === "login" 
                  ? "Access the system to continue your technical preparation." 
                  : "Register below to gain access to the Neural Engine."}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-8 border border-white/5 rounded-2xl p-1.5 shadow-inner">
                <TabsTrigger 
                  value="login" 
                  className="rounded-xl py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-400 transition-all font-bold text-sm"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="rounded-xl py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-400 transition-all font-bold text-sm"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              {/* LOGIN TAB */}
              <TabsContent value="login" className="space-y-6 mt-0">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                      <Input 
                        type="email" 
                        placeholder="name@example.com" 
                        className="pl-12 bg-black/20 border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white h-14 rounded-2xl transition-all" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</Label>
                      <button className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors">Forgot?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-12 bg-black/20 border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white h-14 rounded-2xl transition-all" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all h-14 rounded-2xl text-md border border-white/10" 
                  onClick={() => handleAuth("login")} 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access System"}
                </Button>
              </TabsContent>

              {/* SIGNUP TAB */}
              <TabsContent value="signup" className="space-y-6 mt-0">
                 <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                      <Input 
                        placeholder="John Doe" 
                        className="pl-12 bg-black/20 border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white h-14 rounded-2xl transition-all" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                      <Input 
                        type="email" 
                        placeholder="name@example.com" 
                        className="pl-12 bg-black/20 border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white h-14 rounded-2xl transition-all" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Create Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-12 bg-black/20 border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white h-14 rounded-2xl transition-all" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-white text-black font-bold hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all h-14 rounded-2xl text-md" 
                  onClick={() => handleAuth("signup")} 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Social Authentication Section */}
            <div className="mt-10">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="bg-[#02040a] px-4 text-gray-500 rounded-full border border-white/5 py-1">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all text-gray-300 group" 
                  onClick={() => handleSocialLogin("google")}
                >
                  <GoogleIcon />
                  <span className="ml-2 font-medium group-hover:text-white transition-colors">Google</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all text-gray-300 group" 
                  onClick={() => handleSocialLogin("github")}
                >
                  <Github className="h-5 w-5 group-hover:text-white transition-colors" />
                  <span className="ml-2 font-medium group-hover:text-white transition-colors">GitHub</span>
                </Button>
              </div>
            </div>

        </motion.div>
      </main>
    </div>
  );
};

export default Auth;