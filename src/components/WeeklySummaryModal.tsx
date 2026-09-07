import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Sparkles,
  Send,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { WeeklySummary, Task, Project, TeamMember } from '../types';

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  onTriggerNotification: (title: string, message: string, type: 'email' | 'system') => void;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  teamMembers,
  onTriggerNotification,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('richard.tanjaya@farpoint.co.id');
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoScheduleActive, setAutoScheduleActive] = useState(true);
  const [dispatchedHistory, setDispatchedHistory] = useState<
    { id: string; timestamp: string; recipient: string; status: string }[]
  >([]);

  // Generate or fetch summary when opened
  const generateWeeklySummary = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/weekly-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          projects,
          teamMembers,
          recipientEmail,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Error generating summary:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen && !summary && !isGenerating) {
      generateWeeklySummary();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendEmail = async () => {
    if (!summary) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/email/send-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          recipientEmail,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSummary((prev) => (prev ? { ...prev, sentStatus: 'sent', sentAt: new Date().toISOString() } : null));
        setDispatchedHistory((prev) => [
          {
            id: data.record.id,
            timestamp: new Date().toLocaleTimeString(),
            recipient: recipientEmail,
            status: 'Delivered',
          },
          ...prev,
        ]);
        onTriggerNotification(
          'Weekly Summary Dispatched',
          `Generative Friday digest sent to ${recipientEmail}`,
          'email'
        );
      }
    } catch (err) {
      console.error('Error sending email:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    if (!summary?.emailDraft) return;
    navigator.clipboard.writeText(summary.emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/60 text-white">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Friday End-of-Week Generative Reminder</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Gemini 3.8 AI
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Automated executive synthesis of incomplete deliverables and Monday priorities
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[calc(85vh-130px)] overflow-y-auto">
          {/* Recipient & Schedule bar */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Executive Email Recipient
              </label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  className="w-full text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
              <button
                onClick={generateWeeklySummary}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Synthesizing...' : 'Regenerate'}</span>
              </button>

              <button
                onClick={handleSendEmail}
                disabled={isSending || isGenerating || !summary}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending...' : 'Send to My Email'}</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isGenerating && (
            <div className="p-8 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-900 flex flex-col items-center justify-center text-center space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Gemini AI is analyzing incomplete projects, blockers, and team loads...
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                Compiling work week milestones, urgency scores, and Monday morning escalation steps.
              </p>
            </div>
          )}

          {/* Summary Display */}
          {summary && !isGenerating && (
            <div className="space-y-4">
              {/* Status Header pill */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Week Status:
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      summary.overallStatus === 'On Track'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : summary.overallStatus === 'Attention Needed'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {summary.overallStatus}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Period: {summary.period}</span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Executive Synthesis
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {summary.executiveSummary}
                </p>
              </div>

              {/* Incomplete Projects Breakdown */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Incomplete Workstreams & Delivery Risk
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {summary.incompleteProjects.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {p.projectName}
                        </span>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                          {p.progress}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{p.remainingTasks} remaining tasks</span>
                        <span>Target: {p.dueDate}</span>
                      </div>

                      {p.blocker && (
                        <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 pt-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{p.blocker}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Urgent Items & Monday Priorities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Urgent items */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <h3 className="text-xs font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Immediate Weekend / Monday Items
                  </h3>
                  <div className="space-y-2">
                    {summary.urgentTasks.slice(0, 4).map((u, i) => (
                      <div
                        key={i}
                        className="text-xs p-2 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60"
                      >
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {u.title}
                        </span>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                          <span>Lead: {u.assignee}</span>
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            Due: {u.dueDate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monday Priorities */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <h3 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Monday Morning Action List
                  </h3>
                  <ul className="space-y-1.5">
                    {summary.nextWeekPriorities.map((item, i) => (
                      <li
                        key={i}
                        className="text-xs flex items-start gap-2 text-slate-700 dark:text-slate-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Formatted Email Draft Box */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Full Email Draft (Delivered to Inbox)
                  </h3>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre className="text-xs p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {summary.emailDraft}
                </pre>
              </div>

              {/* Automated Schedule Setting */}
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Automated Work-Week Dispatch Schedule
                  </span>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                    Dispatches automatically every Friday at 17:00 (5:00 PM) to {recipientEmail}.
                  </p>
                </div>

                <button
                  onClick={() => setAutoScheduleActive(!autoScheduleActive)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    autoScheduleActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {autoScheduleActive ? 'Active' : 'Paused'}
                </button>
              </div>

              {/* Delivery History */}
              {dispatchedHistory.length > 0 && (
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Recent Email Dispatches:
                  </span>
                  {dispatchedHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-slate-500 py-0.5">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Dispatched to {item.recipient}
                      </span>
                      <span>{item.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
