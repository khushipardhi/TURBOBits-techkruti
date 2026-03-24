import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, MapPin, Building, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockRegister } from '../services/mockApi';
import { useToast } from '../components/common/Toast';
import { ROLES } from '../utils/constants';

const roleOptions = [
  { value: ROLES.DONOR, label: 'Donor', icon: '🏨', desc: 'Restaurant, hotel, or caterer' },
  { value: ROLES.RECEIVER, label: 'NGO / Food Bank', icon: '🏢', desc: 'Receive surplus food' },
  { value: ROLES.VOLUNTEER, label: 'Volunteer', icon: '🚗', desc: 'Deliver food to NGOs' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', address: '', role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const rolePaths = { DONOR: '/donor', RECEIVER: '/ngo', VOLUNTEER: '/volunteer' };

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role) {
      return addToast('Please fill in all required fields', 'error');
    }
    setLoading(true);
    try {
      const { user, token } = await mockRegister(form);
      register(user, token);
      addToast(`Welcome to FoodLink, ${user.name}!`, 'success');
      navigate(rolePaths[user.role] || '/');
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full pl-11 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 global-grid-bg relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--accent-primary)]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-[var(--accent-secondary)]/10 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <span className="font-display font-bold text-2xl tracking-tight text-[var(--text-primary)]">
              Food<span className="gradient-text">Link</span>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight mb-2">
            Join FoodLink
          </h1>
          <p className="text-[var(--text-secondary)]">Create an account to start saving food</p>
        </div>

        <div className="p-8 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl shadow-lg">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">I want to join as</label>
            <div className="grid grid-cols-3 gap-3">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => updateForm('role', role.value)}
                  className={`p-4 rounded-2xl border text-center transition-all duration-300 ${
                    form.role === role.value
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.15)]'
                      : 'border-[var(--card-border)] bg-gray-50 dark:bg-gray-900 hover:border-[var(--accent-primary)]/30'
                  }`}
                >
                  <div className="text-2xl mb-1">{role.icon}</div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">{role.label}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{role.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Your name" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="9876543210" className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="your@email.com" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Password *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateForm('password', e.target.value)} placeholder="Min 6 characters" className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input type="text" value={form.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="Street, City" className={inputClass} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white font-semibold shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--accent-primary-rgb),0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><UserPlus className="w-5 h-5" /> Create Account</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--accent-primary)] font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
