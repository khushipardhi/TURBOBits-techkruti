import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ZapOff, Hash, SlidersHorizontal } from 'lucide-react';
import { useToast } from '../common/Toast';

export default function AutoAcceptToggle({ enabled, onToggle, pinCode }) {
  const [minQuantity, setMinQuantity] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="p-5 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[var(--accent-primary)]/8 blur-[60px] rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {enabled ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-500" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center">
                <ZapOff className="w-5 h-5 text-[var(--text-tertiary)]" />
              </div>
            )}
            <div>
              <h4 className="text-sm font-display font-bold text-[var(--text-primary)]">Auto-Accept Mode</h4>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                {enabled ? 'Automatically claiming nearby food' : 'Manual claim mode'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => onToggle(!enabled)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
              enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <motion.div
              layout
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
              style={{ left: enabled ? '26px' : '2px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-[var(--border-color)] space-y-2"
          >
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Hash className="w-3.5 h-3.5" />
              <span>PIN: <strong className="text-[var(--text-primary)]">{pinCode || 'Not set'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Min qty:</span>
              <input
                type="number"
                min={1}
                value={minQuantity}
                onChange={(e) => setMinQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]/30"
              />
              <span>servings</span>
            </div>
            <div className="mt-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                ⚡ Auto-accepting food from PIN {pinCode || '—'} with ≥{minQuantity} servings
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
