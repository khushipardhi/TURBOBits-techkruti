import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  Building2,
  Truck,
  Timer,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: UtensilsCrossed,
    title: 'Post Surplus Food',
    description: 'Restaurants, hotels, and caterers post surplus food with freshness details and hygiene certification in under 60 seconds.',
    span: 'md:col-span-2',
  },
  {
    icon: Building2,
    title: 'NGO Discovery',
    description: 'NGOs browse a real-time feed of available food, filter by type, and claim listings with one click.',
    span: 'md:col-span-1',
  },
  {
    icon: Timer,
    title: '2-Hour Freshness Window',
    description: 'Every listing has a live countdown timer. Food must be claimed and delivered within 2 hours for maximum safety.',
    span: 'md:col-span-1',
  },
  {
    icon: Truck,
    title: 'Volunteer Delivery',
    description: 'Volunteers accept pickup tasks, navigate to donors, collect food, and deliver to NGOs — all tracked in real-time.',
    span: 'md:col-span-2',
  },
  {
    icon: ShieldCheck,
    title: 'Trust & Accountability',
    description: 'Every user has a trust score. Successful deliveries boost it; no-shows reduce it. Transparent and fair.',
    span: 'md:col-span-1',
  },
  {
    icon: BarChart3,
    title: 'Impact Analytics',
    description: 'Track meals saved, CO₂ prevented, communities fed, and volunteer hours — all on a real-time admin dashboard.',
    span: 'md:col-span-1',
  },
];

export default function FeatureBentoGrid() {
  return (
    <section id="features" className="py-24 md:py-32 bg-transparent border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-[var(--text-primary)] mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Save Food</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            A complete platform for surplus food redistribution — from posting to delivery, with real-time tracking and accountability.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${feature.span} p-8 md:p-12 rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent-primary)]/40 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(var(--accent-primary-rgb),0.15)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group backdrop-blur-xl`}
              >
                {/* Decorative Watermark Icon */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="w-48 h-48 text-[var(--accent-primary)] drop-shadow-2xl" />
                </div>

                {/* Ambient Background Glow on Hover */}
                <div className="absolute top-1/2 right-1/4 w-[200px] h-[200px] bg-[var(--accent-primary)]/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="relative z-10 h-full flex flex-col justify-end">
                  {/* Icon Block */}
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-8 group-hover:bg-[var(--accent-primary)]/10 transition-colors duration-500 shadow-inner border border-[var(--card-border)] relative">
                    <div className="absolute inset-0 bg-[var(--accent-primary)] opacity-0 group-hover:opacity-20 blur-xl rounded-2xl transition-opacity duration-500" />
                    <Icon className="w-8 h-8 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors relative z-10" />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-display font-semibold text-[var(--text-primary)] mb-4 tracking-tight group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[var(--text-primary)] group-hover:to-[var(--accent-primary)] transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-md">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
