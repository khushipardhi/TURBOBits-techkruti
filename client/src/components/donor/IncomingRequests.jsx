import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Star, Truck } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { useToast } from '../common/Toast';
import { acceptRequest, rejectRequest } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';

export default function IncomingRequests({ requests, onUpdate }) {
  const [loadingId, setLoadingId] = useState(null);
  const { addToast } = useToast();

  const pending = requests.filter((r) => r.request_status === 'PENDING');
  // Accepted/in-progress requests (donor tracking)
  const accepted = requests.filter((r) =>
    ['APPROVED', 'FULFILLED'].includes(r.request_status)
  );

  const handleAccept = async (requestId) => {
    setLoadingId(requestId);
    try {
      await acceptRequest(requestId);
      addToast('Request accepted! Volunteer can now pick it up.', 'success');
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

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pending.length === 0 ? (
        <EmptyState icon={Clock} title="No pending requests" description="When NGOs claim your food, requests will appear here." />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl overflow-hidden"
        >
          <div className="p-6 border-b border-[var(--border-color)] flex items-center gap-3">
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
              Incoming Requests
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold animate-pulse">
              {pending.length} pending
            </span>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            <AnimatePresence>
              {pending.map((req) => (
                <motion.div
                  key={req.request_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="p-5 hover:bg-[var(--accent-primary)]/[0.02] transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-[var(--text-primary)]">{req.receiver_name || 'NGO'}</p>
                        {req.receiver_trust != null && (
                          <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {Number(req.receiver_trust).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">{req.food_description}</p>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={req.food_type} />
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {req.quantity} {req.unit || 'servings'}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {formatDateTime(req.requested_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(req.request_id)}
                        disabled={loadingId === req.request_id}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all flex items-center gap-1 disabled:opacity-50"
                      >
                        {loadingId === req.request_id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><Check className="w-4 h-4" /> Accept</>
                        )}
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Delivery Tracking for Accepted Requests */}
      {accepted.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl overflow-hidden"
        >
          <div className="p-6 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[var(--accent-primary)]" />
              Accepted Deliveries
            </h3>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {accepted.map((req) => (
              <div key={req.request_id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{req.food_description}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      → {req.receiver_name}
                      {req.volunteer_name && ` • Volunteer: ${req.volunteer_name}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={req.request_status} />
                    {req.delivery_status && (
                      <StatusBadge status={req.delivery_status} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
