import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, UtensilsCrossed, Truck, ShieldAlert, Leaf, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Footer from '../components/common/Footer';
import { getAdminStats, getAllUsers, getTrustLogs } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { formatDateTime } from '../utils/formatters';

const trustActionLabels = {
  DONATION_COMPLETE: { label: 'Donation Complete', color: 'text-emerald-500' },
  PICKUP_COMPLETE: { label: 'Pickup Complete', color: 'text-blue-500' },
  DELIVERY_COMPLETE: { label: 'Delivery Complete', color: 'text-purple-500' },
  NO_SHOW: { label: 'No Show', color: 'text-red-500' },
  CANCELLED: { label: 'Cancelled', color: 'text-orange-500' },
  REPORTED: { label: 'Reported', color: 'text-red-600' },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [trustLogs, setTrustLogs] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const [s, u, t] = await Promise.all([getAdminStats(), getAllUsers(), getTrustLogs()]);
      setStats(s || {});
      setUsers(u || []);
      setTrustLogs(t || []);
    } catch (err) {
      console.error('AdminDashboard refresh error:', err.message);
    }
  }, []);

  usePolling(refresh, 10000);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] global-grid-bg pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={UtensilsCrossed} title="Meals Saved" value={stats.totalMealsSaved || 0} trend={12} delay={0} />
          <StatCard icon={Users} title="Active Donors" value={stats.activeDonors || 0} delay={0.1} />
          <StatCard icon={Truck} title="Active Volunteers" value={stats.activeVolunteers || 0} delay={0.2} />
          <StatCard icon={Leaf} title="CO₂ Saved (kg)" value={stats.co2Saved || 0} trend={8} delay={0.3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={BarChart3} title="Total Listings" value={stats.totalListings || 0} delay={0.4} />
            <StatCard icon={TrendingUp} title="Available Now" value={stats.availableNow || 0} delay={0.5} />
            <StatCard icon={ShieldAlert} title="Trust Issues" value={stats.trustIssues || 0} delay={0.6} />
            <StatCard icon={AlertTriangle} title="NGO Partners" value={stats.activeReceivers || 0} delay={0.7} />
          </div>

          {/* Trust Logs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl overflow-hidden"
          >
            <div className="p-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Trust Score Logs</h3>
            </div>
            <div className="divide-y divide-[var(--border-color)] max-h-[300px] overflow-y-auto">
              {trustLogs.map((log) => {
                const action = trustActionLabels[log.action] || { label: log.action, color: 'text-gray-500' };
                return (
                  <div key={log.log_id} className="p-4 flex items-center justify-between gap-3 hover:bg-[var(--accent-primary)]/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{log.user_name}</p>
                      <p className={`text-xs font-semibold ${action.color}`}>{action.label}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${log.delta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {log.delta > 0 ? '+' : ''}{log.delta}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">→ {log.new_score}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* User Management Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl overflow-hidden"
        >
          <div className="p-6 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">User Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left">
                  <th className="p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Role</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Trust</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-[var(--accent-primary)]/[0.02] transition-colors">
                    <td className="p-4 font-medium text-[var(--text-primary)]">{u.name}</td>
                    <td className="p-4"><StatusBadge status={u.role} /></td>
                    <td className="p-4 text-[var(--text-secondary)]">{u.email}</td>
                    <td className="p-4">
                      <span className={`font-mono font-bold ${u.trust_score >= 7 ? 'text-emerald-500' : u.trust_score >= 5 ? 'text-amber-500' : 'text-red-500'}`}>
                        {u.trust_score != null ? Number(u.trust_score).toFixed(1) : '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${u.is_active ? 'text-emerald-500' : 'text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {u.is_active ? 'Active' : 'Banned'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      <div className="mt-12"><Footer /></div>
    </div>
  );
}
