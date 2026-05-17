import { useState, useEffect, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import api from '../api';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  experience: string;
  salary?: string;
  skills?: string[];
  matchScore?: number;
  advScore?: number;
  postedAt: string;
  isApplied?: boolean;
  companyLogo?: string;
  _createdAt?: string;
  category?: string;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [applied, setApplied] = useState(job.isApplied || false);
  const [loading, setLoading] = useState(false);

  // Fetch current apply status when component mounts if not provided
  useEffect(() => {
    if (user && job.isApplied === undefined) {
      api
        .get(`/applications/check/${job.id}`)
        .then(res => setApplied(res.data.applied))
        .catch(() => {});
    }
  }, [user, job.id, job.isApplied]);

  const handleApply = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (user.role === 'recruiter') return;

    setLoading(true);
    try {
      await api.post(`/applications/${job.id}`);
      setApplied(true);
      showToast('Applied successfully!', 'success');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to apply';
      if (msg.includes('already applied')) {
        setApplied(true);
      } else {
        showToast(msg, 'error');
      }
    } finally { setLoading(false); }
  };

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="w-full h-full bg-white dark:bg-[#161b22] border border-gray-200/90 dark:border-gray-800 hover:dark:border-gray-700 rounded-xl p-3.5 sm:p-4 shadow-sm shadow-gray-100/70 hover:shadow-md hover:border-gray-300 dark:shadow-none dark:hover:shadow-none transition-all duration-300 cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-1.5 sm:mb-2">
          <div className="flex items-start flex-1 min-w-0 mr-2 gap-3">
            <div className="w-8 h-8 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-gray-400 font-bold text-lg">{job.company.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 text-sm">
                  {job.title}
                </h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{job.company}</p>
            </div>
          </div>
          {job.matchScore !== undefined && job.matchScore > 0 && (
            <div className={twMerge(
              "flex items-center justify-center w-9 h-9 rounded-full shrink-0 border",
              job.matchScore >= 70 ? "bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800" :
              job.matchScore >= 40 ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-100 dark:border-yellow-800" :
              "bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800"
            )}>
              <span className={twMerge(
                "text-[10px] font-bold",
                job.matchScore >= 70 ? "text-green-700 dark:text-green-400" :
                job.matchScore >= 40 ? "text-yellow-700 dark:text-yellow-400" :
                "text-red-700 dark:text-red-400"
              )}>{job.matchScore}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1 sm:space-y-1.5 mb-2.5 sm:mb-3">
          <div className="flex items-center text-[11px] text-gray-500 dark:text-gray-400 gap-2.5">
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3"/> {job.experience}</span>
            {job.salary && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3"/> {job.salary}</span>}
          </div>
          <div className="flex items-center text-[11px] text-gray-500 dark:text-gray-400 gap-2.5">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {job.location}</span>
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400 text-[10px]">{job.workMode}</span>
          </div>
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {job.skills.slice(0, 3).map(s => (
                <span key={s} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[10px] font-medium">{s}</span>
              ))}
              {job.skills.length > 3 && <span className="text-[10px] text-gray-400">+{job.skills.length - 3}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-50 dark:border-gray-800 mt-auto">
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{job.postedAt}</span>
        </div>

        {user?.role !== 'recruiter' && (
          <button
            onClick={handleApply}
            disabled={applied || loading}
            className={twMerge(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm",
              applied
                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 cursor-default flex items-center gap-1"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {applied ? (<><CheckCircle2 className="w-3.5 h-3.5" /> Applied</>) : loading ? 'Applying...' : 'Apply'}
          </button>
        )}
      </div>
    </div>
  );
}
