import { useState, useCallback } from 'react';
import { UtensilsCrossed, Truck, Users, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import FoodFeed from '../components/ngo/FoodFeed';
import RequestHistory from '../components/ngo/RequestHistory';
import AutoAcceptToggle from '../components/ngo/AutoAcceptToggle';
import Footer from '../components/common/Footer';
import { getAvailableFood, getReceiverRequests } from '../services/api';
import { usePolling } from '../hooks/usePolling';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [availableFood, setAvailableFood] = useState([]);
  const [requests, setRequests] = useState([]);
  const [autoAccept, setAutoAccept] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [food, reqs] = await Promise.all([
        getAvailableFood(),
        getReceiverRequests(),
      ]);
      setAvailableFood(food || []);
      setRequests(reqs || []);
    } catch (err) {
      console.error('NgoDashboard refresh error:', err.message);
    }
  }, []);

  usePolling(refresh, 5000);

  const fulfilled = requests.filter((r) => r.request_status === 'FULFILLED');
  const totalServings = fulfilled.reduce((sum, r) => sum + (r.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] global-grid-bg pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">
              Welcome, <span className="gradient-text">{user?.name || 'NGO'}</span>
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">Browse and claim surplus food for your community</p>
          </div>
          {autoAccept && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Auto Mode ON</span>
            </div>
          )}
        </div>

        {/* Stats + Auto-Accept */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard icon={UtensilsCrossed} title="Available Now" value={availableFood.length} delay={0} />
          <StatCard icon={Users} title="Meals Received" value={totalServings} delay={0.1} />
          <StatCard icon={Truck} title="Active Deliveries" value={requests.filter((r) => r.request_status === 'APPROVED').length} delay={0.2} />
          <StatCard icon={Leaf} title="CO₂ Saved (kg)" value={(totalServings * 2.5).toFixed(1)} delay={0.3} />
          <AutoAcceptToggle
            enabled={autoAccept}
            onToggle={setAutoAccept}
            pinCode={user?.pin_code}
          />
        </div>

        {/* Available Food Feed */}
        <div className="mb-8">
          <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-4">Available Surplus Food</h2>
          <FoodFeed listings={availableFood} receiverId={user?.user_id} onClaimed={refresh} />
        </div>

        {/* Request History */}
        <RequestHistory requests={requests} />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
