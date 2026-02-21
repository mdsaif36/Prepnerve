import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api'; // ✅ Uses your Backend connection

// Define User Type based on your Backend response
interface User {
  id: number;
  email: string;
  full_name?: string;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check LocalStorage on load (Backend Auth Strategy)
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user data", e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // --- ACTIONS ---

  const signIn = async (email: string, password: string) => {
    try {
      // ✅ Call YOUR Backend (Neon DB)
      const { data } = await api.post('/api/auth/login', { email, password });
      
      // Save Session
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { error: null };
    } catch (err: any) {
      console.error("Login Failed:", err);
      return { error: err.response?.data?.error || "Login failed" };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // ✅ Call YOUR Backend (Neon DB)
      const { data } = await api.post('/api/auth/signup', { email, password, fullName });
      
      // Save Session
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { error: null };
    } catch (err: any) {
      console.error("Signup Failed:", err);
      return { error: err.response?.data?.error || "Signup failed" };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/'; // Hard redirect to clear any state
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
