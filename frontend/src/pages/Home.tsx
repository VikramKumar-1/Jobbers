import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { formatTimeAgo } from '../utils/format';
import JobSlider from '../components/JobSlider';
import Skeleton from '../components/Skeleton';
import { Job } from '../components/JobCard';
import { Search, MapPin, Building2, Globe, ArrowRight, X, Cpu, Users, Wifi, Code2, Palette, Database, Smartphone, BarChart3, Wrench, Truck, HeartPulse, GraduationCap, Landmark, Sparkles } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { calcMatch, calculateAdvancedMatch, isWithinDays } from '../utils/jobMatch';
import { getRelatedKeywords } from '../utils/searchNormalization';

const popularCategories = [
  { label: 'All', icon: Globe, color: 'from-gray-500 to-gray-700' },
  { label: 'IT Jobs', icon: Code2, color: 'from-blue-500 to-blue-700' },
  { label: 'Non-IT Jobs', icon: Wrench, color: 'from-amber-500 to-amber-700' },
  { label: 'Remote', icon: Wifi, color: 'from-emerald-500 to-emerald-700' },
  { label: 'React', icon: Code2, color: 'from-cyan-500 to-cyan-700' },
  { label: 'Node.js', icon: Database, color: 'from-green-500 to-green-700' },
  { label: 'Python', icon: Code2, color: 'from-yellow-500 to-yellow-700' },
  { label: 'Java', icon: Code2, color: 'from-red-500 to-red-700' },
  { label: 'UI/UX', icon: Palette, color: 'from-pink-500 to-pink-700' },
  { label: 'DevOps', icon: Database, color: 'from-violet-500 to-violet-700' },
  { label: 'Mobile', icon: Smartphone, color: 'from-indigo-500 to-indigo-700' },
  { label: 'Data Science', icon: BarChart3, color: 'from-teal-500 to-teal-700' },
  { label: 'Marketing', icon: Truck, color: 'from-orange-500 to-orange-700' },
  { label: 'Healthcare', icon: HeartPulse, color: 'from-rose-500 to-rose-700' },
  { label: 'Education', icon: GraduationCap, color: 'from-sky-500 to-sky-700' },
  { label: 'Finance', icon: Landmark, color: 'from-emerald-600 to-emerald-800' },
];

