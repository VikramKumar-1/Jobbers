import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Briefcase, Mail, Lock } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#0f1117] transition-colors">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#161b22] p-8 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30 mb-4">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'candidate' ? 'bg-white dark:bg-[#161b22] shadow-sm text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            onClick={() => setRole('candidate')}
          >Candidate</button>
          <button
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'recruiter' ? 'bg-white dark:bg-[#161b22] shadow-sm text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            onClick={() => setRole('recruiter')}
          >Recruiter</button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#0f1117] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#161b22] transition-all text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#0f1117] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#161b22] transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg"
          >Sign in</button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
