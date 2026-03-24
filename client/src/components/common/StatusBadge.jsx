import { cn } from '../../lib/utils';

const statusConfig = {
  AVAILABLE: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' },
  REQUESTED: { bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500' },
  ACCEPTED: { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500' },
  FULFILLED: { bg: 'bg-green-600/10', text: 'text-green-600', dot: 'bg-green-600' },
  EXPIRED: { bg: 'bg-gray-500/10', text: 'text-gray-500', dot: 'bg-gray-500' },
  CANCELLED: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' },
  PENDING: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', dot: 'bg-yellow-500' },
  APPROVED: { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500' },
  REJECTED: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' },
  ASSIGNED: { bg: 'bg-purple-500/10', text: 'text-purple-500', dot: 'bg-purple-500' },
  PICKED_UP: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', dot: 'bg-cyan-500' },
  IN_TRANSIT: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', dot: 'bg-indigo-500' },
  DELIVERED: { bg: 'bg-green-600/10', text: 'text-green-600', dot: 'bg-green-600' },
  FAILED: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' },
  VEG: { bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500' },
  NON_VEG: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' },
  MIXED: { bg: 'bg-orange-500/10', text: 'text-orange-500', dot: 'bg-orange-500' },
};

export default function StatusBadge({ status, className }) {
  const config = statusConfig[status] || { bg: 'bg-gray-500/10', text: 'text-gray-500', dot: 'bg-gray-500' };
  const label = status?.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {label}
    </span>
  );
}
