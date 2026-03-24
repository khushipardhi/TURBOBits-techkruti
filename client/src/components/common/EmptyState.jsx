import { motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = PackageOpen, title = 'No data found', description = 'There is nothing to show here yet.', action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      <div className="w-20 h-20 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-[var(--text-tertiary)]" />
      </div>
      <h3 className="text-lg font-display font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-tertiary)] text-center max-w-sm mb-6">{description}</p>
      {action && action}
    </motion.div>
  );
}
