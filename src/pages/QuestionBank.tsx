import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api"; 
import PageTransition from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Database, User, ArrowLeft, Folder, Layers, Building2 } from "lucide-react";

// ✅ 1. Update the interface to include the optional companies field
interface QuestionData {
  text: string;
  role: string;
  type: string;
  difficulty: string;
  companies?: string; // Added field for company names
}

// --- HELPER FUNCTIONS ---
const getDifficultyColor = (diff: string) => {
  switch ((diff || "").toLowerCase()) {
    case "easy": return "text-green-400 bg-green-400/10 border-green-400/20";
    case "medium": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    case "hard": return "text-red-400 bg-red-400/10 border-red-400/20";
    default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  }
};

// --- QUESTION CARD COMPONENT ---
const QuestionCard = ({ q }: { q: QuestionData }) => {
  return (
    <Card className="bg-[#080808] border-white/10 p-6 hover:border-neon-cyan/40 hover:bg-[#0a0f18] transition-all group flex flex-col justify-between h-full shadow-lg relative overflow-hidden">
      
      <div className="relative z-10">
        {/* Top Badges */}
        <div className="flex justify-between items-start mb-6">
          <Badge className="bg-white/5 text-gray-300 uppercase text-[10px] tracking-wider border-none">
            {q.type || "General"}
          </Badge>
          <Badge variant="outline" className={`text-[10px] uppercase border font-bold tracking-widest ${getDifficultyColor(q.difficulty)}`}>
            {q.difficulty || "Unranked"}
          </Badge>
        </div>
        
        {/* Directly Visible Question */}
        <div className="mb-6">
          <p className="text-gray-200 text-lg leading-relaxed font-medium group-hover:text-white transition-colors">
            {q.text}
          </p>
        </div>

        {/* ✅ 2. Render Company Badges if they exist */}
        {q.companies && (
          <div className="mb-6 animate-in fade-in duration-500">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Target Companies
            </p>
            <div className="flex flex-wrap gap-1">
              {q.companies.split(',').map((company, i) => (
                <span key={i} className="text-[10px] bg-neon-cyan/5 border border-neon-cyan/10 px-2 py-0.5 rounded text-neon-cyan/80 group-hover:text-neon-cyan group-hover:border-neon-cyan/30 transition-all">
                  {company.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Section */}
      <div className="mt-auto relative z-10">
        
        {/* Small Navbar-Style Branding */}
        <div className="mb-3 pl-1">
          <span className="text-xs font-black tracking-widest uppercase text-white/70 group-hover:text-white transition-colors">
            Prep<span className="text-neon-cyan">Nerve</span>
          </span>
        </div>

        {/* Footer / Role Info */}
        <div className="pt-4 border-t border-white/5 flex items-center gap-3">
          <div className="p-2 bg-neon-cyan/10 rounded-lg group-hover:bg-neon-cyan/20 transition-colors">
            <User className="w-4 h-4 text-neon-cyan" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Target Role</p>
            <p className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">
              {q.role || "Any Role"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

// --- MAIN PAGE COMPONENT ---
const QuestionBank = () => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const res = await api.get('/api/questions'); 
        setQuestions(res.data || []);
      } catch (error) {
        console.error("Failed to fetch dataset:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDataset();
  }, []);

  const domains = useMemo(() => {
    const domainMap = new Map<string, { name: string; count: number; types: Set<string> }>();
    
    questions.forEach(q => {
      const roleName = q.role || "General";
      if (!domainMap.has(roleName)) {
        domainMap.set(roleName, { name: roleName, count: 0, types: new Set() });
      }
      const domain = domainMap.get(roleName)!;
      domain.count += 1;
      if (q.type) domain.types.add(q.type);
    });

    return Array.from(domainMap.values()).sort((a, b) => b.count - a.count);
  }, [questions]);

  const filteredQuestions = questions.filter(q => {
    if (q.role !== selectedDomain) return false;
    
    // ✅ 3. Updated search logic to also search through company names
    const textMatch = (q.text || "").toLowerCase().includes(searchTerm.toLowerCase());
    const companyMatch = (q.companies || "").toLowerCase().includes(searchTerm.toLowerCase());
    const diffMatch = difficultyFilter === "All" || (q.difficulty || "").toLowerCase() === difficultyFilter.toLowerCase();
    
    return (textMatch || companyMatch) && diffMatch;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#02040a] text-white">
        <Navbar />
        <div className="relative z-10 pt-32 pb-12 px-6 max-w-7xl mx-auto min-h-[80vh]">
          
          {!selectedDomain ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black uppercase mb-3 tracking-tighter flex items-center gap-3">
                  <Database className="text-neon-cyan w-10 h-10" />
                  INTERVIEW <span className="text-neon-cyan">Directory</span>
                </h1>
                <p className="text-gray-400 text-lg">
                  Select a domain archive below to view its associated interview questions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-40 bg-white/5 rounded-xl border border-white/10 animate-pulse"></div>
                  ))
                ) : (
                  domains.map((domain, idx) => (
                    <Card 
                      key={idx}
                      onClick={() => {
                        setSelectedDomain(domain.name);
                        setSearchTerm(""); 
                        setDifficultyFilter("All");
                      }}
                      className="bg-[#080808] border-white/10 p-6 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-neon-cyan/5 rounded-full blur-2xl group-hover:bg-neon-cyan/10 transition-colors"></div>
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-neon-cyan/30 transition-colors">
                          <Folder className="w-8 h-8 text-neon-cyan" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-neon-cyan transition-colors">
                            {domain.name}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            {domain.count} Questions
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 relative z-10">
                        {Array.from(domain.types).map((type, i) => (
                          <Badge key={i} className="bg-white/5 text-gray-300 border-none text-[10px] uppercase tracking-wider">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="mb-10">
                <button 
                  onClick={() => setSelectedDomain(null)}
                  className="flex items-center gap-2 text-gray-400 hover:text-neon-cyan transition-colors mb-6 font-bold uppercase text-sm tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Datasets
                </button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase mb-3 tracking-tighter flex items-center gap-3 text-neon-cyan">
                      <Folder className="w-10 h-10 text-white" />
                      {selectedDomain}
                    </h1>
                    <p className="text-gray-400 text-lg">
                      Showing <span className="text-white font-bold">{filteredQuestions.length}</span> results in this dataset.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                      {["All", "Easy", "Medium", "Hard"].map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficultyFilter(level)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            difficultyFilter === level 
                              ? "bg-white/10 text-white shadow-sm" 
                              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
                      <input 
                        type="text"
                        placeholder="Search keywords or companies..."
                        className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-neon-cyan focus:bg-white/10 outline-none transition-all placeholder:text-gray-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((q, idx) => (
                    <QuestionCard key={idx} q={q} />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">No matching questions</h3>
                    <p className="text-gray-600 mt-2">Try adjusting your filters or search terms.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default QuestionBank;