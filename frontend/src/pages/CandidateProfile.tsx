import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Edit2, MapPin, Briefcase, GraduationCap, Github, Linkedin, Link as LinkIcon, Upload, Save, X, Plus, FileText, Eye } from 'lucide-react';
import { ALL_SKILLS } from '../data/skills';
import api from '../api';
import { useToast } from '../context/ToastContext';

interface ProfileForm {
  name: string;
  headline: string;
  location: string;
  about: string;
  skills: string[];
  experience: any[];
  education: any[];
  projects: any[];
  internships: any[];
  resumeUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  profilePicUrl: string;
  preferredCategory: 'IT' | 'Non-IT' | 'Both';
}

export default function CandidateProfile() {
  const { user, updateUser } = useAuthStore();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<ProfileForm>({
    name: user?.name || '',
    headline: user?.headline || '',
    location: user?.location || '',
    about: user?.about || '',
    skills: user?.skills || [],
    experience: user?.experience || [],
    education: user?.education || [],
    projects: user?.projects || [],
    internships: user?.internships || [],
    resumeUrl: user?.resumeUrl || '',
    githubUrl: user?.githubUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    profilePicUrl: user?.profilePicUrl || '',
    preferredCategory: (user?.preferredCategory || 'Both') as 'IT' | 'Non-IT' | 'Both'
  });
  const [autoApply, setAutoApply] = useState(user?.autoApply ?? true);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        updateUser(data);
        setForm({
          name: data.name || '',
          headline: data.headline || '',
          location: data.location || '',
          about: data.about || '',
          skills: data.skills || [],
          experience: data.experience || [],
          education: data.education || [],
          projects: data.projects || [],
          internships: data.internships || [],
          resumeUrl: data.resumeUrl || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          profilePicUrl: data.profilePicUrl || '',
          preferredCategory: (data.preferredCategory || 'Both') as 'IT' | 'Non-IT' | 'Both',
        });
        setAutoApply(data.autoApply);


      } catch (e) { console.error(e); }
    };
    if (user) fetchProfile();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: any) => {
      if (skillRef.current && !skillRef.current.contains(e.target as Node)) setShowSkillDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSave = async () => {
    // Filter out completely empty entries
    const cleanExp = form.experience.filter(e => e.role?.trim() || e.company?.trim());
    const cleanInt = form.internships.filter(e => e.role?.trim() || e.company?.trim());
    const cleanProj = form.projects.filter(p => p.title?.trim());
    const cleanEdu = form.education.filter(e => e.institution?.trim() || e.degree?.trim());

    setSaving(true);
    try {
      const payload = {
        ...form,
        experience: cleanExp,
        internships: cleanInt,
        projects: cleanProj,
        education: cleanEdu
      };
      const { data } = await api.put('/users/profile', payload);
      updateUser(data);
      setEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = Array.from({ length: 47 }, (_, i) => (2026 - i).toString());

  const handleToggleAutoApply = async () => {
    try {
      const { data } = await api.patch('/users/auto-apply', { autoApply: !autoApply });
      setAutoApply(data.autoApply);
      updateUser({ autoApply: data.autoApply });
      showToast(`Auto-apply ${data.autoApply ? 'enabled' : 'disabled'}`, 'info');
    } catch { showToast('Failed to toggle auto-apply', 'error'); }
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !form.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      setForm({ ...form, skills: [...form.skills, skill.trim()] });
    }
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills.filter(s => s !== skill) });
  };

  const filteredSkills = ALL_SKILLS.filter(
    s => s.toLowerCase().includes(skillSearch.toLowerCase()) && !form.skills.some(existing => existing.toLowerCase() === s.toLowerCase())
  ).slice(0, 15);

  const profileCompletion = user?.profileCompletion || 20;
  const initials = form.name ? form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 w-full"></div>
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 sm:-mt-16 mb-4 sm:mb-0">
            {/* Profile Picture */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full p-1 shadow-md mb-4 sm:mb-0">
              {form.profilePicUrl ? (
                <img src={form.profilePicUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                  {initials}
                </div>
              )}
              {editing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full cursor-pointer" onClick={() => document.getElementById('picUpload')?.click()}>
                  <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">Change</span>
                </div>
              )}
              <input type="file" accept="image/*" id="picUpload" className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setForm({ ...form, profilePicUrl: reader.result as string });
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="flex-1 sm:flex-none px-4 py-2 bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center gap-2 justify-center"><X className="w-4 h-4" /> Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}</button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"><Edit2 className="w-4 h-4" /> Edit Profile</button>
              )}
            </div>
          </div>
          <div className="mt-2">
            {editing ? (
              <div className="space-y-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="text-2xl font-bold text-gray-900 dark:text-white dark:bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none w-full py-1" placeholder="Your Name" />
                <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className="text-gray-600 text-lg border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full py-1" placeholder="Headline" />
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="text-sm text-gray-500 border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full py-1" placeholder="Location" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{form.name}</h1>
                <p className="text-gray-600 text-lg mt-1">{form.headline || 'Add a headline'}</p>
                {form.location && <div className="flex items-center gap-1 mt-4 text-sm text-gray-500"><MapPin className="w-4 h-4" /> {form.location}</div>}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About</h2>
            {editing ? (
              <div className="space-y-1">
                <textarea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} maxLength={1000} rows={4} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600" placeholder="Tell recruiters about yourself..." />
                <p className="text-right text-[10px] text-gray-400 font-medium">{form.about.length}/1000 characters</p>
              </div>
            ) : (
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{form.about || 'Click Edit Profile to add about section.'}</p>
            )}
          </div>

          {/* Experience */}
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Experience</h2>
              {editing && <button onClick={() => setForm({ ...form, experience: [...form.experience, { role: '', company: '', startMonth: 'Jan', startYear: '2024', endMonth: 'Present', endYear: 'Present', description: '' }] })} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>}
            </div>
            {form.experience.length === 0 && !editing && <p className="text-gray-500 text-sm">No experience added yet.</p>}
            {form.experience.map((exp, i) => (
              <div key={i} className="flex gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0"><Briefcase className="w-6 h-6 text-gray-400" /></div>
                {editing ? (
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Role</label><input value={exp.role} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], role: e.target.value }; setForm({ ...form, experience: u }); }} className="w-full border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 font-bold" placeholder="Job Title" /></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Company</label><input value={exp.company} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], company: e.target.value }; setForm({ ...form, experience: u }); }} className="w-full border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 text-sm text-blue-600" placeholder="Company" /></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Start</label><select value={exp.startMonth} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], startMonth: e.target.value }; setForm({ ...form, experience: u }); }} className="w-full text-xs border-b border-gray-200 bg-transparent">{months.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Year</label><select value={exp.startYear} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], startYear: e.target.value }; setForm({ ...form, experience: u }); }} className="w-full text-xs border-b border-gray-200 bg-transparent">{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">End</label><select value={exp.endMonth} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], endMonth: e.target.value }; setForm({ ...form, experience: u }); }} className="w-full text-xs border-b border-gray-200 bg-transparent"><option value="Present">Present</option>{months.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Year</label><select value={exp.endYear} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], endYear: e.target.value }; setForm({ ...form, experience: u }); }} className="w-full text-xs border-b border-gray-200 bg-transparent"><option value="Present">Present</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                    </div>
                    <div className="space-y-1">
                      <textarea value={exp.description} maxLength={500} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], description: e.target.value }; setForm({ ...form, experience: u }); }} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Description" />
                      <p className="text-right text-[10px] text-gray-400 font-medium">{(exp.description || '').length}/500</p>
                    </div>
                    <button onClick={() => setForm({ ...form, experience: form.experience.filter((_, idx) => idx !== i) })} className="text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">Remove</button>
                  </div>
                ) : (
                  <div><h3 className="font-bold text-gray-900 dark:text-white">{exp.role}</h3><p className="text-sm font-medium text-blue-600 dark:text-blue-400">{exp.company}</p><p className="text-xs text-gray-500 mt-1 mb-2">{exp.startMonth} {exp.startYear} - {exp.endMonth === 'Present' ? 'Present' : `${exp.endMonth} ${exp.endYear}`}</p><p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{exp.description}</p></div>
                )}
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Education</h2>
              {editing && <button onClick={() => setForm({ ...form, education: [...form.education, { degree: '', institution: '', year: '2024' }] })} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>}
            </div>
            {form.education.length === 0 && !editing && <p className="text-gray-500 text-sm">No education added yet.</p>}
            {form.education.map((edu, i) => (
              <div key={i} className="flex gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0"><GraduationCap className="w-6 h-6 text-gray-400" /></div>
                {editing ? (
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Institution</label><input value={edu.institution} onChange={(e) => { const u = [...form.education]; u[i] = { ...u[i], institution: e.target.value }; setForm({ ...form, education: u }); }} className="w-full border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 font-bold" placeholder="Institution" /></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Degree</label><input value={edu.degree} onChange={(e) => { const u = [...form.education]; u[i] = { ...u[i], degree: e.target.value }; setForm({ ...form, education: u }); }} className="w-full border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 text-sm" placeholder="Degree" /></div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Year</label>
                      <select value={edu.year} onChange={(e) => { const u = [...form.education]; u[i] = { ...u[i], year: e.target.value }; setForm({ ...form, education: u }); }} className="w-full text-xs border-b border-gray-200 bg-transparent">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                    </div>
                    <button onClick={() => setForm({ ...form, education: form.education.filter((_, idx) => idx !== i) })} className="text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">Remove</button>
                  </div>
                ) : (
                  <div><h3 className="font-bold text-gray-900 dark:text-white">{edu.institution}</h3><p className="text-sm font-medium text-gray-700 dark:text-gray-300">{edu.degree}</p><p className="text-xs text-gray-500 mt-1">{edu.year}</p></div>
                )}
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Projects</h2>
              {editing && <button onClick={() => setForm({ ...form, projects: [...form.projects, { title: '', link: '', description: '' }] })} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>}
            </div>
            {form.projects.length === 0 && !editing && <p className="text-gray-500 text-sm italic">Optional: Add your projects to boost profile score.</p>}
            {form.projects.map((proj, i) => (
              <div key={i} className="flex gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0"><LinkIcon className="w-6 h-6 text-gray-400" /></div>
                {editing ? (
                  <div className="flex-1 space-y-2">
                    <input value={proj.title} onChange={(e) => { const u = [...form.projects]; u[i] = { ...u[i], title: e.target.value }; setForm({ ...form, projects: u }); }} className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none py-1 font-bold" placeholder="Project Title" />
                    <input value={proj.link} onChange={(e) => { const u = [...form.projects]; u[i] = { ...u[i], link: e.target.value }; setForm({ ...form, projects: u }); }} className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none py-1 text-sm text-blue-600" placeholder="Project Link" />
                    <textarea value={proj.description} onChange={(e) => { const u = [...form.projects]; u[i] = { ...u[i], description: e.target.value }; setForm({ ...form, projects: u }); }} className="w-full border border-gray-300 rounded p-2 text-sm" rows={2} placeholder="Description" />
                    <button onClick={() => setForm({ ...form, projects: form.projects.filter((_, idx) => idx !== i) })} className="text-red-500 text-xs hover:underline">Remove</button>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{proj.title}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">{proj.link}</a>}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{proj.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Internships */}
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Internships</h2>
              {editing && <button onClick={() => setForm({ ...form, internships: [...form.internships, { role: '', company: '', startMonth: 'Jan', startYear: '2024', endMonth: 'Present', endYear: 'Present', description: '' }] })} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>}
            </div>
            {form.internships.length === 0 && !editing && <p className="text-gray-500 text-sm italic">Optional: Add your internships to boost profile score.</p>}
            {form.internships.map((intern, i) => (
              <div key={i} className="flex gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0"><Briefcase className="w-6 h-6 text-gray-400" /></div>
                {editing ? (
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Role</label><input value={intern.role} onChange={(e) => { const u = [...form.internships]; u[i] = { ...u[i], role: e.target.value }; setForm({ ...form, internships: u }); }} className="w-full border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 font-bold" placeholder="Internship Role" /></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Company</label><input value={intern.company} onChange={(e) => { const u = [...form.internships]; u[i] = { ...u[i], company: e.target.value }; setForm({ ...form, internships: u }); }} className="w-full border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 text-sm text-blue-600" placeholder="Company" /></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Start</label><select value={intern.startMonth} onChange={(e) => { const u = [...form.internships]; u[i] = { ...u[i], startMonth: e.target.value }; setForm({ ...form, internships: u }); }} className="w-full text-xs border-b border-gray-200 bg-transparent">{months.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Year</label><select value={intern.startYear} onChange={(e) => { const u = [...form.internships]; u[i] = { ...u[i], startYear: e.target.value }; setForm({ ...form, internships: u }); }} className="w-full text-xs border-b border-gray-200 bg-transparent">{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">End</label><select value={intern.endMonth} onChange={(e) => { const u = [...form.internships]; u[i] = { ...u[i], endMonth: e.target.value }; setForm({ ...form, internships: u }); }} className="w-full text-xs border-b border-gray-200 bg-transparent"><option value="Present">Present</option>{months.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Year</label><select value={intern.endYear} onChange={(e) => { const u = [...form.internships]; u[i] = { ...u[i], endYear: e.target.value }; setForm({ ...form, internships: u }); }} className="w-full text-xs border-b border-gray-200 bg-transparent"><option value="Present">Present</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                    </div>
                    <div className="space-y-1">
                      <textarea value={intern.description} maxLength={500} onChange={(e) => { const u = [...form.internships]; u[i] = { ...u[i], description: e.target.value }; setForm({ ...form, internships: u }); }} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Description" />
                      <p className="text-right text-[10px] text-gray-400 font-medium">{(intern.description || '').length}/500</p>
                    </div>
                    <button onClick={() => setForm({ ...form, internships: form.internships.filter((_, idx) => idx !== i) })} className="text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">Remove</button>
                  </div>
                ) : (
                  <div><h3 className="font-bold text-gray-900 dark:text-white">{intern.role}</h3><p className="text-sm font-medium text-blue-600 dark:text-blue-400">{intern.company}</p><p className="text-xs text-gray-500 mt-1 mb-2">{intern.startMonth} {intern.startYear} - {intern.endMonth === 'Present' ? 'Present' : `${intern.endMonth} ${intern.endYear}`}</p><p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{intern.description}</p></div>
                )}
              </div>
            ))}
          </div>


        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Profile Completion</h3>
            <div className="flex justify-between text-sm mb-2 mt-4"><span className="font-medium text-gray-700">{profileCompletion}% Complete</span></div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }}></div>
            </div>
            <div className="space-y-4">
              {/* Numeric Experience is removed as requested */}
            </div>
          </div>

          {/* Preferred Category */}
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Job Preference</h3>
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Preferred Category</label>
              <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
                {['IT', 'Non-IT', 'Both'].map(cat => (
                  <button
                    key={cat}
                    onClick={async () => {
                      setForm({ ...form, preferredCategory: cat as any });
                      try {
                        const { data } = await api.put('/users/profile', { preferredCategory: cat });
                        updateUser(data);
                        showToast(`Preference set to ${cat}`, 'success');
                      } catch { showToast('Failed to update preference', 'error'); }
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${form.preferredCategory === cat ? 'bg-white dark:bg-[#161b22] shadow-sm text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">We'll prioritize jobs in this category on your feed.</p>
            </div>
          </div>

          {/* Auto Apply Toggle */}
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Auto Apply</h3>
              <button onClick={handleToggleAutoApply} className={`relative w-12 h-6 rounded-full transition-colors ${autoApply ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoApply ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </button>
            </div>
            <p className="text-sm text-gray-500">{autoApply ? 'ON — We auto-apply to matching jobs for you.' : 'OFF — Manual apply only.'}</p>
          </div>

          {/* Skills with Dropdown */}
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.skills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex items-center gap-1">
                  {skill}
                  {editing && <button onClick={() => removeSkill(skill)} className="text-red-400 hover:text-red-600 ml-1"><X className="w-3 h-3" /></button>}
                </span>
              ))}
              {form.skills.length === 0 && <p className="text-sm text-gray-400">No skills added</p>}
            </div>
            {editing && (
              <div className="relative" ref={skillRef}>
                <input
                  value={skillSearch}
                  onChange={(e) => { setSkillSearch(e.target.value); setShowSkillDropdown(true); }}
                  onFocus={() => setShowSkillDropdown(true)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && skillSearch.trim()) { addSkill(skillSearch); } }}
                  placeholder="Search and add skills..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showSkillDropdown && filteredSkills.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredSkills.map(s => (
                      <button key={s} onClick={() => addSkill(s)} className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors">{s}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resume & Links */}
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resume & Links</h3>
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Resume (PDF)</label>
                  <input type="file" accept="application/pdf" className="w-full" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setForm({ ...form, resumeUrl: reader.result as string });
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Resume URL (optional)</label>
                  <input value={form.resumeUrl && !form.resumeUrl.startsWith('data:') ? form.resumeUrl : ''}
                    onChange={e => setForm({ ...form, resumeUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="https://drive.google.com/..." />
                </div>
                <div><label className="text-xs font-medium text-gray-500 mb-1 block">GitHub</label><input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="https://github.com/..." /></div>
                <div><label className="text-xs font-medium text-gray-500 mb-1 block">LinkedIn</label><input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="https://linkedin.com/in/..." /></div>
                <div><label className="text-xs font-medium text-gray-500 mb-1 block">Portfolio</label><input value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="https://yoursite.com" /></div>
              </div>
            ) : (
              <div className="space-y-3">
                {form.resumeUrl ? (
                  <div className="flex gap-2">
                    <a href={form.resumeUrl} download={`${form.name.replace(/\s+/g, '_')}_Resume.pdf`} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors border border-blue-100">
                      <FileText className="w-5 h-5" /> Download PDF
                    </a>
                    <button type="button" onClick={() => {
                      const w = window.open();
                      if (w) w.document.write(`<iframe width='100%' height='100%' style='border:none;margin:0;padding:0' src='${form.resumeUrl}'></iframe><style>body{margin:0}</style>`);
                    }} className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-100">
                      <Eye className="w-5 h-5" /> View PDF
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-500">Click Edit to add resume URL</p>
                  </div>
                )}
                {form.githubUrl && <a href={form.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"><Github className="w-5 h-5" /> GitHub</a>}
                {form.linkedinUrl && <a href={form.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"><Linkedin className="w-5 h-5" /> LinkedIn</a>}
                {form.portfolioUrl && <a href={form.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"><LinkIcon className="w-5 h-5" /> Portfolio</a>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
