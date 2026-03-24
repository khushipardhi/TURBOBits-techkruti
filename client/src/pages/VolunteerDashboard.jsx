import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, CheckCircle, MapPin, Phone, Navigation, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Footer from '../components/common/Footer';
import { useToast } from '../components/common/Toast';
import { getVolunteerTasks, getAvailableTasks, confirmPickup, confirmDelivery } from '../services/mockApi';
import { usePolling } from '../hooks/usePolling';
import { formatDateTime } from '../utils/formatters';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const { addToast } = useToast();

  const refresh = useCallback(async () => {
    try {
      const [mine, available] = await Promise.all([
        getVolunteerTasks(user?.user_id),
        getAvailableTasks(),
      ]);
      setMyTasks(mine);
      setAvailableTasks(available);
    } catch {}
  }, [user]);

  usePolling(refresh, 10000);

  const activeTasks = myTasks.filter((t) => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(t.status));
  const completedTasks = myTasks.filter((t) => t.status === 'DELIVERED');

  const handlePickup = async (deliveryId) => {
    setLoadingId(deliveryId);
    try {
      await confirmPickup(deliveryId);
      addToast('Pickup confirmed! Now deliver to the NGO.', 'success');
      refresh();
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoadingId(null); }
  };

  const handleDeliver = async (deliveryId) => {
    setLoadingId(deliveryId);
    try {
      await confirmDelivery(deliveryId);
      addToast('Delivery confirmed! Thank you for volunteering.', 'success');
      refresh();
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoadingId(null); }
  };

  const TaskCard = ({ task }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl hover:border-[var(--accent-primary)]/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <StatusBadge status={task.status} />
        <span className="text-xs text-[var(--text-tertiary)] font-mono">{formatDateTime(task.assigned_at)}</span>
      </div>

      <p className="font-display font-semibold text-[var(--text-primary)] mb-4">{task.food_description}</p>
      <p className="text-sm text-[var(--text-secondary)] mb-4">{task.quantity} servings</p>

      <div className="space-y-3 mb-5">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <div className="text-xs text-[var(--text-tertiary)] uppercase font-bold tracking-wider mb-1">📦 Pickup From</div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{task.donor_name}</p>
          <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {task.donor_address}</p>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <div className="text-xs text-[var(--text-tertiary)] uppercase font-bold tracking-wider mb-1">🏢 Deliver To</div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{task.receiver_name}</p>
          <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {task.receiver_address}</p>
        </div>
      </div>

      {/* Action Buttons */}
      {task.status === 'ASSIGNED' && (
        <button onClick={() => handlePickup(task.delivery_id)} disabled={loadingId === task.delivery_id}
          className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
          {loadingId === task.delivery_id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Package className="w-4 h-4" /> Confirm Pickup</>}
        </button>
      )}
      {task.status === 'PICKED_UP' && (
        <button onClick={() => handleDeliver(task.delivery_id)} disabled={loadingId === task.delivery_id}
          className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
          {loadingId === task.delivery_id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Confirm Delivery</>}
        </button>
      )}
      {task.status === 'DELIVERED' && (
        <div className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-500 font-semibold text-center text-sm flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" /> Delivered Successfully
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">
            Welcome, <span className="gradient-text">{user?.name || 'Volunteer'}</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your delivery tasks</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Truck} title="Active Tasks" value={activeTasks.length} delay={0} />
          <StatCard icon={CheckCircle} title="Completed" value={completedTasks.length} delay={0.1} />
          <StatCard icon={Navigation} title="Available Tasks" value={availableTasks.length} delay={0.2} />
        </div>

        {/* Active Tasks */}
        <div className="mb-8">
          <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-4">My Active Tasks</h2>
          {activeTasks.length === 0 ? (
            <EmptyState icon={Truck} title="No active tasks" description="Accept a delivery task from the available list." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTasks.map((task) => <TaskCard key={task.delivery_id} task={task} />)}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-4">Delivery History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedTasks.map((task) => <TaskCard key={task.delivery_id} task={task} />)}
            </div>
          </div>
        )}
      </div>
      <div className="mt-12"><Footer /></div>
    </div>
  );
}
