import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Star, Truck, AlertCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { useToast } from '../common/Toast';
import { acceptRequest, rejectRequest } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';

export default function IncomingRequests({ requests, onUpdate }) {
  const [loadingId, setLoadingId] = useState(null);
  const { addToast } = useToast();

  const pending = requests.filter((r) => ['PENDING', 'REQUESTED_CHANGES'].includes(r.request_status));
  const accepted = requests.filter((r) => ['APPROVED', 'FULFILLED', 'ACCEPTED'].includes(r.request_status));

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

  const renderItemsDiff = (req) => {
    let origItems = [];
    let modItems = null;

    try {
      const parsed = JSON.parse(req.food_description);
      origItems = parsed.items || [];
    } catch {
      origItems = [{ id: 1, name: req.food_description, quantity: req.quantity, unit: req.unit }];
    }

    if (req.modified_items) {
      try {
        modItems = typeof req.modified_items === 'string' ? JSON.parse(req.modified_items) : req.modified_items;
      } catch {}
    }

    // Default view without modifications
    if (!modItems || modItems.length === 0) {
      return (
        <div className="space-y-1 mb-3">
          {origItems.slice(0, 3).map((itm, i) => (
            <div key={i} className="flex justify-between text-sm text-[var(--text-secondary)]">
              <span>• {itm.name}</span>
              <span className="font-medium">{itm.quantity} {itm.unit}</span>
            </div>
          ))}
          {origItems.length > 3 && <p className="text-xs text-[var(--text-tertiary)] italic">+{origItems.length - 3} more items</p>}
        </div>
      );
    }

    // Diff view for REQUESTED_CHANGES
    return (
      <div className="space-y-2 mb-4 bg-orange-500/5 border border-orange-500/20 rounded-xl p-3">
        <p className="text-xs font-semibold text-orange-500 mb-2 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> NGO Modified Quantities
        </p>
        {origItems.map((orig) => {
          const mod = modItems.find(m => m.id === orig.id);
          const isRemoved = !mod;
          const isReduced = mod && mod.quantity < orig.quantity;
          
          return (
            <div key={orig.id} className="flex items-center justify-between text-sm">
              <span className={`truncate mr-2 ${isRemoved ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}>
                {orig.name}
              </span>
              <span className="font-medium whitespace-nowrap">
                {isRemoved ? (
                  <span className="text-red-500 text-xs font-semibold">Will not claim</span>
                ) : isReduced ? (
                  <span className="text-orange-500 font-bold">{mod.quantity} <span className="text-[var(--text-tertiary)] line-through ml-1 font-normal text-xs">{orig.quantity}</span> {orig.unit}</span>
                ) : (
                  <span className="text-[var(--text-secondary)]">{orig.quantity} {orig.unit}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {pending.length === 0 ? (
        <EmptyState icon={Clock} title="No pending requests" description="When NGOs claim your food, requests will appear here." />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl overflow-hidden"
        >
          <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
              Incoming Requests
            </h3>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold animate-pulse">
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
                  className="p-6 hover:bg-[var(--accent-primary)]/[0.02] transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <p className="font-semibold text-lg text-[var(--text-primary)]">{req.receiver_name || 'NGO'}</p>
                        {req.receiver_trust != null && (
                          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-xs font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            {Number(req.receiver_trust).toFixed(1)}
                          </span>
                        )}
                        {req.request_status === 'REQUESTED_CHANGES' && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold tracking-wide uppercase">Modified Request</span>
                        )}
                      </div>
                      
                      {renderItemsDiff(req)}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={req.food_type} />
                        <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(req.requested_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <button
                        onClick={() => handleAccept(req.request_id)}
                        disabled={loadingId === req.request_id}
                        className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-bold shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {loadingId === req.request_id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><Check className="w-4 h-4" /> Confirm</>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(req.request_id)}
                        disabled={loadingId === req.request_id}
                        className="w-full py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] text-red-500 text-sm font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
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
          className="rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl overflow-hidden"
        >
          <div className="p-6 border-b border-[var(--border-color)]">
            <h3 className="text-xl font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[var(--accent-primary)]" />
              Accepted Deliveries
            </h3>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {accepted.map((req) => {
              let parsedTitle = req.food_description;
              try { parsedTitle = `${JSON.parse(req.food_description).items.length} Items`; } catch {}
              return (
                <div key={req.request_id} className="p-5 hover:bg-[var(--accent-primary)]/[0.02] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{parsedTitle}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                        <span className="font-medium text-[var(--accent-primary)]">{req.receiver_name}</span>
                        {req.volunteer_name && <span className="text-[var(--text-tertiary)]">• Vol: {req.volunteer_name}</span>}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={req.request_status} />
                      {req.delivery_status && (
                        <StatusBadge status={req.delivery_status} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
