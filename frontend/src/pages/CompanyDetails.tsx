import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Globe, Star, MapPin, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api';
import JobCard from '../components/JobCard';

export default function CompanyDetails() {
  const { id } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      // We can use search by name if ID is not available, but let's assume we fetch by recruiter ID
      const { data } = await api.get(`/jobs/companies/${id}`);
      setCompany(data.company);
      setJobs(data.jobs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const itJobs = jobs.filter(j => j.category === 'IT' || j.category === 'Both');
  const nonItJobs = jobs.filter(j => j.category === 'Non-IT');

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0f1117]">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    </div>
  );

  if (!company) return (
    <div className="text-center py-20 min-h-screen bg-gray-50 dark:bg-[#0f1117]">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Company not found</h2>
      <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block">Go back home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#161b22] border-b border-gray-100 dark:border-gray-800 pb-12 transition-colors">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-800"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="w-32 h-32 bg-white dark:bg-[#1c2333] rounded-3xl shadow-2xl p-2 border border-gray-100 dark:border-gray-700">
              {company.companyLogo ? (
                <img src={company.companyLogo} className="w-full h-full object-contain rounded-2xl" />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                  <Building2 className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{company.companyName}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {company.location || 'Global'}</span>
                <span className="flex items-center gap-1 text-yellow-500 font-bold"><Star className="w-4 h-4 fill-current" /> {company.companyRating} ({company.companyReviewCount} reviews)</span>
                {company.companyWebsite && (
                  <a href={company.companyWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: About */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-[#161b22] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">About {company.companyName}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                {company.companyDescription || `${company.companyName} is a leading organization committed to excellence and innovation in their field. They are currently looking for passionate individuals to join their growing team.`}
              </p>
            </div>
          </div>

          {/* Right: Jobs Categorized */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-blue-600" />
                Jobs Posted ({jobs.length})
              </h2>
            </div>

            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {jobs.map(job => (
                  <JobCard key={job._id} job={{
                    id: job._id, title: job.title, company: company.companyName,
                    location: job.location, workMode: job.workMode,
                    experience: job.experience, salary: job.salary,
                    postedAt: 'Recently', matchScore: 0, companyLogo: company.companyLogo
                  }} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#161b22] rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-400 font-medium font-bold">No open jobs at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
