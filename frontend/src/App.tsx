import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobDetails from './pages/JobDetails';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateProfile from './pages/CandidateProfile';
import RecruiterProfile from './pages/RecruiterProfile';
import MyApplications from './pages/MyApplications';
import CompanyDetails from './pages/CompanyDetails';
import JobsList from './pages/JobsList';
import CompanyList from './pages/CompanyList';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0f1117] transition-colors duration-300">
            <Navbar />
            <main className="flex-grow pb-12">
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
            </main>
          </div>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
