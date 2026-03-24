import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, HandHeart, Users, Truck } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';

export default function ImpactBanner() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/stats`)
      .then(r => r.json())
      .then(d => setStats(d.data))
      .catch(() => {});
  }, []);

  const items = [
    { icon: HandHeart, label: 'Meals Saved', value: stats?.meals_saved || 0, color: 'emerald' },
    { icon: Leaf, label: 'CO₂ Prevented (kg)', value: stats?.co2_prevented_kg || 0, color: 'teal' },
    { icon: Users, label: 'Active Donors', value: stats?.active_donors || 0, color: 'blue' },
    { icon: Truck, label: 'Active NGOs', value: stats?.active_ngos || 0, color: 'violet' },
  ];

  return (
    <section className="py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-primary)]/5 to-transparent" />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-bold tracking-wider uppercase mb-4">
            Live Impact
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">
            Real Numbers. Real Impact.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl hover:border-[var(--accent-primary)]/30 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[var(--accent-primary)]/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--accent-primary)]/20 transition-colors">
                  <item.icon className="w-7 h-7 text-[var(--accent-primary)]" />
                </div>
                <p className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight mb-1">
                  {Number(item.value).toLocaleString()}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
