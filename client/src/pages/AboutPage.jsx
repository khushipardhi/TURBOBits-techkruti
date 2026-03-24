import { motion } from 'framer-motion';
import { Heart, Users, Leaf, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/common/Footer';

const values = [
  { icon: Heart, title: 'Zero Hunger', desc: 'Every meal matters. We connect surplus food with people who need it most, ensuring nothing goes to waste.' },
  { icon: Users, title: 'Community First', desc: 'We bring together restaurants, NGOs, and volunteers into one seamless ecosystem of giving.' },
  { icon: Leaf, title: 'Sustainability', desc: 'Each donation prevents food waste and reduces CO₂ emissions — measurably and transparently.' },
  { icon: Target, title: 'Transparency', desc: 'Real-time tracking, trust scores, and complete visibility from donation to delivery.' },
];

const team = [
  { name: 'TURBOBits', role: 'Development Team', emoji: '⚡' },
  { name: 'Techkruti', role: 'Event Partner', emoji: '🏆' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] global-grid-bg pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-bold tracking-wider uppercase mb-4">
            About Us
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)] tracking-tight mb-4">
            Rescuing Food. <span className="gradient-text">Feeding Hope.</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            FoodLink is a real-time surplus food redistribution platform that connects donors, NGOs, and delivery volunteers to ensure no meal goes to waste.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="p-8 rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[var(--accent-primary)]/10 blur-[100px] rounded-full" />
          <div className="relative z-10">
            <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3">Our Mission</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
              In India alone, 40% of food produced is wasted while 190 million go hungry daily. FoodLink bridges this gap with technology — enabling restaurants, hotels, and caterers to donate surplus food to verified NGOs and food banks within a 2-hour freshness window, delivered by community volunteers.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl hover:border-[var(--accent-primary)]/30 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[var(--accent-primary)]/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <v.icon className="w-6 h-6 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[var(--text-primary)] mb-1">{v.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{v.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-6">Built By</h2>
          <div className="flex flex-wrap justify-center gap-5">
            {team.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl w-52 text-center">
                <div className="text-4xl mb-3">{t.emoji}</div>
                <h3 className="font-display font-bold text-[var(--text-primary)]">{t.name}</h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">{t.role}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--accent-primary-rgb),0.23)] hover:-translate-y-1 transition-all bg-[var(--accent-primary)]">
            Join FoodLink <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
      <div className="mt-12"><Footer /></div>
    </div>
  );
}
