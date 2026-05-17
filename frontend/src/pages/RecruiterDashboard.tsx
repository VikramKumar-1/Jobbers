import { useState, useEffect, useRef } from 'react';
import { Users, Briefcase, Plus, FileText, CheckCircle, TrendingUp, X, Search, Eye, Clock, UserCheck, UserX, Loader2 } from 'lucide-react';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { ALL_SKILLS } from '../data/skills';

interface JobData {
  _id: string; title: string; company: string; location: string; workMode: string;
  skills: string[]; requirements: string[]; experience: string; salary: string;
  description: string; maxApplicants: number; status: string; createdAt: string;
  autoApplyLimit: number; manualApplyLimit: number;
  counts: { total: number; pending: number; accepted: number; rejected: number; waitlisted: number };
}

interface Applicant {
  _id: string; matchScore: number; appliedVia: string; status: string; createdAt: string;
  user: { 
    _id: string; name: string; email: string; skills: string[]; headline: string; 
    location: string; resumeUrl: string; profileCompletion: number; 
    experience: any[]; education: any[]; companyName?: string; companyLogo?: string;
  };
}

export default function RecruiterDashboard() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewApplicant, setViewApplicant] = useState<Applicant | null>(null);

  
  const [searchQuery, setSearchQuery] = useState('');
  const [minExp, setMinExp] = useState('');
  const [maxExp, setMaxExp] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [jobForm, setJobForm] = useState({ 
    title: '', location: '', workMode: 'Hybrid', 
    experience: 'Fresher', salary: '', description: '', 
    skills: [] as string[], requirements: '', 
    maxApplicants: 100, autoApplyLimit: 10, manualApplyLimit: 10,
    category: 'IT' 
  });
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchMyJobs(); }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchResults([]);
      if (skillRef.current && !skillRef.current.contains(e.target as Node)) setShowSkillDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/jobs/recruiter/my');
      setJobs(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchApplicants = async (jobId: string, status = '') => {
    setAppLoading(true);
    try {
      const url = status ? `/applications/job/${jobId}?status=${status}` : `/applications/job/${jobId}`;
      const { data } = await api.get(url);
      setApplicants(data);
    } catch (e) { console.error(e); } finally { setAppLoading(false); }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (jobForm.skills.length === 0) return showToast('Please add at least one skill requirement.', 'error');
    try {
      const payload: any = { ...jobForm };
      delete payload.company;

      await api.post('/jobs', {
        ...payload,
        requirements: jobForm.requirements.split(',').map(s => s.trim()).filter(Boolean),
      });
      setShowPostModal(false);
      setJobForm({ 
        title: '', location: '', workMode: 'Hybrid', 
        experience: 'Fresher', salary: '', description: '', 
        skills: [], requirements: '', 
        maxApplicants: 100, autoApplyLimit: 10, manualApplyLimit: 10,
        category: 'IT' 
      });
      fetchMyJobs();
      showToast('Job posted successfully!', 'success');
    } catch (error: any) { showToast(error.response?.data?.message || 'Failed to post job', 'error'); }
  };

  const updateStatus = async (appId: string, status: string) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      if (selectedJob) fetchApplicants(selectedJob._id, statusFilter);
      showToast(`Applicant status updated to ${status}`, 'success');
    } catch (e: any) { showToast(e.response?.data?.message || 'Failed', 'error'); }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (minExp) params.set('minExp', minExp);
      if (maxExp) params.set('maxExp', maxExp);
      
      const { data } = await api.get(`/users/search?${params.toString()}`);
      setSearchResults(data);
      if (data.length === 0) showToast('No candidates found', 'info');
    } catch (e) { console.error(e); } finally { setSearching(false); }
  };

  const selectJob = (job: JobData) => {
    setSelectedJob(job);
    setStatusFilter('');
    fetchApplicants(job._id);
  };

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await api.patch(`/jobs/${jobId}/status`, { status: newStatus });
      fetchMyJobs();
      showToast(`Job status updated to ${newStatus}`, 'success');
    } catch (e: any) { showToast(e.response?.data?.message || 'Failed to update job status', 'error'); }
  };

  const deleteJobHandler = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job and all its applications?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      if (selectedJob?._id === jobId) setSelectedJob(null);
      fetchMyJobs();
      showToast('Job deleted successfully', 'success');
    } catch (e: any) { showToast(e.response?.data?.message || 'Failed to delete job', 'error'); }
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !jobForm.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      setJobForm({ ...jobForm, skills: [...jobForm.skills, skill.trim()] });
    }
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const removeSkill = (skill: string) => {
    setJobForm({ ...jobForm, skills: jobForm.skills.filter(s => s !== skill) });
  };

  const filteredSkills = ALL_SKILLS.filter(
    s => s.toLowerCase().includes(skillSearch.toLowerCase()) && !jobForm.skills.some(existing => existing.toLowerCase() === s.toLowerCase())
  ).slice(0, 15);

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.counts?.total || 0), 0);
  const totalAccepted = jobs.reduce((sum, j) => sum + (j.counts?.accepted || 0), 0);

  // Applicant Detail Modal
  if (viewApplicant) {
    const u = viewApplicant.user;
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => setViewApplicant(null)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 font-medium"><X className="w-4 h-4" /> Back to Applicants</button>
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{u.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{u.headline || u.email}</p>
              {u.location && <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{u.location}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`px-4 py-2 rounded-full font-bold text-lg ${viewApplicant.matchScore >= 70 ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : viewApplicant.matchScore >= 40 ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                {viewApplicant.matchScore}% Match
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Applied via {viewApplicant.appliedVia}</span>
            </div>
          </div>

          {u.skills?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">{u.skills.map((s: string) => <span key={s} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">{s}</span>)}</div>
            </div>
          )}

          {u.experience?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Experience</h3>
              {u.experience.map((exp: any, i: number) => (
                <div key={i} className="mb-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-gray-900 dark:text-white">{exp.role}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{exp.company} • {exp.startMonth} {exp.startYear} - {exp.endMonth === 'Present' ? 'Present' : `${exp.endMonth} ${exp.endYear}`}</p>
                  {exp.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {u.education?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Education</h3>
              {u.education.map((edu: any, i: number) => (
                <div key={i} className="mb-2"><p className="font-semibold dark:text-gray-200">{edu.institution}</p><p className="text-sm text-gray-600 dark:text-gray-400">{edu.degree} • {edu.year}</p></div>
              ))}
            </div>
          )}

          {u.resumeUrl && (
            <div className="mb-6 flex gap-3">
              <a href={u.resumeUrl} download={`${u.name.replace(/\s+/g, '_')}_Resume.pdf`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                <FileText className="w-4 h-4" /> Download PDF
              </a>
              <button onClick={() => {
                const w = window.open();
                if(w) w.document.write(`<iframe width='100%' height='100%' style='border:none;margin:0;padding:0' src='${u.resumeUrl}'></iframe><style>body{margin:0}</style>`);
              }} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
                <Eye className="w-4 h-4" /> View PDF
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => { updateStatus(viewApplicant._id, 'accepted'); setViewApplicant(null); }} className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center gap-2"><UserCheck className="w-4 h-4" /> Accept</button>
            <button onClick={() => { updateStatus(viewApplicant._id, 'waitlisted'); setViewApplicant(null); }} className="px-6 py-2 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 flex items-center gap-2"><Clock className="w-4 h-4" /> Waitlist</button>
            <button onClick={() => { updateStatus(viewApplicant._id, 'rejected'); setViewApplicant(null); }} className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 flex items-center gap-2"><UserX className="w-4 h-4" /> Reject</button>
          </div>
        </div>
      </div>
    );
  }

  // Applicant List for Selected Job
  if (selectedJob) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => setSelectedJob(null)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 font-medium"><X className="w-4 h-4" /> Back to Dashboard</button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedJob.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{selectedJob.company} • {selectedJob.location}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['', 'pending', 'accepted', 'rejected', 'waitlisted'].map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); fetchApplicants(selectedJob._id, s); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#161b22] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                {s || 'All'} {s === '' ? `(${selectedJob.counts?.total || 0})` : `(${(selectedJob.counts as any)?.[s] || 0})`}
              </button>
            ))}
          </div>
        </div>

        {appLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No applicants {statusFilter ? `with status "${statusFilter}"` : 'yet'}</div>
        ) : (
          <div className="space-y-3">
            {applicants.map(app => (
              <div key={app._id} className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 shrink-0">{app.user.name.charAt(0)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{app.user.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{app.user.headline || app.user.email}</p>
                    {app.user.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">{app.user.skills.slice(0, 4).map(s => <span key={s} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-[10px]">{s}</span>)}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${app.matchScore >= 70 ? 'bg-green-50 text-green-700' : app.matchScore >= 40 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>{app.matchScore}%</div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${app.status === 'accepted' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : app.status === 'waitlisted' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{app.status}</span>
                  <span className="text-xs text-gray-400">{app.appliedVia}</span>
                  <button onClick={() => setViewApplicant(app)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> View</button>
                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(app._id, 'accepted')} className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-medium hover:bg-green-100">✓</button>
                      <button onClick={() => updateStatus(app._id, 'rejected')} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100">✗</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruiter Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage jobs, applicants, and find candidates</p>
        </div>
        <button onClick={() => setShowPostModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"><Plus className="w-5 h-5" /> Post New Job</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Jobs', value: jobs.filter(j => j.status === 'active').length, icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
          { label: 'Total Applicants', value: totalApplicants, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
          { label: 'Accepted', value: totalAccepted, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
          { label: 'Total Jobs', value: jobs.length, icon: FileText, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#161b22] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p>
              {loading ? <div className="h-6 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mt-1"></div> : <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Search Candidates */}
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6" ref={searchRef}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🔍 Search Candidates</h2>
            <div className="flex flex-col gap-4 relative">
              <div className="flex gap-2">
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Name, skills, or location..." className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-blue-500 shadow-sm" />
                <button onClick={handleSearch} disabled={searching} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none">
                  {searching ? <Loader2 className="w-5 h-5 animate-spin"/> : <Search className="w-5 h-5" />} Search
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span>Exp:</span>
                  <input type="number" min="0" placeholder="Min" value={minExp} onChange={e => setMinExp(e.target.value)} className="w-16 px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg" />
                  <span>-</span>
                  <input type="number" min="0" placeholder="Max" value={maxExp} onChange={e => setMaxExp(e.target.value)} className="w-16 px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg" />
                  <span>Years</span>
                </div>
              </div>
              
              {/* Instagram style dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-[400px] overflow-y-auto">
                  <div className="p-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search Results ({searchResults.length})</span>
                    <button onClick={() => setSearchResults([])} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4"/></button>
                  </div>
                  {searchResults.map((c: any) => (
                    <div key={c._id} 
                         onClick={() => { setViewApplicant({ _id: '', matchScore: c.matchScore || 0, appliedVia: 'Direct Search', status: 'none', createdAt: new Date().toISOString(), user: c }); setSearchResults([]); }}
                         className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                          {c.profilePicUrl ? <img src={c.profilePicUrl} alt="Profile" className="w-full h-full object-cover rounded-full" /> : c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-2">{c.name} {c.matchScore !== undefined && <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold">{c.matchScore}% Match</span>}</p>
                          <p className="text-sm text-gray-500">{c.headline || c.email}</p>
                          {c.skills?.length > 0 && <div className="flex gap-1 mt-1.5 flex-wrap">{c.skills.slice(0, 4).map((s: string) => <span key={s} className="px-1.5 py-0.5 bg-white border border-blue-100 text-blue-700 rounded text-[10px] font-medium shadow-sm">{s}</span>)}</div>}
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:text-right flex items-center sm:block gap-3">
                        <span className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline"><Eye className="w-4 h-4"/> View Profile</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Jobs */}
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Job Postings</h2>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>
            ) : jobs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No jobs posted yet. Click "Post New Job" to get started.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div key={job._id} onClick={() => selectJob(job)} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-100 dark:hover:border-blue-800 transition-colors cursor-pointer relative group">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{job.company} • {job.location}</p>
                      {job.skills?.length > 0 && <div className="flex gap-1 mt-1">{job.skills.slice(0, 3).map(s => <span key={s} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[10px]">{s}</span>)}</div>}
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); toggleJobStatus(job._id, job.status); }} className={`px-2 py-1 rounded text-xs font-medium ${job.status === 'active' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                          {job.status === 'active' ? 'Pause' : 'Enable'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteJobHandler(job._id); }} className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">
                          Delete
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white leading-none">{job.counts?.total || 0}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">applicants</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${job.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{job.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <TrendingUp className="w-6 h-6 text-indigo-200 mb-2" />
            <h3 className="font-bold mb-2">Auto-Apply Active</h3>
            <p className="text-sm text-indigo-100 leading-relaxed">When you post a job, candidates with matching skills and auto-apply ON are automatically applied. Check applicants for each job.</p>
          </div>
        </div>
      </div>

      {/* Post Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#161b22] rounded-t-2xl z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Post a New Job</h3>
              <button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handlePostJob} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label><input required value={jobForm.title} onChange={(e) => setJobForm({...jobForm, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Senior React Developer" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label><input disabled value="From Profile" className="w-full px-4 py-2 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 dark:text-gray-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label><input required value={jobForm.location} onChange={(e) => setJobForm({...jobForm, location: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Mode</label><select value={jobForm.workMode} onChange={(e) => setJobForm({...jobForm, workMode: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161b22] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"><option>Remote</option><option>Hybrid</option><option>On-site</option></select></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience</label>
                  <select value={jobForm.experience} onChange={(e) => setJobForm({...jobForm, experience: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161b22] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {['Fresher', '0-1', '1+', '1-2', '2+', '2-3', '3+', '3-4', '4+', '4-5', '5+', '5-6', '6+', '7+', '8+', '9+', '10+', '12+', '15+'].map(exp => <option key={exp} value={exp}>{exp} Yrs</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary *</label><input required value={jobForm.salary} onChange={(e) => setJobForm({...jobForm, salary: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 20-30 LPA" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label><select value={jobForm.category} onChange={(e) => setJobForm({...jobForm, category: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161b22] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="IT">IT Category</option><option value="Non-IT">Non-IT Category</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Auto Apply Limit (min 6)</label><input type="number" min="6" value={jobForm.autoApplyLimit} onChange={(e) => setJobForm({...jobForm, autoApplyLimit: parseInt(e.target.value) || 6})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manual Limit (min 6)</label><input type="number" min="6" value={jobForm.manualApplyLimit} onChange={(e) => setJobForm({...jobForm, manualApplyLimit: parseInt(e.target.value) || 6})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills *</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {jobForm.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium flex items-center gap-1">
                      {skill} <button type="button" onClick={() => removeSkill(skill)} className="text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-300"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="relative" ref={skillRef}>
                  <input
                    value={skillSearch}
                    onChange={(e) => { setSkillSearch(e.target.value); setShowSkillDropdown(true); }}
                    onFocus={() => setShowSkillDropdown(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillSearch); } }}
                    placeholder="Search and add skills..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {showSkillDropdown && filteredSkills.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredSkills.map(s => (
                        <button type="button" key={s} onMouseDown={(e) => { e.preventDefault(); addSkill(s); }} className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements * (comma separated)</label><input required value={jobForm.requirements} onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="3+ years exp, CS degree" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label><textarea required value={jobForm.description} onChange={(e) => setJobForm({...jobForm, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Job description..." /></div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button type="button" onClick={() => setShowPostModal(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-xl shadow-sm">Publish Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
