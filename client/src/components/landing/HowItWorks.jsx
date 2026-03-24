import { motion } from 'framer-motion';
import { Utensils, Search, Truck, PartyPopper } from 'lucide-react';

const steps = [
  {
    icon: Utensils,
    title: 'Donor Posts Food',
    description: 'Restaurant or caterer posts surplus food with details, quantity, and hygiene certification.',
    step: '01',
  },
  {
    icon: Search,
    title: 'NGO Claims Listing',
    description: 'NGOs browse real-time feed and claim available food with one click before it expires.',
    step: '02',
  },
  {
    icon: Truck,
    title: 'Volunteer Delivers',
    description: 'A matched volunteer picks up from donor and delivers to the NGO location.',
    step: '03',
  },
  {
    icon: PartyPopper,
    title: 'Community Fed',
    description: 'Food reaches those who need it within 2 hours. Trust scores updated. Impact tracked.',
    step: '04',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-transparent border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-[var(--text-primary)] mb-4">
            How{' '}
            <span className="gradient-text">FoodLink</span>{' '}
            Works
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            From surplus to served — in four simple steps and under two hours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center group"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[var(--accent-primary)]/20 to-transparent" />
                )}

                <div className="w-24 h-24 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl flex items-center justify-center mx-auto mb-6 group-hover:border-[var(--accent-primary)]/40 group-hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[var(--accent-primary)] opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500" />
                  <Icon className="w-10 h-10 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors relative z-10" />
                </div>

                <span className="font-mono text-xs text-[var(--accent-primary)] font-bold tracking-widest mb-2 block">
                  STEP {step.step}
                </span>
                <h3 className="text-xl font-display font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[240px] mx-auto">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
