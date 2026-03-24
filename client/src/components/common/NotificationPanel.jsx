import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Clock, Package, Truck, AlertCircle } from 'lucide-react';

const typeIcons = {
  claim: Package,
  delivery: Truck,
  alert: AlertCircle,
  default: Bell,
};

const typeColors = {
  claim: 'bg-blue-500/10 text-blue-500',
  delivery: 'bg-violet-500/10 text-violet-500',
  alert: 'bg-amber-500/10 text-amber-500',
  default: 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]',
};

export default function NotificationPanel({ isOpen, onClose, notifications = [] }) {
  const [readIds, setReadIds] = useState(new Set());

  const markRead = (id) => {
    setReadIds(prev => new Set([...prev, id]));
  };

  const markAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)));
  };

  const unread = notifications.filter(n => !readIds.has(n.id)).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--bg-primary)] border-l border-[var(--border-color)] shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[var(--accent-primary)]" />
                <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">Notifications</h2>
                {unread > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[var(--accent-primary)] font-medium hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--card-bg)] transition-colors">
                  <X className="w-5 h-5 text-[var(--text-tertiary)]" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Bell className="w-12 h-12 text-[var(--text-tertiary)] mb-3 opacity-40" />
                  <p className="text-sm text-[var(--text-tertiary)]">No notifications yet</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">You'll see updates about your donations and requests here.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-color)]">
                  {notifications.map(notif => {
                    const isRead = readIds.has(notif.id);
                    const Icon = typeIcons[notif.type] || typeIcons.default;
                    const colorClass = typeColors[notif.type] || typeColors.default;

                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => markRead(notif.id)}
                        className={`p-4 cursor-pointer hover:bg-[var(--accent-primary)]/[0.02] transition-colors ${
                          !isRead ? 'bg-[var(--accent-primary)]/[0.03]' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!isRead ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-2">{notif.message}</p>
                            <div className="flex items-center gap-1 mt-1.5">
                              <Clock className="w-3 h-3 text-[var(--text-tertiary)]" />
                              <span className="text-[10px] text-[var(--text-tertiary)]">{notif.time}</span>
                            </div>
                          </div>
                          {!isRead && (
                            <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] mt-2 flex-shrink-0" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
