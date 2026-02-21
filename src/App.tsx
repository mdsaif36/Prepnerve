import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"; 
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth"; // ✅ 1. IMPORT THIS

// --- PAGES ---
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Hub from "./pages/Hub";
import Sessions from "./pages/Sessions";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

// --- FEATURES ---
import CVUpload from "./pages/CVUpload";
import CVScore from "./pages/CVScore";
import Leaderboard from "./pages/Leaderboard";
import InterviewSession from "./pages/InterviewSession";
import BattleLobby from "./pages/BattleLobby";
import BattleArena from "./pages/BattleArena";

import { SpeedInsights } from "@vercel/speed-insights/react"; // ✅ Ensure this is here

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/about" element={<About />} />

        {/* Protected Routes */}
        <Route path="/hub" element={<Hub />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/analytics" element={<Analytics />} />

        <Route path="/cv-upload" element={<CVUpload />} />
        <Route path="/cv-score" element={<CVScore />} />
        <Route path="/interview-session" element={<InterviewSession />} />

        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/battle-lobby" element={<BattleLobby />} />
        <Route path="/battle-arena" element={<BattleArena />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* 👇 2. WRAP EVERYTHING WITH AUTHPROVIDER */}
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
        
        <SpeedInsights />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
