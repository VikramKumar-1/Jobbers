import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, Star, Search, Loader2 } from 'lucide-react';
import api from '../api';

export default function CompanyList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const title = searchParams.get('title') || 'Featured Companies';
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      // Fetch both top and hiring to combine or just one based on title
      const endpoint = title.includes('Hiring') ? '/jobs/companies/hiring' : '/jobs/companies/top';
      const { data } = await api.get(endpoint);
      setCompanies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = companies.filter(c => 
    c.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] transition-colors duration-300">
      <div className="bg-white dark:bg-[#161b22] border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h1>
          </div>

          <div className="relative group max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search companies by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-[#1c2333] border-none rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-[#161b22] dark:text-white transition-all text-sm font-bold placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-bold">Discovering top companies...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((c) => (
              <div 
                key={c._id} 
                onClick={() => navigate(`/company/${c._id || c.recruiter}`)}
                className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 p-6 rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-2 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors border border-gray-50 dark:border-gray-700 shadow-sm">
                    {c.companyLogo ? (
                      <img src={c.companyLogo} className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <Building2 className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2.5 py-1 rounded-xl">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                    <span className="text-xs font-black text-yellow-700 dark:text-yellow-400">{c.companyRating || '0.0'}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">
                  {c.companyName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                  {c.companyDescription || 'Leading innovator in their industry hiring top talent.'}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    {c.count || c.jobCount || 0} Openings
                  </span>
                  <div className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                    View Profile
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-[#161b22] rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800">
            <Building2 className="w-16 h-16 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No companies found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
