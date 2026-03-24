import { Link } from 'react-router-dom';
import { Heart, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  Platform: [
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Features', path: '/#features' },
    { name: 'For Donors', path: '/register' },
    { name: 'For NGOs', path: '/register' },
  ],
  Resources: [
    { name: 'Documentation', path: '#' },
    { name: 'API Reference', path: '#' },
    { name: 'Trust & Safety', path: '#' },
    { name: 'Impact Reports', path: '#' },
  ],
  Company: [
    { name: 'About Us', path: '#' },
    { name: 'Contact', path: '#' },
    { name: 'Privacy Policy', path: '#' },
    { name: 'Terms of Service', path: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-primary)]/50 backdrop-blur-md border-t border-[var(--border-color)] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <div className="font-display font-bold text-xl tracking-tight text-[var(--text-primary)]">
                Food<span className="gradient-text">Link</span>
              </div>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs">
              Connecting surplus food with those who need it most. Reducing waste, feeding communities, saving the planet.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4 tracking-wide uppercase">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border-color)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-tertiary)]">
            © {new Date().getFullYear()} FoodLink. Built with{' '}
            <Heart className="w-3 h-3 inline text-red-500 fill-red-500" /> for a hunger-free world.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-[var(--text-tertiary)]">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
