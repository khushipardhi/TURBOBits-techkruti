import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export default function CountdownTimer({ expiresAt, className }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgency, setUrgency] = useState('normal'); // normal, warning, critical, expired

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        setUrgency('expired');
        return false;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs}s`);

      if (mins < 5) setUrgency('critical');
      else if (mins < 15) setUrgency('warning');
      else if (mins < 60) setUrgency('caution');
      else setUrgency('normal');

      return true;
    };

    update();
    const timer = setInterval(() => {
      if (!update()) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const urgencyStyles = {
    normal: 'text-emerald-500',
    caution: 'text-amber-500',
    warning: 'text-orange-500',
    critical: 'text-red-500 animate-pulse',
    expired: 'text-gray-500 line-through',
  };

  return (
    <span className={cn('font-mono text-sm font-semibold', urgencyStyles[urgency], className)}>
      {urgency !== 'expired' && '⏱ '}
      {timeLeft}
    </span>
  );
}
