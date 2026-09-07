import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Unlock,
  X,
  CheckCircle,
  FileKey,
} from 'lucide-react';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  vaultPassphrase: string;
  onUpdatePassphrase: (newPass: string) => void;
  onToggleLock: () => void;
}

export const VaultModal: React.FC<VaultModalProps> = ({
  isOpen,
  onClose,
  isUnlocked,
  vaultPassphrase,
  onUpdatePassphrase,
  onToggleLock,
}) => {
  const [inputPass, setInputPass] = useState(vaultPassphrase);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPass.trim()) return;
    onUpdatePassphrase(inputPass.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              End-to-End Encryption (E2EE) Vault
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                  AES-GCM 256-Bit Standard
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  PBKDF2 SHA-256 Key Derivation
                </span>
              </div>
            </div>

            <button
              onClick={onToggleLock}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isUnlocked
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span>{isUnlocked ? 'Unlocked' : 'Locked'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All sensitive project data (such as client budgets, security credentials, and confidential internal notes) are encrypted client-side via the Web Crypto API before local persistence or cloud synchronization. The cloud server never receives unencrypted plain text.
          </p>

          {/* Passphrase Config */}
          <form onSubmit={handleSave} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Project Master Passphrase / Encryption Key
              </label>
              <input
                type="password"
                value={inputPass}
                onChange={(e) => setInputPass(e.target.value)}
                placeholder="Enter passphrase to encrypt/decrypt..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                {savedSuccess && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Key updated successfully
                  </span>
                )}
              </span>

              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
              >
                Update Passphrase
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
