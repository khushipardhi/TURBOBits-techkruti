import { motion } from 'framer-motion';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { ClipboardList, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

// Delivery status timeline for NGO
const DELIVERY_STEPS = [
  { key: 'PENDING',   label: 'Requested', icon: ClipboardList },
  { key: 'APPROVED',  label: 'Approved',  icon: Package },
  { key: 'ASSIGNED',  label: 'Assigned',  icon: Truck },
  { key: 'PICKED_UP', label: 'Picked Up', icon: Truck },
  { key: 'FULFILLED', label: 'Delivered', icon: CheckCircle },
];

const STATUS_ORDER = ['PENDING', 'APPROVED', 'ASSIGNED', 'PICKED_UP', 'FULFILLED'];

function DeliveryTimeline({ requestStatus, deliveryStatus }) {
  // Map delivery status on top of request status
  let effectiveStatus = requestStatus;
  if (requestStatus === 'APPROVED') {
    if (deliveryStatus === 'DELIVERED') effectiveStatus = 'FULFILLED';
    else if (deliveryStatus === 'PICKED_UP') effectiveStatus = 'PICKED_UP';
    else if (deliveryStatus === 'ASSIGNED') effectiveStatus = 'ASSIGNED';
  }

  const currentIdx = STATUS_ORDER.indexOf(effectiveStatus);

  return (
    <div className="flex items-center gap-0 mt-2">
      {DELIVERY_STEPS.map((step, i) => {
        const isDone = i <= currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                isDone
                  ? 'bg-[var(--accent-primary)] text-white shadow-[0_0_8px_rgba(var(--accent-primary-rgb),0.35)]'
                  : 'bg-gray-100 dark:bg-gray-800 text-[var(--text-tertiary)]'
              }`}>
                <Icon className="w-3 h-3" />
              </div>
              <span className={`text-[8px] mt-1 font-semibold whitespace-nowrap ${isDone ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                {step.label}
              </span>
            </div>
            {i < DELIVERY_STEPS.length - 1 && (
              <div className={`h-[2px] w-6 mb-4 transition-all duration-700 ${
                i < currentIdx ? 'bg-[var(--accent-primary)]' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RequestHistory({ requests }) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No requests yet"
        description="Claim food from the feed and your requests will appear here."
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl overflow-hidden"
    >
      <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
        <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">My Request History</h3>
        <span className="text-xs text-[var(--text-tertiary)]">{requests.length} total</span>
      </div>
      <div className="divide-y divide-[var(--border-color)]">
        {requests.map((req) => (
          <div
            key={req.request_id}
            className="p-5 hover:bg-[var(--accent-primary)]/[0.02] transition-colors"
          >
            <div className="flex flex-col md:flex-row justify-between gap-3">
              <div className="flex-1">
                {/* Parse JSON description for formatting */}
                {(() => {
                  let items = [];
                  try {
                    items = JSON.parse(req.food_description).items || [];
                  } catch {
                    items = [{ name: req.food_description }];
                  }

                  const title = items.length > 1 
                    ? `${items.length} Items Listed` 
                    : items[0]?.name;

                  return (
                    <div className="mb-1">
                      <p className="font-display font-semibold text-[var(--text-primary)] text-base">{title}</p>
                      {items.length > 1 && (
                        <div className="text-sm text-[var(--text-secondary)] mt-1">
                          {items.slice(0, 3).map((itm, i) => (
                            <span key={i} className="mr-3 text-xs">• {itm.name} ({itm.quantity} {itm.unit})</span>
                          ))}
                          {items.length > 3 && <span className="text-xs italic text-[var(--text-tertiary)]">+{items.length - 3} more</span>}
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(req.requested_at)}
                  </span>
                  <span>{req.quantity} {req.unit || 'servings'}</span>
                </div>
                {/* Delivery timeline */}
                <DeliveryTimeline
                  requestStatus={req.request_status}
                  deliveryStatus={req.delivery_status}
                />
              </div>
              <div className="flex items-start gap-2 md:flex-col md:items-end">
                <StatusBadge status={req.request_status} />
                {req.delivery_status && req.request_status === 'APPROVED' && (
                  <StatusBadge status={req.delivery_status} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
