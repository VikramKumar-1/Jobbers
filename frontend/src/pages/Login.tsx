import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Briefcase, Mail, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data, data.token);
      showToast('Login successful!', 'success');
      if (data.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Login failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-gray-50 dark:bg-[#0f1117] relative overflow-hidden transition-colors">
      {/* Background Mesh Blurs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-60"></div>

      <div className="max-w-md w-full space-y-6 bg-white/80 dark:bg-[#161b22]/90 backdrop-blur-xl p-5 sm:p-8 rounded-[32px] shadow-2xl border border-white dark:border-gray-800 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30 mb-4">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
            Sign in to your account
          </p>
        </div>

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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
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
          </div>

          <button type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-xl shadow-blue-100 dark:shadow-blue-900/20 items-center gap-2"
          >Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/></button>

          <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
