import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"; 
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";

// --- PAGES ---
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Hub from "./pages/Hub";
import Sessions from "./pages/Sessions";
import Profile from "./pages/Profile";
import About from "./pages/About";
// ✅ Renamed to AnalyticsPage to avoid collision with Vercel Analytics
import AnalyticsPage from "./pages/Analytics"; 
import NotFound from "./pages/NotFound";
import QuestionBank from "./pages/QuestionBank"; 

// --- FEATURES ---
import CVUpload from "./pages/CVUpload";
import CVScore from "./pages/CVScore";
import Leaderboard from "./pages/Leaderboard";
import InterviewSession from "./pages/InterviewSession";
import BattleLobby from "./pages/BattleLobby";
import BattleArena from "./pages/BattleArena";

// --- VERCEL ---
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react"; // ✅ IMPORT VERCEL ANALYTICS

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
        <Route path="/analytics" element={<AnalyticsPage />} /> {/* ✅ Updated to use the renamed import */}
        <Route path="/intelligence" element={<QuestionBank />} />

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
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
        
        {/* Vercel Tracking Components */}
        <SpeedInsights />
        <Analytics /> {/* ✅ ADDED VERCEL ANALYTICS COMPONENT HERE */}

      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;