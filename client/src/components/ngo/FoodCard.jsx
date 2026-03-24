import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Star, Clock } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CountdownTimer from '../common/CountdownTimer';
import { useToast } from '../common/Toast';
import { claimFood } from '../../services/api';

export default function FoodCard({ listing, receiverId, onClaimed }) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleClaim = async () => {
    setLoading(true);
    try {
      await claimFood(listing.food_id);
      addToast(`Food claimed! Waiting for donor approval.`, 'success');
      onClaimed?.();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const trustScore = listing.donor_trust ?? listing.trust_score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl hover:border-[var(--accent-primary)]/40 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden"
    >
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[var(--accent-primary)]/12 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={listing.food_type} />
            <StatusBadge status={listing.status} />
          </div>
          <CountdownTimer expiresAt={listing.expires_at} />
        </div>

        {/* Description */}
        <h4 className="text-base font-display font-semibold text-[var(--text-primary)] mb-3 leading-snug line-clamp-2">
          {listing.description}
        </h4>

        {/* Meta */}
        <div className="space-y-1.5 mb-4">
          {/* Quantity + unit */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Users className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
            <span className="font-medium">{listing.quantity} {listing.unit || 'servings'}</span>
          </div>
          {/* Pickup address */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <MapPin className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
            <span className="truncate">{listing.pickup_address || 'Pickup address TBD'}</span>
          </div>
          {/* Donor with trust score */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Clock className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
            <span className="truncate">By {listing.donor_name || 'Donor'}</span>
            {trustScore != null && (
              <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 ml-auto">
                <Star className="w-3 h-3 fill-amber-500" />
                {Number(trustScore).toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        {listing.status === 'AVAILABLE' ? (
          <button
            onClick={handleClaim}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--accent-primary)] text-white font-semibold hover:shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '🍽️ Claim This Food'
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
