import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToPush } from '../services/api';

const VAPID_PUBLIC_KEY = 'BPmHE9f3ilc2QyWI80BbylO-NW7nf78XqOBbH-TG9Jo0E2s_hqlIvpcWIaZOyncW4lZ4KBbNfv_Zd8gswxfVGyU';

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
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const setupPush = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          
          // Send to backend
          await subscribeToPush(subscription);
        }
        setIsSubscribed(true);
      } catch (error) {
        console.error('Push setup failed:', error);
      }
    };

    setupPush();
  }, [isAuthenticated]);

  return { isSubscribed };
}
