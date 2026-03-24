import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Leaf, Drumstick, Shuffle, CheckCircle } from 'lucide-react';
import { useToast } from '../common/Toast';
import { createFoodListing } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';

const foodTypes = [
  { value: 'VEG', label: 'Vegetarian', icon: Leaf, color: 'text-green-500 border-green-500/30 bg-green-500/5' },
  { value: 'NON_VEG', label: 'Non-Veg', icon: Drumstick, color: 'text-red-500 border-red-500/30 bg-red-500/5' },
  { value: 'MIXED', label: 'Mixed', icon: Shuffle, color: 'text-orange-500 border-orange-500/30 bg-orange-500/5' },
];

export default function PostFoodForm({ onPosted }) {
  const [form, setForm] = useState({ description: '', quantity: '', food_type: '', hygiene_confirmed: false });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.quantity || !form.food_type) {
      return addToast('Please fill all required fields', 'error');
    }
    if (!form.hygiene_confirmed) {
      return addToast('Please confirm hygiene certification', 'error');
    }
    setLoading(true);
    try {
      await createFoodListing({
        ...form,
        donor_id: user?.user_id,
        donor_name: user?.name,
        quantity: parseInt(form.quantity),
        pickup_address: user?.address || 'Address not set',
      });
      addToast('Food listing posted! NGOs can now see it.', 'success');
      setForm({ description: '', quantity: '', food_type: '', hygiene_confirmed: false });
      onPosted?.();
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
      className="p-6 md:p-8 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl"
    >
      <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-[var(--accent-primary)]" />
        Post Surplus Food
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Food Type Selection */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Food Type *</label>
          <div className="grid grid-cols-3 gap-3">
            {foodTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => update('food_type', type.value)}
                  className={`p-3 rounded-2xl border text-center transition-all duration-300 ${
                    form.food_type === type.value ? type.color : 'border-[var(--card-border)] hover:border-[var(--accent-primary)]/30'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-semibold">{type.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="E.g., Fresh paneer biryani from lunch buffet..."
            rows={3}
            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Quantity (servings) *</label>
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => update('quantity', e.target.value)}
            placeholder="E.g., 50"
            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
        </div>

        {/* Hygiene Certification */}
        <label className="flex items-start gap-3 p-4 rounded-2xl border border-[var(--card-border)] bg-gray-50 dark:bg-gray-900 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hygiene_confirmed}
            onChange={(e) => update('hygiene_confirmed', e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded accent-[var(--accent-primary)]"
          />
          <div>
            <span className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-[var(--accent-primary)]" /> Hygiene Certification
            </span>
            <span className="text-xs text-[var(--text-tertiary)] block mt-0.5">
              I confirm this food is fresh, safely stored, and suitable for consumption.
            </span>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white font-semibold shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--accent-primary-rgb),0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Plus className="w-5 h-5" /> Post Food Listing</>
          )}
        </button>
      </form>
    </motion.div>
  );
}
