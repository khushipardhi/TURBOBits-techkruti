import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToPush } from '../services/api';

// ============================================================
// VAPID Public Key — read from Vite env variable
// Set VITE_VAPID_PUBLIC_KEY in your .env.local or Vercel env vars
// ============================================================
const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'BK2Fl1jQ43gySP6hWN8Dr9hk_P5_ky62tFlL7FjkunCYhwDaoVjLw1VgWX4Gd8zAaDOxK7hrczsxaHn6LF-gDKQ';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { isAuthenticated } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!('serviceWorker' in navigator)) {
      console.warn('[Push] Service Workers not supported in this browser.');
      return;
    }
    if (!('PushManager' in window)) {
      console.warn('[Push] PushManager not supported in this browser.');
      return;
    }

    const setupPush = async () => {
      try {
        console.log('[Push] Registering service worker...');
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('[Push] Service worker registered:', registration.scope);

        // Wait until SW is fully active
        await navigator.serviceWorker.ready;
        console.log('[Push] Service worker is ready.');

        // Request notification permission
        const permission = await Notification.requestPermission();
        console.log('[Push] Notification permission:', permission);
        if (permission !== 'granted') {
          console.warn('[Push] Permission denied. Cannot subscribe.');
          return;
        }

        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          console.log('[Push] Already subscribed:', subscription.endpoint);
          setIsSubscribed(true);
          return;
        }

        // Create new subscription
        console.log('[Push] Subscribing with VAPID key...');
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        console.log('[Push] Subscribed successfully:', subscription.endpoint);

        // Send subscription to backend
        await subscribeToPush(subscription);
        console.log('[Push] Subscription saved to backend.');

        setIsSubscribed(true);
      } catch (error) {
        console.error('[Push] Setup failed:', error);
      }
    };

    setupPush();
  }, [isAuthenticated]);

  return { isSubscribed };
}
