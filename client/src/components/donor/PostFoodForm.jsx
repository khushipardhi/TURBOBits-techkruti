import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Leaf, Drumstick, Shuffle, CheckCircle, Scale, MapPin, Clock, X, Trash2 } from 'lucide-react';
import { useToast } from '../common/Toast';
import { createFoodListing } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const foodTypes = [
  { value: 'VEG', label: 'Vegetarian', icon: Leaf, color: 'text-green-500 border-green-500/30 bg-green-500/5' },
  { value: 'NON_VEG', label: 'Non-Veg', icon: Drumstick, color: 'text-red-500 border-red-500/30 bg-red-500/5' },
  { value: 'MIXED', label: 'Mixed', icon: Shuffle, color: 'text-orange-500 border-orange-500/30 bg-orange-500/5' },
];

const units = ['servings', 'kg', 'plates', 'packets', 'litres'];

const inputCls = 'w-full p-4 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]';

export default function PostFoodForm({ onPosted }) {
  const [form, setForm] = useState({
    food_type: '',
    pickup_address: '',
    prep_time: '',
    notes: '',
    hygiene_confirmed: false,
  });
  
  const [items, setItems] = useState([
    { id: 1, name: '', quantity: '', unit: 'servings', description: '' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addItem = () => {
    setItems((prev) => [
      ...prev, 
      { id: Date.now(), name: '', quantity: '', unit: 'servings', description: '' }
    ]);
  };

  const updateItem = (id, field, value) => {
    setItems((prev) => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id) => {
    if (items.length === 1) return addToast('Must have at least one item', 'error');
    setItems((prev) => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.food_type) return addToast('Please select a food type', 'error');
    if (!form.hygiene_confirmed) return addToast('Please confirm hygiene certification', 'error');
    
    const invalidItem = items.find(i => !i.name || !i.quantity || i.quantity <= 0);
    if (invalidItem) return addToast('All items must have a name and valid quantity', 'error');

    setLoading(true);
    try {
      await createFoodListing({
        ...form,
        items, // Send multi-items array to API
        donor_id: user?.user_id,
        donor_name: user?.name,
        pickup_address: form.pickup_address || user?.address || null,
      });
      
      addToast('Multi-item donation posted successfully!', 'success');
      setForm({ food_type: '', pickup_address: '', prep_time: '', notes: '', hygiene_confirmed: false });
      setItems([{ id: Date.now(), name: '', quantity: '', unit: 'servings', description: '' }]);
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
      className="p-6 md:p-8 rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm backdrop-blur-xl relative overflow-hidden h-full flex flex-col"
    >
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[var(--accent-primary)]/8 blur-[100px] rounded-full pointer-events-none" />

      <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--card-border)]">
          <Plus className="w-5 h-5 text-[var(--accent-primary)]" />
        </div>
        Donate Food
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10 flex-1 flex flex-col">
        {/* Food Type */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-3">Overall Food Type *</label>
          <div className="grid grid-cols-3 gap-4">
            {foodTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateForm('food_type', type.value)}
                  className={`p-4 rounded-2xl border text-center transition-all duration-300 ${
                    form.food_type === type.value
                      ? type.color
                      : 'border-[var(--card-border)] bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)]/40 text-[var(--text-secondary)]'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-semibold">{type.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Items Array */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-[var(--text-secondary)]">Food Items *</label>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-bold flex items-center gap-1 hover:bg-[var(--accent-primary)]/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--bg-secondary)] space-y-3 relative group"
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        placeholder="Item Name (e.g. Rice, Dal)"
                        className="w-full bg-transparent text-[var(--text-primary)] font-medium text-sm focus:outline-none placeholder:text-[var(--text-tertiary)]"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      placeholder="Quantity"
                      className="w-full p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--accent-primary)]/50"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--accent-primary)]/50 appearance-none"
                    >
                      {units.map((u) => (
                        <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Optional details (e.g. Spicy, contains nuts)"
                    className="w-full p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs focus:outline-none focus:border-[var(--accent-primary)]/50 text-[var(--text-secondary)]"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Pickup Location</label>
            <input
              type="text"
              value={form.pickup_address}
              onChange={(e) => updateForm('pickup_address', e.target.value)}
              placeholder="Leave blank to use profile address"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Prep Time</label>
            <input
              type="text"
              value={form.prep_time}
              onChange={(e) => updateForm('prep_time', e.target.value)}
              placeholder="e.g. Ready now, 30 mins"
              className={inputCls}
            />
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Additional Notes</label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => updateForm('notes', e.target.value)}
            placeholder="E.g., Call upon arrival, gate code is 1234"
            className={inputCls}
          />
        </div>

        {/* Hygiene Certification */}
        <div className="mt-auto pt-4">
          <label className="flex items-start gap-3 p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--bg-secondary)] cursor-pointer hover:border-[var(--accent-primary)]/40 transition-all group">
            <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${form.hygiene_confirmed ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' : 'border-[var(--text-tertiary)] bg-[var(--card-bg)]'}`}>
              {form.hygiene_confirmed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
            </div>
            <input
              type="checkbox"
              checked={form.hygiene_confirmed}
              onChange={(e) => updateForm('hygiene_confirmed', e.target.checked)}
              className="hidden"
            />
            <div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">Hygiene Certification</span>
              <span className="text-xs text-[var(--text-secondary)] block mt-0.5 leading-relaxed">
                I confirm this food is fresh, stored at safe temperatures, and suitable for consumption.
              </span>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 py-4 rounded-2xl bg-[var(--accent-primary)] text-white font-bold text-base shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--accent-primary-rgb),0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Post Food Listing</>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
