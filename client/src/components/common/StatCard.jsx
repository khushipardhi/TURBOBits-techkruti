import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function StatCard({ icon: Icon, title, value, subtitle, trend, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'p-6 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl hover:border-[var(--accent-primary)]/30 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden',
        className
      )}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[var(--accent-primary)]/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center group-hover:bg-[var(--accent-primary)]/20 transition-colors duration-300">
            {Icon && <Icon className="w-6 h-6 text-[var(--accent-primary)]" />}
          </div>
          {trend && (
            <span className={cn(
              'text-xs font-semibold px-2 py-1 rounded-full',
              trend > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
            )}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight mb-1">
          {value}
        </p>
        <p className="text-sm text-[var(--text-secondary)]">{title}</p>
        {subtitle && (
          <p className="text-xs text-[var(--text-tertiary)] mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
