import React from 'react';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Mail,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'board' | 'dashboard' | 'team' | 'digests';
  setCurrentTab: (tab: 'board' | 'dashboard' | 'team' | 'digests') => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  isOnline: boolean;
  simulatedOffline: boolean;
  toggleSimulateOffline: () => void;
  syncWithCloud: () => void;
  isVaultUnlocked: boolean;
  openVaultModal: () => void;
  openWeeklyDigestModal: () => void;
  autoSortUrgent: boolean;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  syncStatus,
  isOnline,
  simulatedOffline,
  toggleSimulateOffline,
  syncWithCloud,
  isVaultUnlocked,
  openVaultModal,
  openWeeklyDigestModal,
  autoSortUrgent,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const handleNavClick = (tab: 'board' | 'dashboard' | 'team' | 'digests') => {
    setCurrentTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-sm">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-tight">
              SyncroTask
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              AutoTask Workspace
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Navigation
          </div>

          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 text-current" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleNavClick('board')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'board'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Kanban className="w-5 h-5 text-current" />
            <span>Task Board</span>
          </button>

          <button
            onClick={() => handleNavClick('team')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'team'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-5 h-5 text-current" />
            <span>Team & Load</span>
          </button>

          <button
            onClick={() => handleNavClick('digests')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'digests'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Mail className="w-5 h-5 text-current" />
            <span>Weekly Summaries</span>
          </button>

          {/* Status Indicators Section */}
          <div className="pt-6 px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Status
          </div>

          <div
            onClick={syncWithCloud}
            className="px-3 py-2 flex items-center justify-between rounded-md hover:bg-slate-800/60 cursor-pointer group transition-colors"
            title="Click to trigger cloud synchronization"
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  !isOnline
                    ? 'bg-amber-400'
                    : syncStatus === 'syncing'
                    ? 'bg-indigo-400 animate-ping'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="text-sm text-slate-300 italic">
                {!isOnline ? 'Offline Queue' : syncStatus === 'syncing' ? 'Syncing...' : 'Cloud Synced'}
              </span>
            </div>
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
            )}
          </div>

          <div
            onClick={openVaultModal}
            className="px-3 py-2 flex items-center justify-between rounded-md hover:bg-slate-800/60 cursor-pointer group transition-colors"
            title="End-to-End Encryption AES-256 (Click to manage)"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
              <span className="text-sm text-slate-300 italic">
                {isVaultUnlocked ? 'E2E Encrypted' : 'Vault Locked'}
              </span>
            </div>
            {isVaultUnlocked ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>

          <div className="px-3 py-2 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                autoSortUrgent ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-slate-600'
              }`}
            />
            <span className="text-sm text-slate-300 italic">
              {autoSortUrgent ? 'Priority Sorting On' : 'Priority Sorting Off'}
            </span>
          </div>
        </nav>

        {/* Offline Mode Switcher Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div
            onClick={toggleSimulateOffline}
            className="flex items-center justify-between cursor-pointer group"
            title="Click to toggle between Online mode and Simulated Offline mode"
          >
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                Offline Mode Available
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {simulatedOffline ? 'Status: Disconnected' : 'Status: Online'}
              </span>
            </div>

            {/* Custom Pill Toggle Switch matching theme */}
            <div className={`w-8 h-4 rounded-full relative transition-colors ${simulatedOffline ? 'bg-amber-600' : 'bg-slate-700'}`}>
              <div
                className={`absolute top-1 w-2 h-2 rounded-full transition-all ${
                  simulatedOffline ? 'left-1 bg-white' : 'right-1 bg-indigo-400'
                }`}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
