import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Clock, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '../store/authStore';
import api from '../api';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data);

        // Check if user already applied
        if (user) {
          try {
            const { data: appData } = await api.get(`/applications/check/${id}`);
            setApplied(appData.applied);
          } catch {}
        }
      } catch (error) {
        console.error('Failed to fetch job', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setApplying(true);
    try {
      await api.post(`/applications/${id}`);
      setApplied(true);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to apply';
      if (msg.includes('already applied')) {
        setApplied(true);
      } else {
        alert(msg);
      }
    } finally {
      setApplying(false);
    }
  };

  // Calculate match score client-side
  const matchScore = (() => {
    if (!user?.skills?.length || !job?.skills?.length) return 0;
    const aliases: Record<string, string> = {
      'nodejs': 'node.js', 'node': 'node.js', 'reactjs': 'react', 'react.js': 'react',
    };
    const norm = (s: string) => { const n = s.toLowerCase().trim().replace(/[^a-z0-9+#.]/g, ''); return aliases[n] || n; };
    const uSkills = user.skills.map(norm);
    const jSkills = job.skills.map(norm);
    let matched = 0;
    for (const js of jSkills) { if (uSkills.includes(js)) matched++; }
    return Math.round((matched / jSkills.length) * 100);
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-medium hover:underline">Go Home</button>
      </div>
    );
  }

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              {matchScore > 0 && (
                <span className={twMerge(
                  "px-3 py-1 rounded-full text-sm font-bold border",
                  matchScore >= 70 ? "bg-green-50 text-green-700 border-green-100" :
                  matchScore >= 40 ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                  "bg-red-50 text-red-700 border-red-100"
                )}>
                  {matchScore}% Match
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-lg text-gray-700 dark:text-gray-300 font-medium mb-6">
              <Building2 className="w-5 h-5 text-gray-400" />
              {job.company}
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {job.experience}
              </div>
              {job.salary && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  {job.salary}
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {job.location} <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-xs ml-1">{job.workMode}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full sm:w-auto">
            {user?.role !== 'recruiter' && (
              <button
                onClick={handleApply}
                disabled={applied || applying}
                className={twMerge(
                  "px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 w-full",
                  applied 
                    ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {applied ? (
                  <><CheckCircle2 className="w-5 h-5" /> Applied Successfully</>
                ) : applying ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Applying...</>
                ) : 'Apply Now'}
              </button>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeAgo(job.createdAt)}</span>
              <span>{job.applicantCount || 0} Applicants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            {job.description && (
              <>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About the Role</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">{job.description}</p>
              </>
            )}

            {job.requirements?.length > 0 && (
              <>
                <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">Requirements</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  {job.requirements.map((req: string, i: number) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {job.skills?.length > 0 && (
            <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string) => {
                  const isMatched = user?.skills?.some(
                    (us: string) => us.toLowerCase().trim() === skill.toLowerCase().trim()
                  );
                  return (
                    <span key={skill} className={twMerge(
                      "px-3 py-1.5 rounded-lg text-sm font-medium",
                      isMatched 
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-blue-50 text-blue-700"
                    )}>
                      {skill} {isMatched && '✓'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Why join {job.company}?</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200/80 leading-relaxed mb-4">
              We offer competitive compensation, comprehensive health benefits, and a flexible work environment designed to help you do your best work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
