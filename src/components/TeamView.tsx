import React from 'react';
import {
  Users,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { TeamMember, Task } from '../types';

interface TeamViewProps {
  teamMembers: TeamMember[];
  tasks: Task[];
  onOpenTaskDetails: (task: Task) => void;
  onAutoAssignAll: () => void;
  onToggleMemberStatus: (memberId: string) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({
  teamMembers,
  tasks,
  onOpenTaskDetails,
  onAutoAssignAll,
  onToggleMemberStatus,
}) => {
  const unassignedTasks = tasks.filter((t) => !t.assigneeId && t.status !== 'done');

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Team Workload & Automated Assignment Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            AutoTask balances deliverables dynamically using skill taxonomy, available capacity headroom, and real-time urgency.
          </p>
        </div>

        {unassignedTasks.length > 0 && (
          <button
            onClick={onAutoAssignAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-Assign {unassignedTasks.length} Unassigned Tasks</span>
          </button>
        )}
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teamMembers.map((member) => {
          const assignedTasks = tasks.filter(
            (t) => t.assigneeId === member.id && t.status !== 'done'
          );
          const completedTasks = tasks.filter(
            (t) => t.assigneeId === member.id && t.status === 'done'
          );
          const totalHours = assignedTasks.reduce(
            (acc, t) => acc + (t.estimatedHours || 4),
            0
          );
          const maxCapacity = member.maxCapacityHours || 40;
          const utilization = Math.round((totalHours / maxCapacity) * 100);

          let statusBadge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
          if (member.status === 'busy') {
            statusBadge = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
          } else if (member.status === 'away') {
            statusBadge = 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
          }

          let barColor = 'bg-emerald-500';
          if (utilization > 90) barColor = 'bg-rose-500';
          else if (utilization > 70) barColor = 'bg-amber-500';

          return (
            <div
              key={member.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              {/* Member Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {member.role}
                    </p>
                    <span className="text-[11px] text-slate-400 block">{member.email}</span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleMemberStatus(member.id)}
                  title="Click to toggle status (Active / Busy / Away)"
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize cursor-pointer hover:opacity-80 transition-opacity ${statusBadge}`}
                >
                  {member.status}
                </button>
              </div>

              {/* Skills Tags */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Skill Taxonomy (Auto-Match Criteria)
                </span>
                <div className="flex flex-wrap gap-1">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Active Capacity:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {totalHours}h / {maxCapacity}h ({utilization}%)
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${Math.min(100, utilization)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{assignedTasks.length} active tasks</span>
                  <span>{completedTasks.length} completed</span>
                </div>
              </div>

              {/* Assigned Active Tasks Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Current Deliverables:
                </span>
                {assignedTasks.length > 0 ? (
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {assignedTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onOpenTaskDetails(t)}
                        className="text-xs p-2 rounded-lg bg-slate-50 hover:bg-indigo-50/60 dark:bg-slate-800/60 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-800 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                          {t.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold shrink-0 ${
                            t.priority === 'urgent' ? 'text-rose-500' : 'text-slate-400'
                          }`}
                        >
                          {t.dueDate.slice(5)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                    Ready for auto-assignment
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
