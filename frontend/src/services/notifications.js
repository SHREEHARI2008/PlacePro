/**
 * notifications.js - Modular Notification Service for PlacePro
 * Uses native fetch() API for asynchronous polling, event dispatching, and tab filtering.
 */

const API_BASE = '/api/notifications';

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const saved = localStorage.getItem('cpms_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.token) {
        headers['Authorization'] = `Bearer ${parsed.token}`;
        headers['X-Session-Token'] = parsed.token;
      }
    }
  } catch (err) {
    console.error('Error reading auth headers:', err);
  }
  return headers;
}

/**
 * Fetch all notifications and unread count asynchronously using fetch().
 */
export async function fetchNotifications(userId, studentId) {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (studentId) params.append('studentId', studentId);

  const url = `${API_BASE}${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: HTTP ${response.status}`);
  }

  const json = await response.json();
  return {
    notifications: json.data?.notifications || [],
    unreadCount: json.data?.unreadCount || 0,
  };
}

/**
 * Mark a single notification alert as read.
 */
export async function markNotificationAsRead(notificationId) {
  const response = await fetch(`${API_BASE}/read`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ notificationId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to mark notification as read: HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Mark all notifications for the user as read.
 */
export async function markAllNotificationsAsRead(userId) {
  const response = await fetch(`${API_BASE}/read-all`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to mark all notifications as read: HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Filter notifications array by tab category.
 * Supported tabs: 'ALL', 'MENTOR_FEEDBACK', 'DRIVE_UPDATE', 'DRIVE_STATUS'
 */
export function filterNotificationsByTab(notifications, tab) {
  if (!notifications || !Array.isArray(notifications)) return [];
  if (!tab || tab === 'ALL') return notifications;
  if (tab === 'DRIVE_UPDATE') {
    return notifications.filter((n) => n.category === 'DRIVE_UPDATE' || n.category === 'Placement Drive Updation');
  }
  return notifications.filter((n) => n.category === tab);
}

/**
 * Calculate relative human-readable timestamp (e.g. "Just now", "10 mins ago", "2 hours ago").
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'mins'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
