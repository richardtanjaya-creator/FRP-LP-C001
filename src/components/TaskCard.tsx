import React from 'react';
import {
  Calendar,
  Lock,
  Sparkles,
  AlertTriangle,
  GripVertical,
} from 'lucide-react';
import { Task, Project, TeamMember } from '../types';
import { calculateUrgencyScore } from '../utils/taskAlgorithms';

interface TaskCardProps {
  task: Task;
  project?: Project;
  assignee?: TeamMember;
  onOpenDetails: (task: Task) => void;
  onQuickAutoAssign: (task: Task) => void;
  isVaultUnlocked: boolean;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  project,
  assignee,
  onOpenDetails,
  onQuickAutoAssign,
  isVaultUnlocked,
  onDragStart,
}) => {
  const urgencyScore = task.urgencyScore ?? calculateUrgencyScore(task);

  // Generate clean short task code (e.g. #API-102)
  const taskCode = `#${task.projectName.slice(0, 3).toUpperCase()}-${task.id.replace(/[^0-9]/g, '').slice(-3) || '101'}`;

  // Priority and border-left styling matching the Professional Polish theme
  const getPriorityStyle = () => {
    if (task.priority === 'urgent' || urgencyScore >= 70) {
      return {
        borderLeft: 'border-l-4 border-l-red-500',
        badge: 'text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 dark:text-red-300 px-1.5 py-0.5 rounded uppercase',
        label: 'Urgent',
      };
    }
    if (task.priority === 'high' || urgencyScore >= 45) {
      return {
        borderLeft: 'border-l-4 border-l-indigo-500',
        badge: 'text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 px-1.5 py-0.5 rounded uppercase',
        label: 'High',
      };
    }
    if (task.priority === 'medium' || urgencyScore >= 25) {
      return {
        borderLeft: 'border-l-4 border-l-amber-400',
        badge: 'text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase',
        label: 'Medium',
      };
    }
    return {
      borderLeft: 'border-l-4 border-l-slate-300 dark:border-l-slate-700',
      badge: 'text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-1.5 py-0.5 rounded uppercase',
      label: 'Low',
    };
  };

  const priorityStyle = getPriorityStyle();

  // Due date helper
  const getDueBadge = () => {
    if (!task.dueDate) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [year, month, day] = task.dueDate.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (task.status === 'done') {
      return { text: 'Completed', color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60' };
    }
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, color: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950/60 font-semibold' };
    }
    if (diffDays === 0) {
      return { text: 'Due today', color: 'text-amber-800 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60 font-semibold' };
    }
    if (diffDays === 1) {
      return { text: 'Tomorrow', color: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60' };
    }
    return { text: `${diffDays}d left`, color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800' };
  };

  const dueBadge = getDueBadge();
  const hasEncryptedData = Boolean(task.encryptedPayload?.ciphertext || task.confidentialNotes || task.clientBudget);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onOpenDetails(task)}
      className={`group relative bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm cursor-grab hover:shadow-md transition-all select-none ${priorityStyle.borderLeft}`}
    >
      {/* Top Tag & Code Row */}
      <div className="flex justify-between items-start mb-2">
        <span className={priorityStyle.badge}>
          {priorityStyle.label}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
          {taskCode}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2 leading-snug">
        {task.title}
      </p>

      {/* Blocker Alert if active */}
      {task.isBlocked && (
        <div className="flex items-center gap-1.5 px-2 py-1 mb-2 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-[11px] border border-red-200/60 dark:border-red-900/60">
          <AlertTriangle className="w-3 h-3 shrink-0 text-red-500" />
          <span className="truncate">{task.blockerReason || 'Blocked deliverable'}</span>
        </div>
      )}

      {/* Bottom info row: Assignee, Due, E2EE, Drag icon */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        {/* Assignee / Auto-assigned */}
        <div className="flex items-center gap-2">
          {assignee ? (
            <div className="flex items-center gap-1.5" title={`Assigned: ${assignee.name} (${assignee.role})`}>
              <img
                src={assignee.avatar}
                alt={assignee.name}
                className="w-5 h-5 rounded-full object-cover border border-white dark:border-slate-700"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate max-w-[90px]">
                {assignee.name}
              </span>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAutoAssign(task);
              }}
              title="Click to automatically assign based on team skills & capacity"
              className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Auto-assign</span>
            </button>
          )}

          {hasEncryptedData && (
            <span
              title={isVaultUnlocked ? 'Confidential data encrypted (Vault Unlocked)' : 'Confidential data locked'}
              className="flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
            >
              <Lock className="w-2.5 h-2.5" />
              E2EE
            </span>
          )}
        </div>

        {/* Due date badge and drag handle */}
        <div className="flex items-center gap-1.5">
          {dueBadge && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${dueBadge.color}`}>
              {dueBadge.text}
            </span>
          )}
          <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-60 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};
