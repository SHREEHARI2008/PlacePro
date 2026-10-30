import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  filterNotificationsByTab,
  formatRelativeTime
} from '../services/notifications';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  Building2,
  Milestone,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  ChevronRight,
  Inbox
} from 'lucide-react';

export default function NotificationPanel() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const panelRef = useRef(null);

  const loadNotifications = async (silent = false) => {
    if (!user) return;
    try {
      if (!silent) setLoading(true);
      const data = await fetchNotifications(user.userId, user.studentId);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load + periodic polling every 20 seconds for real-time live alerts
  useEffect(() => {
    loadNotifications(true);
    const interval = setInterval(() => {
      loadNotifications(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      loadNotifications(false);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notif.notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      try {
        await markNotificationAsRead(notif.notificationId);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead(user?.userId);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      loadNotifications(true);
    }
  };

  const filtered = filterNotificationsByTab(notifications, activeTab);

  const getCategoryMeta = (category) => {
    switch (category) {
      case 'MENTOR_FEEDBACK':
        return {
          label: 'Mentor Feedback',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <MessageSquare className="w-3.5 h-3.5 text-purple-600" />,
          accentDot: 'bg-purple-500',
        };
      case 'DRIVE_UPDATE':
      case 'Placement Drive Updation':
        return {
          label: 'Drive Updation',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Building2 className="w-3.5 h-3.5 text-blue-600" />,
          accentDot: 'bg-blue-500',
        };
      case 'DRIVE_STATUS':
        return {
          label: 'Status Updation',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Milestone className="w-3.5 h-3.5 text-emerald-600" />,
          accentDot: 'bg-emerald-500',
        };
      default:
        return {
          label: 'Notice',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Sparkles className="w-3.5 h-3.5 text-slate-500" />,
          accentDot: 'bg-slate-400',
        };
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All', count: notifications.length },
    {
      id: 'MENTOR_FEEDBACK',
      label: 'Mentor Feedback',
      count: notifications.filter((n) => n.category === 'MENTOR_FEEDBACK').length,
    },
    {
      id: 'DRIVE_UPDATE',
      label: 'Drive Updates',
      count: notifications.filter((n) => n.category === 'DRIVE_UPDATE' || n.category === 'Placement Drive Updation').length,
    },
    {
      id: 'DRIVE_STATUS',
      label: 'Status Updates',
      count: notifications.filter((n) => n.category === 'DRIVE_STATUS').length,
    },
  ];

  return (
    <div className="relative" ref={panelRef}>
      {/* Navbar Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/30"
        title="View Notifications"
        aria-label="Open Notifications Panel"
      >
        <Bell className="w-5 h-5" />

        {/* Live Red Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over / Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 md:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1a5cff] flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">Notifications</h3>
                <p className="text-[11px] text-slate-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread alert${unreadCount === 1 ? '' : 's'}`
                    : 'All caught up! No unread alerts'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1a5cff] hover:bg-blue-50 transition-colors flex items-center space-x-1"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center space-x-1 px-4 py-2 border-b border-slate-100 bg-white overflow-x-auto scrollbar-none text-xs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-[#0b1940] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <div className="w-6 h-6 border-2 border-[#1a5cff] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Loading alerts...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 px-6 text-center select-none flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                  <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <p className="font-semibold text-xs text-slate-700">No alerts found</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                  {activeTab === 'ALL'
                    ? 'You have no recent notification alerts in your inbox.'
                    : `No notifications under ${tabs.find((t) => t.id === activeTab)?.label}.`}
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const meta = getCategoryMeta(item.category);
                const isUnread = !item.isRead;

                return (
                  <div
                    key={item.notificationId}
                    onClick={() => handleItemClick(item)}
                    className={`p-4 transition-all cursor-pointer flex items-start space-x-3 text-left hover:bg-slate-50/80 ${
                      isUnread ? 'bg-blue-50/40' : 'bg-white'
                    }`}
                  >
                    {/* Category Icon Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${meta.badgeClass}`}
                    >
                      {meta.icon}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>

                        <span className="text-[10px] text-slate-400 flex items-center space-x-1 shrink-0">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatRelativeTime(item.createdAt)}</span>
                        </span>
                      </div>

                      <h4
                        className={`text-xs leading-snug line-clamp-1 ${
                          isUnread
                            ? 'font-bold text-slate-900'
                            : 'font-semibold text-slate-700'
                        }`}
                      >
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                        {item.message}
                      </p>
                    </div>

                    {/* Unread Indicator Dot */}
                    {isUnread && (
                      <div className="shrink-0 pt-1.5" title="Unread alert">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1a5cff] block ring-4 ring-blue-100"></span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
            <span>PlacePro Live Alerts</span>
            <span className="font-medium text-slate-400">Updates sync in real-time</span>
          </div>
        </div>
      )}
    </div>
  );
}
