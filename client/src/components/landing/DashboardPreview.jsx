import { motion } from 'framer-motion';

const mockStats = [
  { label: 'Available Now', value: '12', color: 'text-emerald-500' },
  { label: 'Claimed Today', value: '8', color: 'text-blue-500' },
  { label: 'Delivered', value: '23', color: 'text-purple-500' },
  { label: 'Expired', value: '2', color: 'text-red-400' },
];

const mockListings = [
  { id: 1, name: 'Paneer Biryani & Dal', donor: 'Taj Hotel', type: 'VEG', qty: 50, time: '1h 42m', status: 'available' },
  { id: 2, name: 'Chicken Burgers & Fries', donor: 'McDonald\'s', type: 'NON-VEG', qty: 30, time: '52m', status: 'available' },
  { id: 3, name: 'Assorted Buffet Items', donor: 'ITC Grand', type: 'MIXED', qty: 80, time: '28m', status: 'claimed' },
  { id: 4, name: 'Idli, Dosa, Sambar', donor: 'Saravana Bhavan', type: 'VEG', qty: 40, time: '1h 05m', status: 'available' },
];

const typeColors = {
  VEG: 'bg-green-500',
  'NON-VEG': 'bg-red-500',
  MIXED: 'bg-orange-500',
};

export default function DashboardPreview() {
  return (
    <section className="py-24 md:py-32 bg-transparent border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-[var(--text-primary)] mb-4">
            Powerful{' '}
            <span className="gradient-text">Dashboard</span>{' '}
            for Every Role
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Real-time insights, live countdowns, and one-click actions — designed for speed when every minute counts.
          </p>
        </motion.div>

        {/* Dashboard Preview with MacOS Frame */}
        <div className="dashboard-preview-wrapper">
          <div className="dashboard-preview-scale w-full max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring', bounce: 0.2 }}
            >
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-[2rem] border border-gray-200 dark:border-gray-700 bg-[#F8FAFC] dark:bg-[#0a0a0a] shadow-2xl overflow-hidden flex flex-col relative"
              >
                {/* MacOS Header bar */}
                <div className="h-10 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-400 font-mono">foodlink.app — NGO Dashboard</span>
                  </div>
                </div>

                {/* App Header */}
                <div className="bg-white dark:bg-[#111] px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 tracking-tighter font-display">
                    Food<span className="text-emerald-500">Link</span>
                  </h2>
                  {/* Pill Navigation */}
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 gap-1">
                    {['Available', 'My Claims', 'History'].map((tab, i) => (
                      <div
                        key={tab}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          i === 0
                            ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {tab}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-gray-500">Live</span>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 bg-[#F8FAFC] dark:bg-[#0a0a0a]">
                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {mockStats.map((stat, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
                      >
                        <div className={`text-2xl font-bold font-display ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Food Listings Table */}
                  <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Available Surplus Food</span>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                      {mockListings.map((item) => (
                        <div key={item.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-2 h-2 rounded-full ${typeColors[item.type]}`} />
                            <div>
                              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</div>
                              <div className="text-xs text-gray-400">{item.donor}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500 font-mono">{item.qty} servings</span>
                            <span className={`text-xs font-mono font-semibold ${
                              parseInt(item.time) < 30 ? 'text-red-500' : 'text-amber-500'
                            }`}>
                              ⏱ {item.time}
                            </span>
                            <button className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                              item.status === 'available'
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}>
                              {item.status === 'available' ? 'Claim' : 'Claimed'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
