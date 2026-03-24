import { useState, useCallback } from 'react';
import { UtensilsCrossed, Truck, Users, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import FoodFeed from '../components/ngo/FoodFeed';
import RequestHistory from '../components/ngo/RequestHistory';
import Footer from '../components/common/Footer';
import { getAvailableFood, getReceiverRequests } from '../services/api';
import { usePolling } from '../hooks/usePolling';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [availableFood, setAvailableFood] = useState([]);
  const [requests, setRequests] = useState([]);

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
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">
            Welcome, <span className="gradient-text">{user?.name || 'NGO'}</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Browse and claim surplus food for your community</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={UtensilsCrossed} title="Available Now" value={availableFood.length} delay={0} />
          <StatCard icon={Users} title="Meals Received" value={totalServings} delay={0.1} />
          <StatCard icon={Truck} title="Active Deliveries" value={requests.filter((r) => r.request_status === 'APPROVED').length} delay={0.2} />
          <StatCard icon={Leaf} title="CO₂ Saved (kg)" value={(totalServings * 2.5).toFixed(1)} delay={0.3} />
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
