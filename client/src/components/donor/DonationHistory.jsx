import { motion } from 'framer-motion';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { History } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function DonationHistory({ listings }) {
  const history = listings.filter((l) => ['FULFILLED', 'EXPIRED', 'CANCELLED'].includes(l.status));

  if (history.length === 0) {
    return <EmptyState icon={History} title="No history yet" description="Your past donations will appear here." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl overflow-hidden"
    >
      <div className="p-6 border-b border-[var(--border-color)]">
        <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Donation History</h3>
      </div>
      <div className="divide-y divide-[var(--border-color)]">
        {history.map((listing) => (
          <div key={listing.food_id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <p className="font-medium text-[var(--text-primary)] mb-1">{listing.description}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{formatDateTime(listing.created_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)]">{listing.quantity} servings</span>
              <StatusBadge status={listing.status} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
