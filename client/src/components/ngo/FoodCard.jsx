import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CountdownTimer from '../common/CountdownTimer';
import { useToast } from '../common/Toast';
import { claimFood } from '../../services/mockApi';

export default function FoodCard({ listing, receiverId, onClaimed }) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleClaim = async () => {
    setLoading(true);
    try {
      await claimFood(listing.food_id, receiverId);
      addToast(`Claimed "${listing.description}" — waiting for donor approval`, 'success');
      onClaimed?.();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl hover:border-[var(--accent-primary)]/30 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden"
    >
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[var(--accent-primary)]/15 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={listing.food_type} />
            <StatusBadge status={listing.status} />
          </div>
          <CountdownTimer expiresAt={listing.expires_at} />
        </div>

        {/* Description */}
        <h4 className="text-lg font-display font-semibold text-[var(--text-primary)] mb-2 leading-snug">
          {listing.description}
        </h4>

        {/* Meta */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Users className="w-4 h-4 text-[var(--text-tertiary)]" />
            <span>{listing.quantity} servings</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />
            <span>{listing.pickup_address || 'Pickup address'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
            <span>By {listing.donor_name}</span>
          </div>
        </div>

        {/* Claim Button */}
        {listing.status === 'AVAILABLE' ? (
          <button
            onClick={handleClaim}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--accent-primary)] text-white font-semibold hover:shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Claim This Food'
            )}
          </button>
        ) : (
          <div className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold text-center text-sm">
            Already Claimed
          </div>
        )}
      </div>
    </motion.div>
  );
}
