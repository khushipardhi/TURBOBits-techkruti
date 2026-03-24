import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 global-grid-bg relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[var(--accent-primary)]/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <div className="w-24 h-24 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center mx-auto mb-8">
          <SearchX className="w-12 h-12 text-[var(--text-tertiary)]" />
        </div>
        <h1 className="text-6xl md:text-8xl font-display font-bold text-[var(--text-primary)] tracking-tight mb-4">404</h1>
        <p className="text-lg text-[var(--text-secondary)] mb-8">Page not found. Let's get you back on track.</p>
        <Link
          to="/"
          className="px-8 py-4 rounded-full text-white font-semibold bg-[var(--accent-primary)] shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--accent-primary-rgb),0.23)] hover:-translate-y-1 transition-all inline-flex items-center gap-2"
        >
          <Home className="w-5 h-5" /> Go Home
        </Link>
      </motion.div>
    </div>
  );
}
