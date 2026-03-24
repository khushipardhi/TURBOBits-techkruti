/**
 * Format a date to a readable string
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date to time string
 */
export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date to full datetime string
 */
export function formatDateTime(dateStr) {
  return `${formatDate(dateStr)}, ${formatTime(dateStr)}`;
}

/**
 * Get time remaining from now to a target date
 */
export function getTimeRemaining(expiresAt) {
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return { expired: true, minutes: 0, seconds: 0 };

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { expired: false, minutes, seconds };
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count, singular, plural) {
  return count === 1 ? singular : (plural || `${singular}s`);
}
