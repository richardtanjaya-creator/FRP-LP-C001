import React from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Mail,
  Trash2,
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onClearAll: () => void;
  onMarkAllRead: () => void;
  onRequestBrowserPush: () => void;
  browserPermission: NotificationPermission | 'unsupported';
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onMarkAllRead,
  onRequestBrowserPush,
  browserPermission,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-12 animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Push Notification Center
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Browser Push Permission Banner */}
        {browserPermission !== 'granted' && browserPermission !== 'unsupported' && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900 flex items-center justify-between gap-2">
            <p className="text-[11px] text-indigo-900 dark:text-indigo-300 font-medium">
              Enable browser desktop alerts for instant task status updates?
            </p>
            <button
              onClick={onRequestBrowserPush}
              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 transition-colors"
            >
              Enable
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              let icon = <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />;
              if (n.type === 'assignment') {
                icon = <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />;
              } else if (n.type === 'urgency') {
                icon = <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
              } else if (n.type === 'email') {
                icon = <Mail className="w-4 h-4 text-emerald-500 shrink-0" />;
              }

              return (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border transition-all text-xs flex items-start gap-2.5 ${
                    n.read
                      ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 text-slate-600 dark:text-slate-400'
                      : 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/60 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold block truncate">{n.title}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent notifications
            </div>
          )}
        </div>

        {/* Footer actions */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/40">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600"
            >
              Mark all read
            </button>
            <button
              onClick={onClearAll}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
