import React from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Bell,
  Menu,
  Mail,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  openNewTaskModal: () => void;
  openWeeklyDigestModal: () => void;
  handleAutoAssignAll: () => void;
  autoSortUrgent: boolean;
  setAutoSortUrgent: (val: boolean) => void;
  unreadNotificationsCount: number;
  openNotifications: () => void;
  unassignedTasksCount: number;
  onToggleSidebarMobile: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  toggleDarkMode,
  openNewTaskModal,
  openWeeklyDigestModal,
  handleAutoAssignAll,
  autoSortUrgent,
  setAutoSortUrgent,
  unreadNotificationsCount,
  openNotifications,
  unassignedTasksCount,
  onToggleSidebarMobile,
  searchQuery = '',
  setSearchQuery,
}) => {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0 transition-colors">
      {/* Left: Mobile menu toggle & Search input */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white md:hidden"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 w-56 sm:w-80 md:w-96">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search projects or tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="bg-transparent text-xs sm:text-sm outline-none w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchQuery && setSearchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls matching Professional Polish */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Quick Action: Auto-Assign if unassigned items exist */}
        {unassignedTasksCount > 0 && (
          <button
            onClick={handleAutoAssignAll}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
            title="Auto-assign unassigned deliverables across team capacity"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Auto-Assign ({unassignedTasksCount})</span>
          </button>
        )}

        {/* Quick Action: Friday Summary */}
        <button
          onClick={openWeeklyDigestModal}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-indigo-500" />
          <span>Friday Digest</span>
        </button>

        {/* Primary "+ New Task" Button */}
        <button
          onClick={openNewTaskModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>

        {/* Dark Mode Pill Toggle Switch matching Professional Polish */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">
            Dark Mode
          </span>
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`w-10 h-5 rounded-full relative border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-indigo-600 border-indigo-700'
                : 'bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-slate-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm border transition-all ${
                isDarkMode
                  ? 'right-0.5 border-indigo-200'
                  : 'left-0.5 border-slate-300'
              }`}
            />
          </button>
        </div>

        {/* Notification Bell */}
        <button
          onClick={openNotifications}
          className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Push Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          )}
        </button>

        {/* User Profile Avatar with indicator matching theme */}
        <div
          onClick={openNotifications}
          className="relative cursor-pointer"
          title="Richard Tanjaya (Chief Operating Lead)"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 text-xs">
            RT
          </div>
          {unreadNotificationsCount > 0 && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full" />
          )}
        </div>
      </div>
    </header>
  );
};
