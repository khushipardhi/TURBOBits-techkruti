import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Menu, X, LogOut, ChevronDown } from 'lucide-react';

const publicLinks = [
  { name: 'Home', path: '/' },
  { name: 'How It Works', path: '/#how-it-works' },
  { name: 'Features', path: '/#features' },
];

const roleLabels = {
  DONOR: 'Donor Dashboard',
  RECEIVER: 'NGO Dashboard',
  VOLUNTEER: 'Volunteer Dashboard',
  ADMIN: 'Admin Dashboard',
};

const rolePaths = {
  DONOR: '/donor',
  RECEIVER: '/ngo',
  VOLUNTEER: '/volunteer',
  ADMIN: '/admin',
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = isAuthenticated
    ? [{ name: roleLabels[user?.role] || 'Dashboard', path: rolePaths[user?.role] || '/donor' }]
    : publicLinks;

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent',
        isScrolled
          ? 'bg-[var(--bg-primary)]/40 backdrop-blur-md border-b-[1px] border-[var(--border-color)]/50 py-3 shadow-sm'
          : 'bg-transparent py-5 border-b-[1px] border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-row items-center justify-between">
        {/* Logo */}
        <Link to="/" className="inline-block transition-opacity hover:opacity-90">
          <div className="font-display font-bold text-xl tracking-tight text-[var(--text-primary)]">
            Food<span className="gradient-text">Link</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group',
                  isActive
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <span className="relative z-10">{link.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 rounded-full z-0"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="absolute inset-x-4 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-primary)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 shadow-[0_2px_10px_var(--accent-primary)] pointer-events-none rounded-full" />
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] transition-all duration-300"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)]">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-[var(--card-bg)] text-[var(--text-primary)] font-medium border border-[var(--card-border)] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all duration-300 flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-5 py-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-sm transition-all duration-300"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-full text-white font-semibold shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--accent-primary-rgb),0.23)] hover:-translate-y-0.5 transition-all flex items-center gap-2 bg-[var(--accent-primary)] text-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[var(--text-primary)]"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--bg-primary)]/90 backdrop-blur-xl border-t border-[var(--border-color)]"
          >
            <div className="px-6 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-color)]">
                <button onClick={toggleTheme} className="p-2 text-[var(--text-secondary)]">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="text-red-500 text-sm font-medium">
                    Logout
                  </button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-[var(--text-secondary)]">Sign In</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-full bg-[var(--accent-primary)] text-white text-sm font-semibold">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
