import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Star, Clock, List, X, Loader2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CountdownTimer from '../common/CountdownTimer';
import { useToast } from '../common/Toast';
import { claimFood } from '../../services/api';

export default function FoodCard({ listing, onClaimed }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const trustScore = listing.donor_trust ?? listing.trust_score;
  
  // Parse hacked JSON description (backward compat fallback)
  let extraInfo = {};
  let items = [];
  try {
    extraInfo = JSON.parse(listing.description);
    items = extraInfo.items || [];
  } catch (e) {
    items = [{ id: 'legacy-1', name: listing.description, quantity: listing.quantity, unit: listing.unit }];
  }

  // Modifiable items state
  const [modifiableItems, setModifiableItems] = useState([...items]);

  const updateQuantity = (id, newQuantity) => {
    setModifiableItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const removeItem = (id) => {
    setModifiableItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClaimSubmit = async () => {
    if (modifiableItems.length === 0) {
      return addToast('You must claim at least one item.', 'error');
    }

    const invalid = modifiableItems.find(i => i.quantity <= 0);
    if (invalid) {
      return addToast('All quantities must be > 0.', 'error');
    }

    setLoading(true);
    try {
      // Send the modified items to the backend via claim API
      await claimFood(listing.food_id, modifiableItems);
      addToast(`Food claimed! Waiting for donor approval.`, 'success');
      setIsModalOpen(false);
      onClaimed?.();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const hasMultipleItems = items.length > 1;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl hover:border-[var(--accent-primary)]/40 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden flex flex-col h-full"
      >
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[var(--accent-primary)]/12 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={listing.food_type} />
              <StatusBadge status={listing.status} />
              {listing.is_nearby && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 text-[10px] font-bold uppercase tracking-wide border border-blue-500/20">
                  📍 Nearby
                </span>
              )}
            </div>
            <CountdownTimer expiresAt={listing.expires_at} />
          </div>

          <h4 className="text-base font-display font-semibold text-[var(--text-primary)] mb-3 leading-snug line-clamp-2">
            {hasMultipleItems ? `${items.length} Items Available` : items[0]?.name}
          </h4>

          {hasMultipleItems && (
            <div className="mb-3 space-y-1">
              {items.slice(0, 2).map((itm, idx) => (
                <div key={idx} className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span className="truncate pr-2">• {itm.name}</span>
                  <span className="flex-shrink-0 font-medium">{itm.quantity} {itm.unit}</span>
                </div>
              ))}
              {items.length > 2 && <div className="text-xs text-[var(--text-tertiary)] italic">+{items.length - 2} more items</div>}
            </div>
          )}

          <div className="space-y-1.5 mb-5 flex-1 mt-auto">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Users className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
              <span className="font-medium">{listing.quantity} {listing.unit || 'total units'}</span>
            </div>
            {extraInfo.prep_time && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Clock className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                <span>Prep: {extraInfo.prep_time}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <MapPin className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
              <span className="truncate">{listing.pickup_address || 'Pickup address TBD'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Star className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
              <span className="truncate">Donor: {listing.donor_name || 'Donor'}</span>
              {trustScore != null && (
                <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 ml-auto">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {Number(trustScore).toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {listing.status === 'AVAILABLE' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3 rounded-xl bg-[var(--accent-primary)] text-white font-semibold hover:shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
            >
              <List className="w-4 h-4" /> Review & Claim
            </button>
          ) : (
            <div className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold text-center text-sm">
              Already Claimed
            </div>
          )}
        </div>
      </motion.div>

      {/* Claim Modification Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] shadow-2xl overflow-hidden shadow-black/20"
            >
              <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
                <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">Review Request</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 -mr-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                  You can modify the quantity or remove items if you don't need all of them. The donor will see these changes.
                </p>

                {modifiableItems.length === 0 ? (
                  <div className="text-center py-6 text-[var(--text-tertiary)] italic text-sm">No items remaining. Add at least one to claim.</div>
                ) : (
                  modifiableItems.map((item) => {
                    // Find original item to cap quantity
                    const origItem = items.find(i => i.id === item.id) || item;
                    return (
                      <div key={item.id} className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] flex items-center justify-between gap-3 group">
                        <div className="flex-1">
                          <p className="font-semibold text-[var(--text-primary)] text-sm">{item.name}</p>
                          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.unit}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <input
                              type="number"
                              min="1"
                              max={origItem.quantity}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-sm text-center focus:border-[var(--accent-primary)] focus:outline-none"
                            />
                            <span className="text-[10px] text-[var(--text-tertiary)] text-center mt-1">max {origItem.quantity}</span>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
                            title="Remove item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                {extraInfo.notes && (
                  <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <p className="text-xs font-semibold text-orange-500 mb-1">Donor Notes</p>
                    <p className="text-sm text-orange-600/80 dark:text-orange-400/80">{extraInfo.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
                <button
                  onClick={handleClaimSubmit}
                  disabled={loading || modifiableItems.length === 0}
                  className="w-full py-3.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-sm shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:-translate-y-0.5 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Claim Request'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
