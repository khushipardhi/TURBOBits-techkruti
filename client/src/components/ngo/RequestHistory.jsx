import { motion } from 'framer-motion';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { ClipboardList } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function RequestHistory({ requests }) {
  if (requests.length === 0) {
    return <EmptyState icon={ClipboardList} title="No requests yet" description="Claim food from the feed and your requests will appear here." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl overflow-hidden"
    >
      <div className="p-6 border-b border-[var(--border-color)]">
        <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">My Request History</h3>
      </div>
      <div className="divide-y divide-[var(--border-color)]">
        {requests.map((req) => (
          <div key={req.request_id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[var(--accent-primary)]/[0.02] transition-colors">
            <div className="flex-1">
              <p className="font-medium text-[var(--text-primary)] mb-1">{req.food_description}</p>
              <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                <span>{formatDateTime(req.requested_at)}</span>
                {req.responded_at && <span>• Responded: {formatDateTime(req.responded_at)}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)]">{req.quantity} servings</span>
              <StatusBadge status={req.request_status} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
