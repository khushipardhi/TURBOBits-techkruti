import { motion } from 'framer-motion';
import StatusBadge from '../common/StatusBadge';
import CountdownTimer from '../common/CountdownTimer';
import EmptyState from '../common/EmptyState';
import { UtensilsCrossed } from 'lucide-react';

export default function ActiveListings({ listings }) {
  const active = listings.filter((l) => ['AVAILABLE', 'REQUESTED', 'ACCEPTED'].includes(l.status));

  if (active.length === 0) {
    return <EmptyState icon={UtensilsCrossed} title="No active listings" description="Post surplus food to see your active listings here." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl overflow-hidden"
    >
      <div className="p-6 border-b border-[var(--border-color)]">
        <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Active Listings</h3>
      </div>
      <div className="divide-y divide-[var(--border-color)]">
        {active.map((listing) => (
          <div key={listing.food_id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[var(--accent-primary)]/[0.02] transition-colors">
            <div className="flex-1">
              <p className="font-medium text-[var(--text-primary)] mb-1">{listing.description}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <StatusBadge status={listing.food_type} />
                <span className="text-[var(--text-tertiary)]">•</span>
                <span className="text-[var(--text-secondary)]">{listing.quantity} servings</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CountdownTimer expiresAt={listing.expires_at} />
              <StatusBadge status={listing.status} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
