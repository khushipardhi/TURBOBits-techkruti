import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Hash, Star, Shield, Calendar, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Footer from '../components/common/Footer';
import { API_BASE_URL, getToken } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, token, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) setProfile({ ...user });
  }, [user]);

  if (!profile) return null;

  const roleLabel = { DONOR: 'Donor', RECEIVER: 'NGO / Food Bank', VOLUNTEER: 'Volunteer', ADMIN: 'Admin' };
  const roleEmoji = { DONOR: '🏨', RECEIVER: '🏢', VOLUNTEER: '🚗', ADMIN: '⚙️' };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: profile.name,
          address: profile.address,
          pin_code: profile.pin_code,
        }),
      });
      if (res.ok) {
        addToast('Profile updated successfully!', 'success');
        refreshProfile();
      } else {
        const data = await res.json();
        addToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      addToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const memberSince = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] global-grid-bg pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="p-8 rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[var(--accent-primary)]/10 blur-[100px] rounded-full" />
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-3xl shadow-lg">
                {roleEmoji[profile.role] || '👤'}
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-1">{profile.name}</h1>
                <p className="text-[var(--text-secondary)] text-sm mb-3">{roleLabel[profile.role]}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    Trust Score: {Number(profile.trust_score || 5).toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    Since {memberSince}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="p-8 rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl space-y-5">
            <h2 className="text-lg font-display font-bold text-[var(--text-primary)] mb-2">Profile Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input value={profile.name || ''} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full pl-10 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input value={profile.email || ''} disabled className="w-full pl-10 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-tertiary)] opacity-60 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input value={profile.phone || ''} disabled className="w-full pl-10 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-tertiary)] opacity-60 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5">PIN Code</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input value={profile.pin_code || ''} onChange={(e) => setProfile(p => ({ ...p, pin_code: e.target.value.replace(/\D/g, '').slice(0, 6) }))} maxLength={6} className="w-full pl-10 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-[var(--text-tertiary)]" />
                <textarea value={profile.address || ''} onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))} rows={2} className="w-full pl-10 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all resize-none" />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[var(--accent-primary)] text-white font-semibold shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--accent-primary-rgb),0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
          </div>
        </motion.div>
      </div>
      <div className="mt-12"><Footer /></div>
    </div>
  );
}
