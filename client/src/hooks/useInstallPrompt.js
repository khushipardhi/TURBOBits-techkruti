import { useState, useEffect } from 'react';

/**
 * Hook to capture the PWA "beforeinstallprompt" event.
 * Returns { canInstall, promptInstall }.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      console.log('[PWA] Install prompt captured.');
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If already installed, hide the button
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed.');
      setCanInstall(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Install outcome:', outcome);
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  return { canInstall, promptInstall };
}
