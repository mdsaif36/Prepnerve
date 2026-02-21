import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, Bell, ChevronDown, 
  LogOut, User as UserIcon, Save, 
  Mail, Shield, Terminal
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth"; 

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const { user, signOut } = useAuth();
  
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
      setEditName(name);
    }
  }, [user]);

  const getInitials = (name: string) => {
    const cleanName = name?.trim() || "User";
    const parts = cleanName.split(" ");
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleSaveProfile = () => {
    toast.success("Profile update requires backend integration");
    setIsProfileModalOpen(false);
    setIsDropdownOpen(false);
  };

  const NavLink = ({ to, label }: { to: string; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 ${
          isActive ? "text-white" : "text-gray-400 hover:text-white"
        }`}
      >
        {label}
        {isActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />}
      </Link>
    );
  };

  const userName = editName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

  if (location.pathname === "/interview-session" || location.pathname === "/battle-arena") {
    return null;
  }

  return (
    <>
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 pt-6 pointer-events-none">
        
        <div 
          className={`pointer-events-auto transition-all duration-500 ease-out flex items-center justify-between
            ${isScrolled 
              ? "w-[90%] md:max-w-4xl h-14 bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl px-6" 
              : "w-full max-w-7xl h-20 bg-transparent border-transparent px-6"
            }
          `}
        >
          
          {/* --- 1. LOGO --- */}
          <Link to="/" className="relative z-10 group flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              PREPNERVE
            </span>
          </Link>

          {/* --- 2. CENTER NAVIGATION --- */}
          <div className="hidden md:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <NavLink to="/" label="Home" />
            {user && (
              <div className="flex items-center gap-1">
                <NavLink to="/hub" label="Hub" />
                <NavLink to="/dashboard" label="Analytics" />
              </div>
            )}
          </div>

          {/* --- 3. RIGHT SECTION --- */}
          <div className="flex items-center gap-4 relative z-50">
            
            {user ? (
              <div className="flex items-center gap-4" ref={dropdownRef}>

                <div className="relative cursor-pointer group">
                  <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 text-sm font-bold transition-all duration-300 focus:outline-none ${isDropdownOpen ? "text-white scale-105" : "text-gray-300 hover:text-white"}`}
                  >
                    {userName}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>

                  <div 
                    className={`absolute right-0 top-12 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 origin-top-right transform
                      ${isDropdownOpen 
                        ? "opacity-100 scale-100 translate-y-0" 
                        : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
                      }
                    `}
                  >
                      <div className="h-1 w-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500" />
                      <div className="p-2 space-y-1">
                          <button 
                              onClick={() => {
                                setIsProfileModalOpen(true);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all text-left group"
                          >
                              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                                <UserIcon className="w-4 h-4 text-blue-400" /> 
                              </div>
                              <div>
                                <div className="leading-none mb-0.5">Profile</div>
                                <div className="text-[10px] text-gray-500">Edit details</div>
                              </div>
                          </button>

                          <button 
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all text-left group"
                          >
                              <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                                <LogOut className="w-4 h-4 text-red-500" /> 
                              </div>
                              <div>
                                <div className="leading-none mb-0.5">Sign Out</div>
                                <div className="text-[10px] text-red-500/60">End session</div>
                              </div>
                          </button>
                      </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex gap-4">
                {/* 👇 UPDATED LINKS with query params */}
                <Link to="/auth?tab=login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">Sign In</Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button className="bg-white text-black hover:bg-gray-200 font-bold rounded-full">Get Started</Button>
                </Link>
              </div>
            )}

            <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 animate-in fade-in pointer-events-auto">
             <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-white">Home</Link>
             <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-white">Dashboard</Link>
             {user && <button onClick={handleSignOut} className="text-red-500 font-bold text-xl">Sign Out</button>}
             <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8 text-white"><X className="w-8 h-8" /></button>
          </div>
        )}
      </nav>

      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="bg-[#050505] border border-white/10 text-white sm:max-w-[700px] p-0 overflow-hidden rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-300">
            <div className="grid md:grid-cols-[240px_1fr] h-full min-h-[450px]">
                <div className="relative bg-[#0a0a0a] border-r border-white/10 p-6 flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
                    <div className="relative mb-6">
                        <div className="absolute -inset-4 border border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                        <div className="absolute -inset-4 border border-purple-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse] scale-90" />
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-900 to-black p-1 relative z-10">
                            <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center overflow-hidden border border-white/10">
                                <span className="text-4xl font-black text-white tracking-wider">
                                  {getInitials(userName)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center relative z-10">
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                            <Shield className="w-3 h-3" /> Identity Core
                        </div>
                        <h2 className="text-xl font-black text-white mb-1 uppercase break-words max-w-[200px]">
                          {userName}
                        </h2>
                        <div className="text-[10px] font-mono text-gray-500">
                          ID: {user?.id ? user.id.toString().substring(0, 8).toUpperCase() : "N/A"}
                        </div>
                    </div>
                </div>

                <div className="p-8 relative bg-[#050505]">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-purple-500" /> 
                            Identity Configuration
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Update your public facing credentials.</p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Display Name</Label>
                            <div className="relative group">
                                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                <Input 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="pl-10 bg-[#0a0a0a] border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-white h-11 rounded-lg transition-all" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio / Headline</Label>
                            <Textarea 
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                placeholder="Software Engineer | React Enthusiast"
                                className="bg-[#0a0a0a] border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-white min-h-[100px] rounded-lg resize-none p-3 transition-all placeholder:text-gray-700" 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">System Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
                                <Input 
                                    value={user?.email || ""} 
                                    readOnly 
                                    className="pl-10 bg-white/[0.02] border-white/5 text-gray-500 h-11 rounded-lg cursor-not-allowed font-mono text-xs" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/5">
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsProfileModalOpen(false)} 
                            className="text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveProfile} 
                            className="bg-white text-black hover:bg-gray-200 font-bold px-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            <Save className="w-4 h-4 mr-2" /> Save Protocol
                        </Button>
                    </div>
                </div>

            </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;