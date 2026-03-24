import { useState, useCallback } from 'react';
import { UtensilsCrossed, ListChecks, Bell, History, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import PostFoodForm from '../components/donor/PostFoodForm';
import ActiveListings from '../components/donor/ActiveListings';
import IncomingRequests from '../components/donor/IncomingRequests';
import DonationHistory from '../components/donor/DonationHistory';
import Footer from '../components/common/Footer';
import { getDonorListings, getDonorRequests } from '../services/api';
import { usePolling } from '../hooks/usePolling';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const [l, r] = await Promise.all([
        getDonorListings(),
        getDonorRequests(),
      ]);
      setListings(l || []);
      setRequests(r || []);
    } catch (err) {
      console.error('DonorDashboard refresh error:', err.message);
    }
  }, []);

  usePolling(refresh, 5000);

  const active = listings.filter((l) => ['AVAILABLE', 'REQUESTED', 'ACCEPTED'].includes(l.status));
  const fulfilled = listings.filter((l) => l.status === 'FULFILLED');
  const pending = requests.filter((r) => r.request_status === 'PENDING');
  const totalMealsSaved = fulfilled.reduce((sum, l) => sum + (l.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] global-grid-bg pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">
            Welcome, <span className="gradient-text">{user?.name || 'Donor'}</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your surplus food donations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={UtensilsCrossed} title="Active Listings" value={active.length} delay={0} />
          <StatCard icon={ListChecks} title="Donations Fulfilled" value={fulfilled.length} delay={0.1} />
          <StatCard icon={Bell} title="Pending Requests" value={pending.length} delay={0.2} />
          <StatCard icon={Leaf} title="CO₂ Saved (kg)" value={(totalMealsSaved * 2.5).toFixed(1)} delay={0.3} />
        </div>

        {/* Post Food Form + Active Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PostFoodForm onPosted={refresh} />
          <ActiveListings listings={listings} onRefresh={refresh} />
        </div>

        {/* Incoming Requests */}
        <div className="mb-6">
          <IncomingRequests requests={requests} onUpdate={refresh} />
        </div>

        {/* Donation History */}
        <DonationHistory listings={listings} />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
