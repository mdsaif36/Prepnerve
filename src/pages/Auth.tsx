import { useState, useEffect, useMemo, memo } from "react"; 
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Github, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; 
import { motion, AnimatePresence } from "framer-motion";

// Custom Google Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Floating Particles Component (Memoized so it doesn't jump on typing)
const Particles = memo(() => {
  const particlesData = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.3,
      yDest: Math.random() * -50 - 20,
      xDest: Math.random() * 30 - 15,
      duration: Math.random() * 3 + 3,
      isEven: i % 2 === 0,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particlesData.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.isEven ? 'bg-blue-400' : 'bg-red-500'}`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            top: `${p.top}%`,
            left: `${p.left}%`,
            opacity: p.opacity,
            boxShadow: `0 0 10px ${p.isEven ? '#3b82f6' : '#ef4444'}`,
          }}
          animate={{
            y: [0, p.yDest],
            x: [0, p.xDest],
            opacity: [p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
});
Particles.displayName = "Particles";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const { signIn, signUp, user, loading: authLoading } = useAuth(); 
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(searchParams.get("tab") === "signup");
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setMounted(true);
    setIsSignUp(searchParams.get("tab") === "signup");
  }, [searchParams]);

  // --- HANDLE SOCIAL LOGIN & MESSAGES ---
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

  // --- HANDLE REDIRECT AFTER LOCAL AUTH ---
  useEffect(() => {
    if (user && !authLoading) {
      const from = location.state?.from?.pathname || "/hub";
      navigate(from, { replace: true, state: { isNewUser: isSignUp } });
    }
  }, [user, authLoading, navigate, location, isSignUp]);

  const handleSocialLogin = (provider: "google" | "github") => {
      const BACKEND_URL = "https://prepnerveserver.onrender.com"; 
      window.location.href = `${BACKEND_URL}/api/auth/${provider}`;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (isSignUp && !fullName) {
      toast.error("Please enter your full name");
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, fullName);
      } else {
        result = await signIn(email, password);
      }
      if (result.error) throw result.error;
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060813] relative overflow-hidden font-sans selection:bg-purple-500/30 text-white p-4">
      
      {/* Background Grid & Particles */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#060813] to-transparent z-0" />
      <Particles />

      {/* Main Centered Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-10 md:gap-24 relative z-10"
      >
        
        {/* ========================================= */}
        {/* LEFT PANEL: LOGO & AI IMAGE */}
        {/* ========================================= */}
        <div className="hidden md:flex w-full md:w-[50%] flex-col items-center justify-center relative">
          
          {/* Blue & Red Transparent Glowing PREPNERVE Logo */}
          <h1 className="text-5xl lg:text-6xl font-black mb-8 uppercase tracking-[0.15em] select-none z-20 flex items-center">
            <span 
              className="text-transparent" 
              style={{ 
                WebkitTextStroke: '2px rgba(59,130,246,0.9)', 
                filter: 'drop-shadow(0 0 25px rgba(59,130,246,0.6))' 
              }}
            >
              PREP
            </span>
            <span 
              className="text-transparent" 
              style={{ 
                WebkitTextStroke: '2px rgba(239,68,68,0.9)', 
                filter: 'drop-shadow(0 0 25px rgba(239,68,68,0.6))' 
              }}
            >
              NERVE
            </span>
          </h1>

          {/* Glowing background aura behind image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full z-0" />

          {/* Generated Image directly from the URL or public folder */}
          
        </div>

        {/* ========================================= */}
        {/* RIGHT PANEL: NEON FORM */}
        {/* ========================================= */}
        <div className="w-full md:w-[45%] flex flex-col justify-center px-4 md:px-0 relative z-10">
          
          <button onClick={() => navigate("/")} className="absolute -top-10 left-0 md:-top-12 md:left-0 text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return
          </button>

          <div className="mb-10 text-center md:text-left mt-8 md:mt-0">
            {/* Mobile-only Blue & Red logo */}
            <h1 className="md:hidden text-4xl font-black mb-6 uppercase tracking-widest select-none flex items-center justify-center">
              <span 
                className="text-transparent" 
                style={{ 
                  WebkitTextStroke: '1.5px rgba(59,130,246,0.9)', 
                  filter: 'drop-shadow(0 0 15px rgba(59,130,246,0.4))' 
                }}
              >
                PREP
              </span>
              <span 
                className="text-transparent" 
                style={{ 
                  WebkitTextStroke: '1.5px rgba(239,68,68,0.9)', 
                  filter: 'drop-shadow(0 0 15px rgba(239,68,68,0.4))' 
                }}
              >
                NERVE
              </span>
            </h1>

            <h2 className="text-xl font-bold text-white tracking-widest mb-2 uppercase">
              {isSignUp ? "Initialize Profile" : "System Access"}
            </h2>
            <p className="text-sm text-gray-400">
              {isSignUp ? "Enter your coordinates to begin the simulation." : "Provide credentials to resume training."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5 w-full max-w-md mx-auto md:mx-0">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative overflow-hidden"
                >
                  <Input 
                    name="fullName" 
                    placeholder="Full Name" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                    className="w-full h-14 rounded-full bg-transparent border border-blue-500/40 text-white px-6 focus:bg-transparent focus:border-purple-500 focus:ring-0 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all placeholder:text-gray-600 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_9999999s_ease-in-out_0s]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="relative">
              <Input 
                name="email" 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full h-14 rounded-full bg-transparent border border-purple-500/40 text-white px-6 focus:bg-transparent focus:border-purple-500 focus:ring-0 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all placeholder:text-gray-600 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_9999999s_ease-in-out_0s]"
              />
            </div>

            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-14 rounded-full bg-transparent border border-red-500/40 text-white px-6 pr-14 focus:bg-transparent focus:border-red-500 focus:ring-0 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all placeholder:text-gray-600 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_9999999s_ease-in-out_0s]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-full bg-transparent border border-purple-500/50 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 font-bold uppercase tracking-widest transition-all mt-4 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? "Initialize" : "Authenticate")}
            </Button>
          </form>

          {/* Social Logins */}
          <div className="mt-8 flex justify-center md:justify-start gap-4 max-w-md mx-auto md:mx-0">
            <button 
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="w-14 h-14 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center hover:border-blue-500 hover:bg-blue-500/10 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <GoogleIcon />
            </button>
            <button 
              type="button"
              onClick={() => handleSocialLogin("github")}
              className="w-14 h-14 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center hover:border-red-500 hover:bg-red-500/10 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <Github className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          <p className="text-center md:text-left text-sm text-gray-500 mt-10 max-w-md mx-auto md:mx-0">
            {isSignUp ? "Already initialized?" : "Need an identity?"}{" "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider transition-colors ml-1"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>

        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
