import React from 'react';
import {
  TrendingUp,
  AlertOctagon,
  CheckCircle,
  Clock,
  Users,
  Briefcase,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  FileSpreadsheet,
  Share2,
} from 'lucide-react';
import { Task, Project, TeamMember } from '../types';

interface StakeholderDashboardProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  onOpenTaskDetails: (task: Task) => void;
  onOpenWeeklyDigest: () => void;
}

export const StakeholderDashboard: React.FC<StakeholderDashboardProps> = ({
  tasks,
  projects,
  teamMembers,
  onOpenTaskDetails,
  onOpenWeeklyDigest,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done');
  const incompleteTasks = tasks.filter((t) => t.status !== 'done');
  const blockedTasks = tasks.filter((t) => t.isBlocked && t.status !== 'done');
  const urgentTasks = tasks.filter(
    (t) => (t.priority === 'urgent' || t.urgencyScore >= 70) && t.status !== 'done'
  );

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Project Health evaluation
  const delayedProjects = projects.filter((p) => p.status === 'delayed');
  const atRiskProjects = projects.filter((p) => p.status === 'at_risk');

  let overallHealth = 'On Track';
  let healthColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';

  if (delayedProjects.length > 0 || blockedTasks.length >= 2) {
    overallHealth = 'Attention Needed';
    healthColor = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800';
  } else if (atRiskProjects.length > 0 || urgentTasks.length >= 3) {
    overallHealth = 'Minor Risk';
    healthColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
  }

  // Workload computation per team member
  const memberLoads = teamMembers.map((member) => {
    const assigned = incompleteTasks.filter((t) => t.assigneeId === member.id);
    const assignedHours = assigned.reduce((acc, curr) => acc + (curr.estimatedHours || 4), 0);
    const maxCapacity = member.maxCapacityHours || 40;
    const utilization = Math.round((assignedHours / maxCapacity) * 100);
    return {
      member,
      assignedCount: assigned.length,
      assignedHours,
      maxCapacity,
      utilization,
    };
  });

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-300">
              Live Stakeholder Command Center
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Portfolio Delivery & Progress Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Real-time cross-functional health metrics, milestone velocity, and team capacity distribution for all executive stakeholders.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenWeeklyDigest}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-all active:scale-95"
          >
            <span>Friday Executive Digest</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Completion Gauge */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {completionPercentage}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({completedTasks.length}/{totalTasks} tasks)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Portfolio Health */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Delivery Health
            </span>
            <div className="mt-1">
              <span className={`inline-block text-xs font-extrabold px-2.5 py-1 rounded-full border ${healthColor}`}>
                {overallHealth}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {delayedProjects.length > 0 ? `${delayedProjects.length} streams delayed` : 'Milestones tracking to plan'}
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Incomplete Tasks & Blockers */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Incomplete
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {incompleteTasks.length}
              </span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {blockedTasks.length > 0 ? `(${blockedTasks.length} blocked)` : ''}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Across {projects.length} distinct workstreams
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Critical Urgent Items */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Urgent Escalations
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {urgentTasks.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                requiring focus
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Automated priority scoring active
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Projects Progress & Workstream Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Workstream Cards (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Active Projects & Stakeholder Delivery
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {projects.length} Total Projects
            </span>
          </div>

          <div className="space-y-4">
            {projects.map((proj) => {
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              const pCompleted = projTasks.filter((t) => t.status === 'done');
              const pBlocked = projTasks.filter((t) => t.isBlocked && t.status !== 'done');
              const progress = projTasks.length > 0 ? Math.round((pCompleted.length / projTasks.length) * 100) : 0;

              return (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: proj.color }}
                        />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {proj.name}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            proj.status === 'on_track'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : proj.status === 'at_risk'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}
                        >
                          {proj.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Stakeholder: <strong className="text-slate-700 dark:text-slate-300">{proj.stakeholder}</strong> • Due: {proj.dueDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {progress}%
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {pCompleted.length} of {projTasks.length} Done
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: proj.color,
                      }}
                    />
                  </div>

                  {pBlocked.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{pBlocked.length} task(s) currently blocked</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Workload & Headroom */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Team Capacity Headroom
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time workload index used by the automated task assignment algorithm.
          </p>

          <div className="space-y-3.5">
            {memberLoads.map(({ member, assignedCount, assignedHours, maxCapacity, utilization }) => {
              let barColor = 'bg-emerald-500';
              if (utilization > 90) {
                barColor = 'bg-rose-500';
              } else if (utilization > 70) {
                barColor = 'bg-amber-500';
              }

              return (
                <div key={member.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {member.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {assignedHours}h / {maxCapacity}h ({utilization}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Critical Bottlenecks & Escalations Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Critical Stakeholder Action Items & Blockers
            </h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">
            {urgentTasks.length} Critical Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
              <tr>
                <th className="pb-2.5">Deliverable</th>
                <th className="pb-2.5">Project</th>
                <th className="pb-2.5">Assignee</th>
                <th className="pb-2.5">Due Date</th>
                <th className="pb-2.5">Urgency</th>
                <th className="pb-2.5">Blocker / Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {urgentTasks.slice(0, 6).map((task) => {
                const assignee = teamMembers.find((m) => m.id === task.assigneeId);
                return (
                  <tr
                    key={task.id}
                    onClick={() => onOpenTaskDetails(task)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white max-w-xs truncate pr-3">
                      {task.title}
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-400">
                      {task.projectName}
                    </td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">
                      {assignee ? assignee.name : '⚠️ Unassigned'}
                    </td>
                    <td className="py-2.5 font-semibold text-rose-600 dark:text-rose-400">
                      {task.dueDate}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Score {task.urgencyScore}
                      </span>
                    </td>
                    <td className="py-2.5 text-rose-600 dark:text-rose-400 truncate max-w-xs">
                      {task.isBlocked ? task.blockerReason || 'Blocked by external party' : 'Due imminently'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
