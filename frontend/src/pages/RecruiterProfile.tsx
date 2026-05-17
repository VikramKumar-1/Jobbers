import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Briefcase, Link as LinkIcon, Globe, Image as ImageIcon, Save, CheckCircle, Star, ArrowLeft, Upload } from 'lucide-react';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function RecruiterProfile() {
  const { user, updateUser } = useAuthStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: user?.companyName || '',
    companyWebsite: user?.companyWebsite || '',
    companyLogo: user?.companyLogo || '',
    companyDescription: user?.companyDescription || '',
    location: user?.location || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data);
      setEditing(false);
      showToast('Company profile updated!', 'success');
    } catch (e: any) { showToast(e.response?.data?.message || 'Failed to save', 'error'); } 
    finally { setSaving(false); }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
        <div className="h-40 bg-gradient-to-r from-blue-700 to-indigo-900 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg p-1 relative group">
              {form.companyLogo ? (
                <img src={form.companyLogo} alt="Logo" className="w-full h-full object-contain rounded-xl" />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              {editing && (
                <button onClick={() => document.getElementById('logoUpload')?.click()} className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </button>
              )}
              <input 
                type="file" 
                id="logoUpload" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setForm({...form, companyLogo: reader.result as string});
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>
          <div className="absolute bottom-4 right-8">
            {editing ? (
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-white text-blue-600 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-all">
                {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl font-bold hover:bg-white/30 transition-all">
                Edit Company Profile
              </button>
            )}
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{form.companyName || 'Set Company Name'}</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-500">
                <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {form.location || 'Location not set'}</span>
                {form.companyWebsite && <a href={form.companyWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><LinkIcon className="w-4 h-4" /> Website</a>}
              </div>
            </div>
            <div className="text-right">
               <div className="flex items-center gap-1 text-yellow-500 font-bold text-xl">
                 <Star className="w-6 h-6 fill-current" /> {user.companyRating || '0.0'}
               </div>
               <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{user.companyReviewCount || 0} Reviews</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">About Company</h3>
                {editing ? (
                  <div className="space-y-1">
                    <textarea 
                      value={form.companyDescription} 
                      onChange={e => setForm({...form, companyDescription: e.target.value})} 
                      maxLength={1500}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 min-h-[150px]" 
                      placeholder="Describe your company..." 
                    />
                    <p className="text-right text-[10px] text-gray-400 font-medium">{form.companyDescription.length}/1500 characters</p>
                  </div>
                ) : (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{form.companyDescription || 'No description provided.'}</p>
                )}
              </div>
            </div>

            {editing && (
              <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Edit Details</h3>
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">Company Name *</label><input value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">Location *</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">Website URL</label><input value={form.companyWebsite} onChange={e => setForm({...form, companyWebsite: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" /></div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-xs text-blue-700 leading-tight flex items-start gap-2"><CheckCircle className="w-4 h-4 shrink-0" /> Professional company details help in attracting better candidates and increasing your trust score.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