export default function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Job[] | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [companySearchResults, setCompanySearchResults] = useState<any[]>([]);

  const companyRef = useRef<HTMLDivElement>(null);
  const [hiringCompanies, setHiringCompanies] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "Search 'Laravel Developer'",
    "Search 'React Developer'",
    "Search 'Financial Analyst'",
    "Search 'Data Scientist'",
    "Search 'Marketing Manager'",
    "Search 'Mechanical Engineer'",
    "Skills, designations, companies..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { fetchJobs(); fetchHiringCompanies(); fetchTopCompanies(); }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) setCompanySearchResults([]);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/jobs');
      setAllJobs(data);
      formatAndSetJobs(data);
    } catch (error) { console.error('Failed to fetch jobs', error); }
    finally { setLoading(false); }
  };

  const formatAndSetJobs = (data: any[], categoryFilter?: string) => {
    // Global filter: Remove jobs older than 20 days
    let filtered = data.filter((j: any) => isWithinDays(j.createdAt, 20));
    if (categoryFilter && categoryFilter !== 'All') {
      if (categoryFilter === 'IT Jobs') {
        filtered = data.filter((j: any) => j.category === 'IT' || j.category === 'Both');
      } else if (categoryFilter === 'Non-IT Jobs') {
        filtered = data.filter((j: any) => j.category === 'Non-IT' || j.category === 'Both');
      } else if (categoryFilter === 'Remote') {
        filtered = data.filter((j: any) => j.workMode === 'Remote');
      } else {
        const keywords = getRelatedKeywords(categoryFilter);
        filtered = data.filter((j: any) =>
          keywords.some(k =>
            j.title?.toLowerCase().includes(k) ||
            (j.skills || []).some((s: string) => s.toLowerCase().includes(k)) ||
            j.category?.toLowerCase().includes(k)
          )
        );
      }
    } else if ((!categoryFilter || categoryFilter === 'All') && user?.preferredCategory && user.preferredCategory !== 'Both') {
      filtered = data.filter((j: any) => j.category === user.preferredCategory || j.category === 'Both');
    }
    const formatted = filtered.map((j: any) => ({
      id: j._id, title: j.title, company: j.company, location: j.location,
      workMode: j.workMode, experience: j.experience, salary: j.salary,
      skills: j.skills || [], postedAt: formatTimeAgo(j.createdAt),
      matchScore: user?.skills?.length ? calcMatch(user.skills, j.skills || []) : 0,
      advScore: calculateAdvancedMatch(user, j),
      isApplied: j.isApplied, _createdAt: j.createdAt, companyLogo: j.recruiter?.companyLogo,
      category: j.category,
    }));
    setJobs(formatted);
  };

  const fetchTopCompanies = async () => {
    try {
      const { data } = await api.get('/jobs/companies/top');
      const unique: any[] = []; const seen = new Set();
      for (const c of data) { const n = c.companyName.toLowerCase().trim(); if (!seen.has(n)) { unique.push(c); seen.add(n); } }
      setTopCompanies(unique);
    } catch (e) { console.error(e); }
  };

  const fetchHiringCompanies = async () => {
    try {
      const { data } = await api.get('/jobs/companies/hiring');
      const unique: any[] = []; const seen = new Set();
      for (const c of data) { const n = c.companyName.toLowerCase().trim(); if (!seen.has(n)) { unique.push(c); seen.add(n); } }
      setHiringCompanies(unique);
    } catch (e) { console.error(e); }
  };

  const handleSearchSuggestions = async (val: string) => {
    setSearchQuery(val);
    if (val.length === 0) {
      setCompanySearchResults([
        { name: 'Full Stack Developer', type: 'title' },
        { name: 'React Developer', type: 'title' },
        { name: 'Frontend Developer', type: 'title' },
        { name: 'Laravel', type: 'skill' },
        { name: 'Financial Analyst', type: 'title' },
        { name: 'Marketing Manager', type: 'title' }
      ]);
      return;
    }
    if (val.length < 2) { setCompanySearchResults([]); return; }
    setSearchingCompany(true);
    try { const { data } = await api.get(`/jobs/suggestions?q=${val}`); setCompanySearchResults(data); }
    catch (e) { console.error(e); } finally { setSearchingCompany(false); }
  };

  const handleSearch = async (companyName?: string) => {
    if (!searchQuery && !locationQuery && !companyName) { setSearchResults(null); return; }
    try {
      setLoading(true);
      const params = new URLSearchParams();
      const keywords = getRelatedKeywords(companyName || searchQuery);
      
      // Instead of multiple params, we send the normalized primary keyword to backend
      // but also filter locally for best results if needed.
      if (searchQuery || companyName) params.set('search', companyName || searchQuery);
      if (locationQuery) params.set('location', locationQuery);
      
      const { data } = await api.get(`/jobs?${params.toString()}`);
      
      // Local refine with normalized keywords for "advance" search
      const refined = data.filter((j: any) => 
        keywords.some(k => 
          j.title?.toLowerCase().includes(k) || 
          (j.skills || []).some((s: string) => s.toLowerCase().includes(k)) ||
          j.company?.toLowerCase().includes(k)
        )
      );

      const formatted = refined.map((j: any) => ({
        id: j._id, title: j.title, company: j.company, location: j.location,
        workMode: j.workMode, experience: j.experience, salary: j.salary,
        skills: j.skills || [], postedAt: formatTimeAgo(j.createdAt),
        matchScore: user?.skills?.length ? calcMatch(user.skills, j.skills || []) : 0,
        companyLogo: j.recruiter?.companyLogo,
      }));
      setSearchResults(formatted);
      setCompanySearchResults([]);
    } catch (error) { console.error('Search failed', error); }
    finally { setLoading(false); }
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setSearchResults(null);
    setSearchQuery('');
    setLocationQuery('');
    formatAndSetJobs(allJobs, cat === 'All' ? undefined : cat);
  };

  // Derive different job lists with limits and timeframes
  // Latest Job posting: Last 2 days (48 hours)
  const latestJobs = jobs
    .filter(j => isWithinDays((j as any)._createdAt, 2))
    .sort((a, b) => new Date((b as any)._createdAt).getTime() - new Date((a as any)._createdAt).getTime())
    .slice(0, 20);

  // Best Match: High skill match or high advanced score
  const highMatchJobs = jobs
    .filter(j => (j.matchScore || 0) >= 70 || (j as any).advScore >= 80)
    .sort((a, b) => ((b as any).advScore || 0) - ((a as any).advScore || 0))
    .slice(0, 20);

  // Recommended: Balanced mix of skills, location, and category
  // If no user or low scores, recommend the top jobs in the current view
  const recommendedJobs = jobs
    .filter(j => {
      // If we're filtering by a specific category that is different from their preferred one, don't restrict by high advScore threshold
      const isDifferentCategory = 
        (user?.preferredCategory === 'IT' && activeCategory === 'Non-IT Jobs') ||
        (user?.preferredCategory === 'Non-IT' && activeCategory === 'IT Jobs');

      // If user has skills, try to find a match >= 15 unless viewing a different category
      if (user?.skills?.length && !isDifferentCategory) return (j as any).advScore >= 15 && (j as any).advScore < 80;
      // If guest, no skills, or browsing a different category, show everything in the pool (sorted by relevance/date)
      return true;
    })
    .sort((a, b) => {
      // Sort by advanced score if user has skills
      if (user?.skills?.length) return ((b as any).advScore || 0) - ((a as any).advScore || 0);
      // Otherwise keep it fresh (sorted by date)
      return new Date((b as any)._createdAt).getTime() - new Date((a as any)._createdAt).getTime();
    })
    .slice(0, 20);

  // Recommended IT Jobs (specifically for users with 'Both' category preference)
  const recommendedItJobs = jobs
    .filter(j => j.category === 'IT' || j.category === 'Both')
    .sort((a, b) => {
      if (user?.skills?.length) return ((b as any).advScore || 0) - ((a as any).advScore || 0);
      return new Date((b as any)._createdAt).getTime() - new Date((a as any)._createdAt).getTime();
    })
    .slice(0, 20);

  // Recommended Non-IT Jobs (specifically for users with 'Both' category preference)
  const recommendedNonItJobs = jobs
    .filter(j => j.category === 'Non-IT' || j.category === 'Both')
    .sort((a, b) => {
      if (user?.skills?.length) return ((b as any).advScore || 0) - ((a as any).advScore || 0);
      return new Date((b as any)._createdAt).getTime() - new Date((a as any)._createdAt).getTime();
    })
    .slice(0, 20);

  const remoteJobs = jobs.filter(j => j.workMode === 'Remote').slice(0, 20);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-[#0f1117] transition-colors duration-300">
      {/* Search Section - Clean & Compact */}
      <section className="bg-white dark:bg-[#161b22] border-b border-gray-100 dark:border-gray-800 py-5 px-4 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#1c2333] p-1 rounded-2xl sm:rounded-full flex items-center shadow-[0_4px_20px_rgb(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.3)] max-w-4xl mx-auto flex-col sm:flex-row gap-0 border border-gray-100 dark:border-gray-700">
            <div className="flex-[1.2] flex items-center px-5 py-3 w-full relative" ref={companyRef}>
              <Search className="text-blue-600 w-4.5 h-4.5 mr-3 shrink-0" />
              <input
                type="text" value={searchQuery}
                onChange={(e) => handleSearchSuggestions(e.target.value)}
                onFocus={(e) => { if (e.target.value === '') handleSearchSuggestions('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={placeholders[placeholderIndex]}
                className="w-full focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-semibold bg-transparent text-sm transition-all duration-500"
              />
              {companySearchResults.length > 0 && (
                <div className="absolute top-[110%] left-0 right-0 z-50 bg-white dark:bg-[#1c2333] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden py-2">
                  <div className="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-700 flex justify-between items-center mb-1">
                    <span>Suggestions</span>
                    <button onClick={() => setCompanySearchResults([])}><X className="w-3 h-3"/></button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {companySearchResults.map((res, i) => (
                      <div key={i}
                        onClick={() => { if (res.type === 'company') navigate(`/company/${res.id}`); else { setSearchQuery(res.name); setTimeout(() => handleSearch(), 50); } }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                      >
                        <div className="w-7 h-7 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                          {res.type === 'company' ? (res.logo ? <img src={res.logo} className="w-full h-full object-contain rounded-lg" /> : <Building2 className="w-3.5 h-3.5 text-gray-400"/>) :
                           res.type === 'skill' ? <Cpu className="w-3.5 h-3.5 text-purple-500" /> : <MapPin className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">{res.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{res.type}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-all"/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden sm:block w-[1px] h-8 bg-gray-100 dark:bg-gray-700"></div>
            <div className="flex-1 flex items-center px-5 py-3 w-full">
              <MapPin className="text-gray-400 w-4.5 h-4.5 mr-3 shrink-0" />
              <input type="text" value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Location"
                className="w-full focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-semibold bg-transparent text-sm"
              />
            </div>
            <button onClick={() => handleSearch()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-black transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 w-full sm:w-auto sm:mr-1 text-sm"
            >Search</button>
          </div>
        </div>
      </section>

      {/* Popular Categories - Horizontal Scroll */}
      <section className="py-3 bg-white dark:bg-[#161b22] border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {popularCategories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.label;
              return (
                <button key={cat.label} onClick={() => handleCategoryClick(cat.label)}
                  className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                    isActive
                      ? 'bg-gradient-to-r ' + cat.color + ' text-white border-transparent shadow-md scale-[1.02]'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 py-4 space-y-4">
        {searchResults ? (
          <div className="min-h-[400px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
              <button onClick={() => { setSearchQuery(''); setLocationQuery(''); setSearchResults(null); }}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-all font-bold shadow-lg text-sm"
              >← Back to Feed</button>
            </div>
            {searchResults.length > 0 ? (
              <JobSlider title={`Results Found (${searchResults.length})`} jobs={searchResults} loading={loading} />
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No matching jobs found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">Try different keywords or browse categories.</p>
                <button onClick={() => { setSearchQuery(''); setLocationQuery(''); setSearchResults(null); }}
                  className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 text-sm"
                >Browse All Jobs</button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Recruiter Banner */}
            {!user && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div onClick={() => navigate('/register?role=recruiter')}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-xs">Hiring for your company?</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Post a job and find top talent</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    Start <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            )}

            {/* Job Sections */}
            {loading || jobs.length > 0 ? (
              <>
                <JobSlider title="Latest Postings" icon={<span className="text-blue-500">✨</span>} jobs={latestJobs} loading={loading} type="latest" />
                
                {(user?.skills?.length ?? 0) > 0 && highMatchJobs.length > 0 && !(user?.preferredCategory === 'Non-IT' && activeCategory === 'IT Jobs') && (
                  <JobSlider title="🎯 Best Match For You" jobs={highMatchJobs} loading={loading} type="matched" />
                )}
                
                {/* Recommended Jobs or Recommended IT/Non-IT Jobs */}
                {(!user || user?.preferredCategory === 'Both' || !user?.preferredCategory) && activeCategory === 'All' ? (
                  <>
                    {recommendedItJobs.length > 0 && (
                      <JobSlider title="Recommended IT Jobs" icon={<Sparkles className="w-4 h-4 text-blue-500" />} jobs={recommendedItJobs} loading={loading} type="recommended" />
                    )}
                    {recommendedNonItJobs.length > 0 && (
                      <JobSlider title="Recommended Non-IT Jobs" icon={<Sparkles className="w-4 h-4 text-amber-500" />} jobs={recommendedNonItJobs} loading={loading} type="recommended" />
                    )}
                  </>
                ) : (
                  recommendedJobs.length > 0 && (
                    <JobSlider title="Recommended Jobs" icon={<Sparkles className="w-4 h-4 text-purple-500" />} jobs={recommendedJobs} loading={loading} type="recommended" />
                  )
                )}
                
                {remoteJobs.length > 0 && !(user?.preferredCategory === 'Non-IT' && activeCategory === 'IT Jobs') && (
                  <JobSlider title="🌍 Remote Opportunities" jobs={remoteJobs} loading={loading} type="remote" />
                )}
              </>
            ) : !loading && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No jobs found for this category</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Try a different category or check back later!</p>
                <button onClick={() => handleCategoryClick('All')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">Show All Jobs</button>
              </div>
            )}
          </>
        )}

        {/* Companies Sections */}
        <div className="space-y-6 pt-4">
          {(loading || hiringCompanies.length > 0) && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">🔥 Top Hiring Companies</h2>
                <button onClick={() => navigate('/companies?title=Top%20Hiring%20Companies')} className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline">View All</button>
              </div>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-3">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex-none w-48 bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 p-3 rounded-2xl shadow-sm flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-3/4 rounded" />
                        <Skeleton className="h-2 w-1/2 rounded" />
                      </div>
                    </div>
                  ))
                ) : (
                  hiringCompanies.map(c => (
                  <div key={c._id} onClick={() => navigate(`/company/${c._id}`)} className="flex-none w-48 bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 p-3 rounded-2xl shadow-sm hover:shadow-lg dark:hover:shadow-blue-900/10 transition-all cursor-pointer group hover:-translate-y-0.5 flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center p-1.5 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                      {c.companyLogo ? <img src={c.companyLogo} className="w-full h-full object-contain rounded-lg" /> : <Building2 className="w-5 h-5 text-gray-400"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5 line-clamp-1">{c.companyName}</h3>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">{c.jobCount} Jobs Available</span>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </section>
          )}

          {(loading || topCompanies.length > 0) && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">⭐ Top Rated Companies</h2>
                <button onClick={() => navigate('/companies?title=Top%20Rated%20Companies')} className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline">View All</button>
              </div>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-3">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex-none w-48 bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 p-3 rounded-2xl shadow-sm flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-3/4 rounded" />
                        <Skeleton className="h-2 w-1/3 rounded" />
                      </div>
                    </div>
                  ))
                ) : (
                  topCompanies.map(c => (
                  <div key={c._id} onClick={() => navigate(`/company/${c._id}`)} className="flex-none w-48 bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 p-3 rounded-2xl shadow-sm hover:shadow-lg dark:hover:shadow-blue-900/10 transition-all cursor-pointer group hover:-translate-y-0.5 flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center p-1.5 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                      {c.companyLogo ? <img src={c.companyLogo} className="w-full h-full object-contain rounded-lg" /> : <Building2 className="w-5 h-5 text-gray-400"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-0.5 line-clamp-1 transition-colors">{c.companyName}</h3>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-yellow-600 dark:text-yellow-400">⭐ {c.companyRating}</span>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
