import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Briefcase, LogOut, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 sticky top-0 z-[100] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-xl text-gray-900 dark:text-white tracking-tighter">Jobber<span className="text-blue-600">Naukari</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {user ? (
              <>
                <div className="flex items-center gap-3 sm:gap-4 mr-1 sm:mr-2">
                  {user.role === 'candidate' && (
                    <Link to="/applications" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5" title="Applications">
                      <Briefcase className="w-4 h-4 sm:w-3.5 sm:h-3.5"/> <span className="hidden sm:inline">Applications</span>
                    </Link>
                  )}
                  {user.role === 'recruiter' && (
                    <Link to="/recruiter/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5" title="Dashboard">
                      <LayoutDashboard className="w-4 h-4 sm:w-3.5 sm:h-3.5"/> <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                  )}
                </div>

                <Link to={user.role === 'recruiter' ? '/recruiter/profile' : '/profile'} className="flex items-center gap-2.5 p-1 pr-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    {user.role === 'candidate' && (
                      <svg className="absolute w-10 h-10 transform -rotate-90 scale-110">
                        <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                        <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray={`${(user.profileCompletion / 100) * 107} 107`} className="text-blue-600 transition-all duration-1000" />
                      </svg>
                    )}
                    <div className="w-7 h-7 rounded-lg overflow-hidden shadow-sm relative z-10 border-2 border-white dark:border-gray-800">
                      {user.profilePicUrl || user.companyLogo ? (
                        <img src={user.profilePicUrl || user.companyLogo} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col leading-tight">
                    <span className="font-bold text-gray-900 dark:text-white text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</span>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">{user.role}</span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-sm px-3 py-2 transition-all">
                  Sign In
                </Link>
                <Link to="/register?role=recruiter" className="bg-gray-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-lg">
                  Post Job
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
