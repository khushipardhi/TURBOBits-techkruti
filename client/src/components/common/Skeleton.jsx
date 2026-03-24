import { motion } from 'framer-motion';

function SkeletonPulse({ className }) {
  return (
    <motion.div
      className={`bg-[var(--card-border)] rounded-xl animate-pulse ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <SkeletonPulse className="h-6 w-16 rounded-full" />
        <SkeletonPulse className="h-6 w-20 rounded-full" />
      </div>
      <SkeletonPulse className="h-5 w-3/4 mb-3" />
      <SkeletonPulse className="h-4 w-1/2 mb-2" />
      <SkeletonPulse className="h-4 w-2/3 mb-4" />
      <SkeletonPulse className="h-12 w-full rounded-2xl" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="p-6 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <SkeletonPulse className="w-12 h-12 rounded-xl" />
      </div>
      <SkeletonPulse className="h-8 w-16 mb-2" />
      <SkeletonPulse className="h-4 w-24" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
          <SkeletonPulse className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-4 w-1/3" />
            <SkeletonPulse className="h-3 w-2/3" />
          </div>
          <SkeletonPulse className="h-8 w-20 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonPulse;
