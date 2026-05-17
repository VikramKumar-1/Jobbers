import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import api from '../api';
import JobCard, { Job } from '../components/JobCard';
import { useAuthStore } from '../store/authStore';
import { formatTimeAgo } from '../utils/format';
import { calculateAdvancedMatch, isWithinDays } from '../utils/jobMatch';
import { getRelatedKeywords } from '../utils/searchNormalization';

export default function JobsList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const title = searchParams.get('title') || 'All Jobs';
  const type = searchParams.get('type') || ''; // latest, matched, recommended
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [type]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/jobs');
      const searchQuery = searchParams.get('search') || '';
      
      // 1. Global filter: 20 days max (same as Home)
      let filtered = data.filter((j: any) => isWithinDays(j.createdAt, 20));

      // 2. Search normalization filter
      if (searchQuery) {
        const keywords = getRelatedKeywords(searchQuery);
        filtered = filtered.filter((j: any) => 
          keywords.some(k => 
            j.title?.toLowerCase().includes(k) || 
            (j.skills || []).some((s: string) => s.toLowerCase().includes(k)) ||
            j.company?.toLowerCase().includes(k)
          )
        );
      }

      // 3. Category Preference / Section specific logic
      if (user?.preferredCategory && user.preferredCategory !== 'Both') {
        filtered = filtered.filter((j: any) => j.category === user.preferredCategory || j.category === 'Both');
      }

      if (type === 'latest') {
        filtered = filtered.filter((j: any) => isWithinDays(j.createdAt, 2));
      } else if (type === 'matched') {
        filtered = filtered.filter((j: any) => calculateAdvancedMatch(user, j) >= 80);
      } else if (type === 'recommended') {
        filtered = filtered.filter((j: any) => {
          const score = calculateAdvancedMatch(user, j);
          return score >= 40 && score < 80;
        });
      }

      const formatted: Job[] = filtered.map((j: any) => ({
        id: j._id || j.id || Math.random().toString(36).substr(2, 9),
        title: j.title || 'Untitled Role',
        company: j.company || 'Unknown Company',
        location: j.location || 'Remote',
        workMode: (['Remote', 'Hybrid', 'On-site'].includes(j.workMode) ? j.workMode : 'On-site') as 'Remote' | 'Hybrid' | 'On-site',
        experience: j.experience || 'Not specified',
        salary: j.salary,
        skills: j.skills || [],
        matchScore: calculateAdvancedMatch(user, j),
        postedAt: formatTimeAgo(j.createdAt),
        _createdAt: j.createdAt,
        isApplied: j.isApplied,
        companyLogo: j.recruiter?.companyLogo,
      }));

      // Sort by score if matched/recommended, else by date
      if (type === 'matched' || type === 'recommended') {
        formatted.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      } else {
        formatted.sort((a, b) => {
          const dateA = a._createdAt ? new Date(a._createdAt).getTime() : 0;
          const dateB = b._createdAt ? new Date(b._createdAt).getTime() : 0;
          return dateB - dateA;
        });
      }

      setJobs(formatted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] transition-colors duration-300">
      <div className="bg-white dark:bg-[#161b22] border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search within these results..." 
                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-[#1c2333] border-none rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-[#161b22] dark:text-white transition-all text-sm font-medium placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all w-full sm:w-auto justify-center">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-bold">Fetching more opportunities...</p>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No jobs found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
