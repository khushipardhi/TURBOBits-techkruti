import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../common/StatusBadge';
import CountdownTimer from '../common/CountdownTimer';
import EmptyState from '../common/EmptyState';
import { UtensilsCrossed, Package, Truck, CheckCircle, X } from 'lucide-react';
import { useToast } from '../common/Toast';
import { cancelFoodListing } from '../../services/api';

// Delivery timeline steps
const TIMELINE = [
  { key: 'AVAILABLE',  label: 'Listed',    icon: UtensilsCrossed, done: ['REQUESTED', 'ACCEPTED', 'FULFILLED'] },
  { key: 'REQUESTED',  label: 'Claimed',   icon: Package,         done: ['ACCEPTED', 'FULFILLED'] },
  { key: 'ACCEPTED',   label: 'Assigned',  icon: Truck,           done: ['FULFILLED'] },
  { key: 'FULFILLED',  label: 'Delivered', icon: CheckCircle,     done: [] },
];

function DeliveryTimeline({ status }) {
  const currentIdx = TIMELINE.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-0 mt-3">
      {TIMELINE.map((step, i) => {
        const isDone = i <= currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                isDone
                  ? 'bg-[var(--accent-primary)] text-white shadow-[0_0_12px_rgba(var(--accent-primary-rgb),0.4)]'
                  : 'bg-gray-100 dark:bg-gray-800 text-[var(--text-tertiary)]'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[9px] mt-1 font-semibold whitespace-nowrap ${isDone ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                {step.label}
              </span>
            </div>
            {i < TIMELINE.length - 1 && (
              <div className={`h-[2px] w-8 mb-4 transition-all duration-700 ${
                i < currentIdx ? 'bg-[var(--accent-primary)]' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ActiveListings({ listings, onRefresh }) {
  const [cancellingId, setCancellingId] = useState(null);
  const { addToast } = useToast();

  const active = listings.filter((l) => ['AVAILABLE', 'REQUESTED', 'ACCEPTED'].includes(l.status));

  const handleCancel = async (foodId) => {
    setCancellingId(foodId);
    try {
      await cancelFoodListing(foodId);
      addToast('Listing cancelled successfully.', 'info');
      onRefresh?.();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  if (active.length === 0) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="No active listings"
        description="Post surplus food to see your active listings here."
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl overflow-hidden h-full flex flex-col"
    >
      <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
        <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Active Listings</h3>
        <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-bold">
          {active.length}
        </span>
      </div>
      <div className="divide-y divide-[var(--border-color)]">
        <AnimatePresence>
          {active.map((listing) => (
            <motion.div
              key={listing.food_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 hover:bg-[var(--accent-primary)]/[0.02] transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                <div className="flex-1">
                  {/* Parse and display items safely */}
                  {(() => {
                    let items = [];
                    try {
                      items = JSON.parse(listing.description).items || [];
                    } catch {
                      items = [{ name: listing.description, quantity: listing.quantity, unit: listing.unit }];
                    }
                    
                    return (
                      <div className="mb-3">
                        <h4 className="text-base font-display font-semibold text-[var(--text-primary)] mb-2">
                          {items.length > 1 ? `${items.length} Items Listed` : items[0]?.name}
                        </h4>
                        <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                          {items.slice(0, 3).map((itm, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="truncate pr-3">• {itm.name}</span>
                              <span className="flex-shrink-0 font-medium">{itm.quantity} {itm.unit || 'servings'}</span>
                            </div>
                          ))}
                          {items.length > 3 && <div className="text-xs text-[var(--text-tertiary)] italic">+{items.length - 3} more items</div>}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
                    <StatusBadge status={listing.food_type} />
                    <span className="text-[var(--text-tertiary)] text-xs font-medium bg-[var(--bg-secondary)] px-2 py-1 rounded-md border border-[var(--card-border)]">
                      Total: {listing.quantity} {listing.unit || 'units'}
                    </span>
                  </div>
                  {/* Delivery timeline */}
                  <DeliveryTimeline status={listing.status} />
                </div>
                <div className="flex flex-col items-end gap-2 min-w-[100px]">
                  <CountdownTimer expiresAt={listing.expires_at} />
                  <StatusBadge status={listing.status} />
                  {/* Cancel button — only for AVAILABLE listings */}
                  {listing.status === 'AVAILABLE' && (
                    <button
                      onClick={() => handleCancel(listing.food_id)}
                      disabled={cancellingId === listing.food_id}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50 mt-1"
                    >
                      {cancellingId === listing.food_id ? (
                        <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
