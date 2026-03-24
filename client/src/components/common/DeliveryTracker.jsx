import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, ChefHat, Navigation } from 'lucide-react';

const DELIVERY_STEPS = [
  { key: 'PENDING', label: 'Pending', icon: Clock, color: 'text-gray-400' },
  { key: 'CLAIMED', label: 'Claimed', icon: Package, color: 'text-blue-500' },
  { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle, color: 'text-amber-500' },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat, color: 'text-orange-500' },
  { key: 'ON_THE_WAY', label: 'On the Way', icon: Navigation, color: 'text-violet-500' },
  { key: 'DELIVERED', label: 'Delivered', icon: Truck, color: 'text-emerald-500' },
];

// Maps our existing statuses to the new flow
const STATUS_MAP = {
  'AVAILABLE': 0,
  'PENDING': 0,
  'REQUESTED': 1,
  'CLAIMED': 1,
  'APPROVED': 2,
  'ACCEPTED': 2,
  'ASSIGNED': 3,
  'PREPARING': 3,
  'PICKED_UP': 4,
  'IN_TRANSIT': 4,
  'ON_THE_WAY': 4,
  'DELIVERED': 5,
  'FULFILLED': 5,
};

export default function DeliveryTracker({ status }) {
  const currentIdx = STATUS_MAP[status] ?? 0;

  return (
    <div className="flex items-center w-full gap-0">
      {DELIVERY_STEPS.map((step, i) => {
        const isComplete = i <= currentIdx;
        const isCurrent = i === currentIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center relative">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.15 : 1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isComplete
                    ? 'bg-[var(--accent-primary)] text-white shadow-[0_0_14px_rgba(var(--accent-primary-rgb),0.4)]'
                    : 'bg-gray-100 dark:bg-gray-800 text-[var(--text-tertiary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
              <span className={`text-[9px] mt-1.5 font-semibold whitespace-nowrap ${
                isComplete ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'
              }`}>
                {step.label}
              </span>
              {isCurrent && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)]"
                />
              )}
            </div>
            {i < DELIVERY_STEPS.length - 1 && (
              <div className={`h-[2px] flex-1 mx-1 mb-5 transition-all duration-700 rounded-full ${
                i < currentIdx
                  ? 'bg-[var(--accent-primary)]'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
