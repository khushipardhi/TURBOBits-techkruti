import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { useToast } from '../common/Toast';
import { acceptRequest, rejectRequest } from '../../services/mockApi';

export default function IncomingRequests({ requests, onUpdate }) {
  const [loadingId, setLoadingId] = useState(null);
  const { addToast } = useToast();
  const pending = requests.filter((r) => r.request_status === 'PENDING');

  const handleAccept = async (requestId) => {
    setLoadingId(requestId);
    try {
      await acceptRequest(requestId);
      addToast('Request accepted! Volunteer will be assigned.', 'success');
      onUpdate?.();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setLoadingId(requestId);
    try {
      await rejectRequest(requestId);
      addToast('Request rejected. Listing is available again.', 'info');
      onUpdate?.();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  if (pending.length === 0) {
    return <EmptyState icon={Clock} title="No pending requests" description="When NGOs claim your food, requests will appear here." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl overflow-hidden"
    >
      <div className="p-6 border-b border-[var(--border-color)]">
        <h3 className="text-lg font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
          Incoming Requests
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">{pending.length}</span>
        </h3>
      </div>
      <div className="divide-y divide-[var(--border-color)]">
        {pending.map((req) => (
          <div key={req.request_id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--accent-primary)]/[0.02] transition-colors">
            <div className="flex-1">
              <p className="font-medium text-[var(--text-primary)] mb-1">{req.receiver_name || 'NGO'}</p>
              <p className="text-sm text-[var(--text-secondary)]">{req.food_description}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={req.food_type} />
                <span className="text-xs text-[var(--text-tertiary)]">{req.quantity} servings</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAccept(req.request_id)}
                disabled={loadingId === req.request_id}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all flex items-center gap-1 disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Accept
              </button>
              <button
                onClick={() => handleReject(req.request_id)}
                disabled={loadingId === req.request_id}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 transition-all flex items-center gap-1 disabled:opacity-50"
              >
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
