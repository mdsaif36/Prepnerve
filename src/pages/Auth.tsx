import { useState, useEffect } from "react"; 
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Lock, Mail, Github } from "lucide-react";
import Interviewer3D from "@/components/Interviewer3D";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth"; 
// Import the new background component
import ContourBackground from "@/components/ContourBackground";

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
            
            // Navigate with state to preserve "Welcome" logic
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
      // Pass isNewUser flag based on which tab was active during auth
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

      if (type === "signup") {
         toast.success(`Welcome, ${fullName}!`);
      } else {
         toast.success("Welcome back!");
      }

    } catch (error: any) {
      console.error("Auth Error:", error);
      toast.error(error.message || "Authentication failed");
      setLoading(false); 
    }
  };

  const SocialButtons = () => (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0f172a] px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="border-white/10 hover:bg-white/5 hover:text-white text-gray-300" onClick={() => handleSocialLogin("google")}>
          <GoogleIcon />
        </Button>
        <Button variant="outline" className="border-white/10 hover:bg-white/5 hover:text-white text-gray-300" onClick={() => handleSocialLogin("github")}>
          <Github className="h-5 w-5" />
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-neon-cyan/30 flex flex-col relative overflow-hidden">
      <Navbar />

      {/* --- FIXED BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <ContourBackground />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-neon-cyan/5" />
      </div>

      <div className="flex-1 grid lg:grid-cols-2 relative z-10">
        <div className="hidden lg:flex relative items-center justify-center overflow-hidden border-r border-white/10 bg-black/20 backdrop-blur-sm">
           <div className="relative w-full max-w-lg text-center space-y-8">
              <div className="relative w-64 h-64 mx-auto mb-8">
                 <div className="absolute inset-0 bg-neon-cyan/20 blur-[80px] rounded-full animate-pulse" />
                 <Interviewer3D key="auth-3d" className="w-full h-full" interviewState="idle" />
              </div>
              <div className="space-y-4 px-8">
                <h2 className="text-4xl font-black tracking-tighter text-white">
                  ACCESS THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500">SIMULATION</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Join elite candidates mastering their technical interviews.
                </p>
              </div>
           </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-12 relative bg-black/10 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] relative z-10">
            <div className="mb-8">
              <Button variant="ghost" onClick={() => navigate("/")} className="pl-0 hover:text-white text-gray-400 mb-4 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
              </Button>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
              <p className="text-gray-400">Enter your credentials to access the system.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-8 border border-white/5">
                <TabsTrigger value="login" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black font-bold">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black font-bold">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
                      <Input 
                        type="email" 
                        placeholder="name@example.com" 
                        className="pl-10 bg-white/5 border-white/10 focus:border-neon-cyan/50 text-white h-10" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 bg-white/5 border-white/10 focus:border-neon-cyan/50 text-white h-10" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-neon-cyan text-black font-bold hover:bg-white transition-all h-12" onClick={() => handleAuth("login")} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Access System"}
                </Button>
                <SocialButtons />
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                 <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="John Doe" className="bg-white/5 border-white/10 focus:border-neon-cyan/50 text-white h-10" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" placeholder="name@example.com" className="bg-white/5 border-white/10 focus:border-neon-cyan/50 text-white h-10" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Create Password</Label>
                    <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 focus:border-neon-cyan/50 text-white h-10" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                  </div>
                </div>
                <Button className="w-full bg-white text-black font-bold hover:bg-neon-cyan transition-all h-12" onClick={() => handleAuth("signup")} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                </Button>
                <SocialButtons />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;