import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Dynamic lazy imports for page components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));
const CandidateProfile = lazy(() => import('./pages/CandidateProfile'));
const RecruiterProfile = lazy(() => import('./pages/RecruiterProfile'));
const MyApplications = lazy(() => import('./pages/MyApplications'));
const CompanyDetails = lazy(() => import('./pages/CompanyDetails'));
const JobsList = lazy(() => import('./pages/JobsList'));
const CompanyList = lazy(() => import('./pages/CompanyList'));

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0f1117] transition-colors duration-300">
            <Navbar />
            <main className="flex-grow pb-12">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="w-10 h-10 rounded-full border-4 border-blue-50 dark:border-blue-900/20 border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={
                    user?.role === 'recruiter' ? <Navigate to="/recruiter/dashboard" replace /> : <Home />
                  } />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/jobs/:id" element={<JobDetails />} />
                  <Route path="/company/:id" element={<CompanyDetails />} />
                  <Route path="/profile" element={
                    user?.role === 'candidate' ? <CandidateProfile /> : <Navigate to="/" replace />
                  } />
                  <Route path="/applications" element={
                    user?.role === 'candidate' ? <MyApplications /> : <Navigate to="/" replace />
                  } />
                  <Route path="/recruiter/dashboard" element={
                    user?.role === 'recruiter' ? <RecruiterDashboard /> : <Navigate to="/" replace />
                  } />
                  <Route path="/recruiter/profile" element={
                    user?.role === 'recruiter' ? <RecruiterProfile /> : <Navigate to="/" replace />
                  } />
                  <Route path="/jobs-list" element={<JobsList />} />
                  <Route path="/companies" element={<CompanyList />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

