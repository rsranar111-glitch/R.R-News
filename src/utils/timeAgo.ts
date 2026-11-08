/**
 * Format dynamic relative time ago from timestamps or ISO dates
 */
export function formatTimeAgo(timestampOrDate?: number | string | Date): string {
  if (!timestampOrDate) return 'Just now';
  
  let timeMs: number;
  if (typeof timestampOrDate === 'number') {
    timeMs = timestampOrDate;
  } else if (timestampOrDate instanceof Date) {
    timeMs = timestampOrDate.getTime();
  } else if (typeof timestampOrDate === 'string') {
    const parsed = Date.parse(timestampOrDate);
    if (isNaN(parsed)) {
      // Return custom non-date labels like 'Live Search Result'
      return timestampOrDate;
    }
    timeMs = parsed;
  } else {
    return 'Just now';
  }

  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - timeMs) / 1000));

  if (diffSec < 45) {
    return 'Just now';
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return new Date(timeMs).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
