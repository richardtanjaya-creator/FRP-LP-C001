import React from 'react';
import { Sparkles, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Task, Project, TeamMember } from '../types';

interface ExecutiveMetricsStripProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  autoSortUrgent: boolean;
  setAutoSortUrgent: (val: boolean) => void;
  unassignedTasksCount: number;
  handleAutoAssignAll: () => void;
  openWeeklyDigestModal: () => void;
}

export const ExecutiveMetricsStrip: React.FC<ExecutiveMetricsStripProps> = ({
  tasks,
  projects,
  teamMembers,
  autoSortUrgent,
  setAutoSortUrgent,
  unassignedTasksCount,
  handleAutoAssignAll,
  openWeeklyDigestModal,
}) => {
  // Calculate dynamic health percentage
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const blockedTasks = tasks.filter((t) => t.isBlocked && t.status !== 'done').length;

  let healthPercentage = 94.2;
  if (totalTasks > 0) {
    const baseRate = Math.round((completedTasks / totalTasks) * 100);
    const penalty = blockedTasks * 4;
    healthPercentage = Math.max(45, Math.min(99.4, Number((85 + (baseRate * 0.15) - penalty).toFixed(1))));
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Project Health */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Project Health
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {healthPercentage}%
        </div>
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 mt-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {/* 2. Weekly Summary */}
      <div
        onClick={openWeeklyDigestModal}
        className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Weekly Summary
          </div>
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 italic">
          Generative email ready for Friday
        </div>
        <div className="mt-2 flex items-center gap-1">
          {teamMembers.slice(0, 3).map((m, idx) => (
            <img
              key={m.id}
              src={m.avatar}
              alt={m.name}
              className="w-6 h-6 rounded-full object-cover border border-white dark:border-slate-800"
              style={{ zIndex: 3 - idx }}
            />
          ))}
          {teamMembers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center text-slate-700 dark:text-slate-200 font-semibold">
              +{teamMembers.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* 3. Automated Sorting */}
      <div
        onClick={() => setAutoSortUrgent(!autoSortUrgent)}
        className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
      >
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Automated Sorting
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${autoSortUrgent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              {autoSortUrgent ? 'Active' : 'Manual'}
            </span>
            <Zap
              className={`w-4 h-4 text-indigo-500 ${autoSortUrgent ? 'animate-pulse fill-indigo-500' : 'opacity-40'}`}
            />
          </div>
          <span className="text-[10px] font-semibold text-slate-400">
            {autoSortUrgent ? 'Urgent first' : 'Click to enable'}
          </span>
        </div>
      </div>

      {/* 4. Pending Assignments (Indigo accent card) */}
      <div className="bg-indigo-600 p-5 rounded-xl shadow-lg text-white flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold text-indigo-100 uppercase tracking-wider mb-1">
            Pending Assignments
          </div>
          <div className="text-2xl font-bold flex items-baseline justify-between">
            <span>{unassignedTasksCount} {unassignedTasksCount === 1 ? 'Task' : 'Tasks'}</span>
            {unassignedTasksCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAutoAssignAll();
                }}
                className="text-[11px] font-bold px-2 py-1 rounded bg-white text-indigo-700 hover:bg-indigo-50 transition-colors shadow-xs"
              >
                Auto-Assign
              </button>
            )}
          </div>
        </div>
        <div className="text-[10px] mt-2 text-indigo-200">
          {unassignedTasksCount > 0
            ? 'Capacity headroom engine ready'
            : 'All active deliverables assigned (100% capacity)'}
        </div>
      </div>
    </div>
  );
};
