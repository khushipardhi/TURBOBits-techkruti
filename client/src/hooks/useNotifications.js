/**
 * useNotifications — polls for unread events and shows toasts
 * Tracks:
 *  - Donors: new pending requests count
 *  - NGO: new available food count
 *  - Volunteer: new available tasks
 *
 * Returns { count } for the notification bell badge.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDonorRequests, getAvailableFood, getAvailableTasks } from '../services/api';

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);
  const prevRef = useRef(null);

  const check = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      if (user.role === 'DONOR') {
        const requests = await getDonorRequests();
        const pending = (requests || []).filter((r) => r.request_status === 'PENDING').length;
        if (prevRef.current !== null && pending > prevRef.current) {
          setCount(pending);
        } else {
          setCount(pending);
        }
        prevRef.current = pending;
      } else if (user.role === 'RECEIVER') {
        const food = await getAvailableFood();
        const available = (food || []).length;
        setCount(available);
        prevRef.current = available;
      } else if (user.role === 'VOLUNTEER') {
        const tasks = await getAvailableTasks();
        const available = (tasks || []).length;
        setCount(available);
        prevRef.current = available;
      }
    } catch {
      // Silently ignore — don't spam errors for notification polling
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) { setCount(0); return; }
    check();
    const id = setInterval(check, 8000);
    return () => clearInterval(id);
  }, [check, isAuthenticated]);

  return { count };
}
