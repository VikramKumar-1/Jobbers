import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Briefcase, Clock, UserCheck, UserX, CheckCircle, Search } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import Skeleton from '../components/Skeleton';

export default function MyApplications() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/applications/my');
        setApplications(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchApps();
  }, [user]);

  const filteredApps = filter ? applications.filter(a => a.status === filter) : applications;

  const stats = {
    total: applications.length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    waitlisted: applications.filter(a => a.status === 'waitlisted').length,
    pending: applications.filter(a => a.status === 'pending').length,
    autoApplied: applications.filter(a => a.appliedVia === 'auto').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Applications</h1>
        <p className="text-gray-600 dark:text-gray-400">Track all your applied jobs, statuses, and auto-applications in one place.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div onClick={() => setFilter('')} className={`p-4 rounded-xl border cursor-pointer transition-colors ${filter === '' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-[#161b22] border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total</p>
          {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>}
        </div>
        <div onClick={() => setFilter('accepted')} className={`p-4 rounded-xl border cursor-pointer transition-colors ${filter === 'accepted' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' : 'bg-white dark:bg-[#161b22] border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
          <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Accepted</p>
          {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.accepted}</p>}
        </div>
        <div onClick={() => setFilter('pending')} className={`p-4 rounded-xl border cursor-pointer transition-colors ${filter === 'pending' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-[#161b22] border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Pending</p>
          {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>}
        </div>
        <div onClick={() => setFilter('waitlisted')} className={`p-4 rounded-xl border cursor-pointer transition-colors ${filter === 'waitlisted' ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800' : 'bg-white dark:bg-[#161b22] border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
          <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase">Waitlisted</p>
          {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.waitlisted}</p>}
        </div>
        <div onClick={() => setFilter('rejected')} className={`p-4 rounded-xl border cursor-pointer transition-colors ${filter === 'rejected' ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' : 'bg-white dark:bg-[#161b22] border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
          <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Rejected</p>
          {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p>}
        </div>
        <div className="p-4 rounded-xl border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800/30">
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Auto Applied</p>
          {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.autoApplied}</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">Loading your applications...</div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">No applications found</p>
            <p className="text-sm mt-1">You haven't applied to any jobs yet{filter ? ` with status "${filter}"` : ''}.</p>
            <Link to="/" className="inline-block mt-4 text-blue-600 dark:text-blue-400 font-medium hover:underline">Browse Jobs</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredApps.map((app) => (
              <div key={app._id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{app.job?.title || 'Unknown Job'}</h3>
                    {app.appliedVia === 'auto' && <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-[10px] font-bold uppercase tracking-wide">Auto-Applied</span>}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">{app.job?.company}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
                    <span className="flex items-center gap-1"><Search className="w-3.5 h-3.5" /> {app.job?.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5
                    ${app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      app.status === 'waitlisted' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'}`}>
                    {app.status === 'accepted' && <UserCheck className="w-3.5 h-3.5" />}
                    {app.status === 'rejected' && <UserX className="w-3.5 h-3.5" />}
                    {app.status === 'waitlisted' && <Clock className="w-3.5 h-3.5" />}
                    {app.status === 'pending' && <CheckCircle className="w-3.5 h-3.5" />}
                    {app.status}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded bg-gray-50 border ${app.matchScore >= 70 ? 'text-green-600 border-green-100 bg-green-50' : app.matchScore >= 40 ? 'text-yellow-600 border-yellow-100 bg-yellow-50' : 'text-red-600 border-red-100 bg-red-50'}`}>
                    {app.matchScore}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
