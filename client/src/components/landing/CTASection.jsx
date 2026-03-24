import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-transparent relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-primary)]/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl mb-8">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Join the movement against food waste
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-[var(--text-primary)] mb-6 leading-[1.1]">
            Every Meal Rescued Is a{' '}
            <span className="gradient-text">Life Touched</span>
          </h2>

          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
            Whether you're a restaurant with leftover food, an NGO feeding communities, or a volunteer ready to deliver — FoodLink is your platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-full text-white font-semibold shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--accent-primary-rgb),0.23)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 bg-[var(--accent-primary)]"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-full bg-[var(--card-bg)] text-[var(--text-primary)] font-semibold border border-[var(--card-border)] hover:bg-[var(--bg-secondary)] hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
