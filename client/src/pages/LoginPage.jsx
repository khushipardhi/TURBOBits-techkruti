import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockLogin } from '../services/mockApi';
import { useToast } from '../components/common/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const rolePaths = {
    DONOR: '/donor',
    RECEIVER: '/ngo',
    VOLUNTEER: '/volunteer',
    ADMIN: '/admin',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return addToast('Please enter your email', 'error');
    setLoading(true);
    try {
      const { user, token } = await mockLogin(email, password);
      login(user, token);
      addToast(`Welcome back, ${user.name}!`, 'success');
      navigate(rolePaths[user.role] || '/');
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email) => {
    setEmail(email);
    setLoading(true);
    try {
      const { user, token } = await mockLogin(email, '');
      login(user, token);
      addToast(`Logged in as ${user.name}`, 'success');
      navigate(rolePaths[user.role] || '/');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 global-grid-bg relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--accent-primary)]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[var(--accent-secondary)]/10 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <span className="font-display font-bold text-2xl tracking-tight text-[var(--text-primary)]">
              Food<span className="gradient-text">Link</span>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-[var(--text-secondary)]">Sign in to continue saving food</p>
        </div>

        <div className="p-8 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white font-semibold shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--accent-primary-rgb),0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[var(--accent-primary)] font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Login Buttons (Demo) */}
        <div className="mt-6 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl">
          <p className="text-xs text-[var(--text-tertiary)] text-center mb-3 font-semibold uppercase tracking-wider">
            Quick Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '🏨 Donor', email: 'taj@demo.com' },
              { label: '🏢 NGO', email: 'akshaya@demo.com' },
              { label: '🚗 Volunteer', email: 'rahul@demo.com' },
              { label: '⚙️ Admin', email: 'admin@demo.com' },
            ].map((demo) => (
              <button
                key={demo.email}
                onClick={() => quickLogin(demo.email)}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/30 hover:text-[var(--accent-primary)] transition-all disabled:opacity-50"
              >
                {demo.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
