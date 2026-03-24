import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, CheckCircle, MapPin, Navigation, Clock, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Footer from '../components/common/Footer';
import { useToast } from '../components/common/Toast';
import {
  getVolunteerTasks,
  getAvailableTasks,
  acceptTask,
  confirmPickup,
  confirmDelivery,
} from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { formatDateTime } from '../utils/formatters';

function TaskCard({ task, onAction, loadingId }) {
  const isLoading = loadingId === (task.delivery_id || task.request_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl hover:border-[var(--accent-primary)]/30 transition-all duration-300 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[var(--accent-primary)]/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <StatusBadge status={task.status || 'APPROVED'} />
          <span className="text-xs text-[var(--text-tertiary)] font-mono">
            {formatDateTime(task.assigned_at || task.created_at)}
          </span>
        </div>

        <p className="font-display font-semibold text-[var(--text-primary)] mb-1">{task.food_description}</p>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{task.quantity} servings</p>

        {/* Pickup / Delivery addresses */}
        <div className="space-y-2 mb-5">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider mb-1">📦 Pickup From</div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{task.donor_name}</p>
            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {task.donor_address || task.pickup_address || 'Address provided on accept'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider mb-1">🏢 Deliver To</div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{task.receiver_name}</p>
            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {task.receiver_address || 'Receiver address'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {onAction && (
          <button
            onClick={onAction}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm
              ${task.status === 'ASSIGNED' || !task.status
                ? 'bg-blue-500 hover:bg-blue-600'
                : task.status === 'PICKED_UP'
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-[var(--accent-primary)] hover:opacity-90'
              }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : task.status === 'APPROVED' ? (
              <><Navigation className="w-4 h-4" /> Accept Task</>
            ) : task.status === 'ASSIGNED' ? (
              <><Package className="w-4 h-4" /> Confirm Pickup</>
            ) : task.status === 'PICKED_UP' ? (
              <><CheckCircle className="w-4 h-4" /> Confirm Delivery</>
            ) : null}
          </button>
        )}

        {task.status === 'DELIVERED' && (
          <div className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-500 font-semibold text-center text-sm flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Delivered Successfully
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const { addToast } = useToast();

  const refresh = useCallback(async () => {
    try {
      const [mine, available] = await Promise.all([
        getVolunteerTasks(),
        getAvailableTasks(),
      ]);
      setMyTasks(mine || []);
      setAvailableTasks(available || []);
    } catch (err) {
      console.error('Volunteer refresh failed:', err.message);
    }
  }, []);

  usePolling(refresh, 5000);

  const activeTasks = myTasks.filter((t) =>
    ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(t.status)
  );
  const completedTasks = myTasks.filter((t) => t.status === 'DELIVERED');

  const handleAcceptTask = async (requestId) => {
    setLoadingId(requestId);
    try {
      await acceptTask(requestId);
      addToast('Task accepted! Head to the pickup location.', 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handlePickup = async (deliveryId) => {
    setLoadingId(deliveryId);
    try {
      await confirmPickup(deliveryId);
      addToast('Pickup confirmed! Now deliver to the NGO.', 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeliver = async (deliveryId) => {
    setLoadingId(deliveryId);
    try {
      await confirmDelivery(deliveryId);
      addToast('Delivery confirmed! Thank you for volunteering 🎉', 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">
            Welcome, <span className="gradient-text">{user?.name || 'Volunteer'}</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Accept and fulfill delivery tasks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Truck} title="Active Tasks" value={activeTasks.length} delay={0} />
          <StatCard icon={CheckCircle} title="Completed" value={completedTasks.length} delay={0.1} />
          <StatCard icon={Navigation} title="Available" value={availableTasks.length} delay={0.2} />
        </div>

        {/* Available Tasks (tasks waiting to be accepted) */}
        {availableTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <List className="w-5 h-5 text-[var(--accent-primary)]" />
              Available Tasks
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-bold">
                {availableTasks.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableTasks.map((task) => (
                <TaskCard
                  key={task.request_id}
                  task={{ ...task, status: 'APPROVED' }}
                  onAction={() => handleAcceptTask(task.request_id)}
                  loadingId={loadingId}
                />
              ))}
            </div>
          </div>
        )}

        {/* My Active Tasks */}
        <div className="mb-8">
          <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[var(--accent-primary)]" />
            My Active Tasks
          </h2>
          {activeTasks.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No active tasks"
              description="Accept a task from the available list above to start delivering."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTasks.map((task) => (
                <TaskCard
                  key={task.delivery_id}
                  task={task}
                  onAction={
                    task.status === 'ASSIGNED'
                      ? () => handlePickup(task.delivery_id)
                      : task.status === 'PICKED_UP'
                      ? () => handleDeliver(task.delivery_id)
                      : null
                  }
                  loadingId={loadingId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Deliveries */}
        {completedTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Delivery History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedTasks.map((task) => (
                <TaskCard key={task.delivery_id} task={task} loadingId={null} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-12"><Footer /></div>
    </div>
  );
}
