import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import Footer from '../components/common/Footer';
import { useToast } from '../components/common/Toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      return addToast('Please fill in all required fields', 'error');
    }
    setLoading(true);
    // Simulate send (replace with EmailJS or backend endpoint)
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    addToast('Message sent successfully!', 'success');
    setLoading(false);
  };

  const inputClass = 'w-full p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all';

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'support@foodlink.app' },
    { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
    { icon: MapPin, label: 'Location', value: 'India' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] global-grid-bg pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-bold tracking-wider uppercase mb-4">
            Contact
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)] tracking-tight mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Have questions about FoodLink? Want to partner with us? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {contactInfo.map((info, i) => (
            <motion.div
              key={info.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl text-center hover:border-[var(--accent-primary)]/30 transition-all duration-500 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--accent-primary)]/20 transition-colors">
                <info.icon className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
              <h3 className="font-display font-bold text-[var(--text-primary)] text-sm mb-1">{info.label}</h3>
              <p className="text-xs text-[var(--text-secondary)]">{info.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="p-8 rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[var(--accent-primary)]/10 blur-[100px] rounded-full" />

          {sent ? (
            <div className="relative z-10 text-center py-12">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">Message Sent!</h3>
              <p className="text-[var(--text-secondary)]">We'll get back to you within 24 hours.</p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                className="mt-6 px-6 py-3 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-semibold text-sm hover:bg-[var(--accent-primary)]/20 transition-all">
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-[var(--accent-primary)]" />
                <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">Send a Message</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input type="text" placeholder="Your Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
                <input type="email" placeholder="Your Email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} />
              </div>
              <input type="text" placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={inputClass} />
              <textarea placeholder="Your Message *" rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className={`${inputClass} resize-none`} />
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white font-semibold shadow-[0_4px_14px_0_rgba(var(--accent-primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--accent-primary-rgb),0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Send Message</>}
              </button>
            </form>
          )}
        </motion.div>
      </div>
      <div className="mt-12"><Footer /></div>
    </div>
  );
}
