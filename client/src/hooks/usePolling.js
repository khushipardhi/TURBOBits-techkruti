import { useEffect, useRef } from 'react';

/**
 * usePolling — calls `callback` immediately then every `intervalMs`
 * - Pauses when tab is hidden (saves bandwidth)
 * - Cleans up on unmount
 * - Stable: handles callback reference changes without restarting timer
 *
 * @param {Function} callback - async function to call on each tick
 * @param {number} intervalMs - poll interval in ms (default 5000 = 5s)
 */
export function usePolling(callback, intervalMs = 5000) {
  const savedCallback = useRef(callback);

  // Always store the latest callback without restarting interval
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let timerId = null;
    let isMounted = true;

    const tick = () => {
      // Skip if tab is hidden (don't waste requests)
      if (document.visibilityState === 'hidden') return;
      if (isMounted) {
        savedCallback.current();
      }
    };

    // Immediate first call
    tick();

    // Set up interval
    timerId = setInterval(tick, intervalMs);

    // Resume polling when tab becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        tick(); // immediate refresh on tab focus
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs]);
}
