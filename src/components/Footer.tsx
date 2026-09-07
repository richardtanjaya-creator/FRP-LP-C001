import React, { useState, useEffect } from 'react';

interface FooterProps {
  openVaultModal: () => void;
  openWeeklyDigestModal: () => void;
  openNotifications: () => void;
  isOnline: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  openVaultModal,
  openWeeklyDigestModal,
  openNotifications,
  isOnline,
}) => {
  const [syncTimeText, setSyncTimeText] = useState('Just now');

  useEffect(() => {
    const updateTime = () => {
      setSyncTimeText('Just now');
    };
    const interval = setInterval(() => {
      setSyncTimeText('1 min ago');
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-12 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between shrink-0 text-xs">
      {/* Real-time stream indicator & last sync */}
      <div className="flex items-center gap-4 sm:gap-6 text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="hidden sm:inline">
            {isOnline ? 'Real-time Stream Active' : 'Offline Local Cache Active'}
          </span>
          <span className="sm:hidden">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <span>Last sync: {syncTimeText}</span>
      </div>

      {/* System Quick Links */}
      <div className="flex items-center gap-4 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
        <button
          onClick={openNotifications}
          className="hover:underline cursor-pointer"
        >
          System Alerts
        </button>
        <button
          onClick={openVaultModal}
          className="hover:underline cursor-pointer"
        >
          Privacy Center & E2EE
        </button>
        <button
          onClick={openWeeklyDigestModal}
          className="hover:underline cursor-pointer hidden md:inline"
        >
          AI Friday Digest
        </button>
      </div>
    </footer>
  );
};
