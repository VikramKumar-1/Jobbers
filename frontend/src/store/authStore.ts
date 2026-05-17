import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'candidate' | 'recruiter' | 'admin';

interface Experience {
  role: string;
  company: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  headline: string;
  location: string;
  about: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: any[];
  internships: any[];
  resumeUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  profilePicUrl: string;
  autoApply: boolean;
  manualApplyLimit: number;
  profileCompletion: number;
  companyName: string;
  companyLogo: string;
  companyWebsite: string;
  companyDescription: string;
  companyRating: number;
  companyReviewCount: number;
  preferredCategory: 'IT' | 'Non-IT' | 'Both';
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'jobbernaukari-auth',
    }
  )
);
