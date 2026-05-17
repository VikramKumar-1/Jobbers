import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Briefcase, Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';
import api from '../api';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [role, setRole] = useState<'candidate' | 'recruiter'>(
    searchParams.get('role') === 'recruiter' ? 'recruiter' : 'candidate'
  );

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'recruiter') setRole('recruiter');
    else if (r === 'candidate') setRole('candidate');
  }, [searchParams]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'recruiter' && !companyName) {
      return showToast('Company Name is mandatory for recruiters', 'error');
    }
    try {
      await api.post('/auth/register', { name, email, password, role, companyName });
      showToast('Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-gray-50 dark:bg-[#0f1117] relative overflow-hidden transition-colors">
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-60"></div>

      <div className={`w-full space-y-6 bg-white/80 dark:bg-[#161b22]/90 backdrop-blur-xl p-5 sm:p-8 rounded-[32px] shadow-2xl border border-white dark:border-gray-800 relative z-10 transition-all duration-350 ${role === 'recruiter' ? 'max-w-xl' : 'max-w-md'}`}>
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30 mb-4">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Join the <span className="text-blue-600">Future.</span>
          </h2>
          <p className="mt-1.5 text-gray-500 dark:text-gray-400 text-sm font-medium">
            Find your dream career or hire top talent today.
          </p>
          {role === 'recruiter' && (
            <div className="mt-3.5 p-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/10 dark:to-indigo-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded-xl text-center animate-slide-in">
              <div className="flex flex-wrap justify-center gap-1.5 text-[9px] font-black text-blue-600 dark:text-blue-400">
                <span className="px-2 py-0.5 bg-white dark:bg-[#161b22] border border-blue-100/30 dark:border-blue-900/30 rounded-full shadow-sm">✓ 100% Free Postings</span>
                <span className="px-2 py-0.5 bg-white dark:bg-[#161b22] border border-blue-100/30 dark:border-blue-900/30 rounded-full shadow-sm">✓ Smart Matching</span>
                <span className="px-2 py-0.5 bg-white dark:bg-[#161b22] border border-blue-100/30 dark:border-blue-900/30 rounded-full shadow-sm">✓ Candidate Tracking</span>
              </div>
            </div>
          )}
        </div>

        {!searchParams.get('role') && (
          <div className="flex bg-gray-100/50 dark:bg-gray-800 p-1 rounded-xl">
            <button
              className={`flex-1 py-2.5 text-sm font-black rounded-lg transition-all duration-300 ${role === 'candidate' ? 'bg-white dark:bg-[#161b22] shadow-sm text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setRole('candidate')}
            >Candidate</button>
            <button
              className={`flex-1 py-2.5 text-sm font-black rounded-lg transition-all duration-300 ${role === 'recruiter' ? 'bg-white dark:bg-[#161b22] shadow-sm text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setRole('recruiter')}
            >Recruiter</button>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className={`grid gap-3 ${role === 'recruiter' ? 'sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3' : 'grid-cols-1'}`}>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#0f1117] border border-gray-100 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#161b22] transition-all font-medium text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Email address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#0f1117] border border-gray-100 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#161b22] transition-all font-medium text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#0f1117] border border-gray-100 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#161b22] transition-all font-medium text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {role === 'recruiter' && (
              <div className="animate-slide-in">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Company Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input type="text" required={role === 'recruiter'} value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#0f1117] border border-gray-100 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#161b22] transition-all font-medium text-sm"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
              </div>
            )}
          </div>

          <button type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-xl shadow-blue-100 dark:shadow-blue-900/20 items-center gap-2"
          >Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/></button>

          <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
