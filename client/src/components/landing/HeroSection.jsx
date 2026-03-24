import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[var(--accent-primary)] opacity-20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[var(--accent-secondary)]/10 blur-[120px] rounded-full opacity-30 dark:opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[var(--accent-primary)]/10 blur-[100px] rounded-full opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        {/* Sub-badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Saving 1,247+ meals this month
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight text-[var(--text-primary)] mb-6 leading-[1.05]"
        >
          Rescue Surplus Food <br className="hidden md:block" />
          Feed{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">
            Communities
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          FoodLink connects restaurants, hotels, and caterers with NGOs and food banks in real-time.
          Post surplus food and get it delivered to those in need — within a 2-hour freshness window.
        </motion.p>

        {/* CTA Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/register"
            className="px-8 py-4 rounded-full text-white font-semibold shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--accent-primary-rgb),0.23)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 bg-[var(--accent-primary)]"
          >
            Start Donating <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/#how-it-works"
            className="px-8 py-4 rounded-full bg-[var(--card-bg)] text-[var(--text-primary)] font-semibold border border-[var(--card-border)] hover:bg-[var(--bg-secondary)] hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" /> See How It Works
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: '1,247+', label: 'Meals Saved' },
            { value: '50+', label: 'Active Donors' },
            { value: '30+', label: 'NGO Partners' },
            { value: '312 kg', label: 'CO₂ Prevented' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
                {stat.value}
              </div>
              <div className="text-sm text-[var(--text-tertiary)] mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
