import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Lock,
  AlertTriangle,
  Calendar,
  Clock,
  Trash2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Task, Project, TeamMember, TaskStatus, PriorityLevel } from '../types';
import { findBestAssignee, calculateUrgencyScore } from '../utils/taskAlgorithms';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultStatus?: TaskStatus;
  projects: Project[];
  teamMembers: TeamMember[];
  allTasks: Task[];
  onSaveTask: (taskData: Partial<Task>, isNew: boolean) => void;
  onDeleteTask?: (taskId: string) => void;
  isVaultUnlocked: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultStatus = 'todo',
  projects,
  teamMembers,
  allTasks,
  onSaveTask,
  onDeleteTask,
  isVaultUnlocked,
}) => {
  const isEditing = Boolean(taskToEdit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [tagsInput, setTagsInput] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockerReason, setBlockerReason] = useState('');

  // Encrypted confidential fields
  const [confidentialNotes, setConfidentialNotes] = useState('');
  const [clientBudget, setClientBudget] = useState('');

  // Auto-assign suggestion state
  const [smartSuggestion, setSmartSuggestion] = useState<{
    memberId: string;
    memberName: string;
    reason: string;
    matchScore: number;
  } | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setProjectId(taskToEdit.projectId);
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setAssigneeId(taskToEdit.assigneeId);
      setDueDate(taskToEdit.dueDate);
      setEstimatedHours(taskToEdit.estimatedHours || 8);
      setTagsInput(taskToEdit.tags?.join(', ') || '');
      setIsBlocked(taskToEdit.isBlocked || false);
      setBlockerReason(taskToEdit.blockerReason || '');
      setConfidentialNotes(taskToEdit.confidentialNotes || '');
      setClientBudget(taskToEdit.clientBudget || '');
    } else {
      setTitle('');
      setDescription('');
      setProjectId(projects[0]?.id || '');
      setStatus(defaultStatus);
      setPriority('medium');
      setAssigneeId(null);
      // Default due in 5 days
      const d = new Date();
      d.setDate(d.getDate() + 5);
      setDueDate(d.toISOString().split('T')[0]);
      setEstimatedHours(8);
      setTagsInput('');
      setIsBlocked(false);
      setBlockerReason('');
      setConfidentialNotes('');
      setClientBudget('');
    }
    setSmartSuggestion(null);
  }, [taskToEdit, defaultStatus, projects, isOpen]);

  if (!isOpen) return null;

  // Run Smart Auto-Assign preview
  const handleTriggerAutoAssign = () => {
    const mockTask: Task = {
      id: taskToEdit?.id || 'temp',
      title,
      description,
      projectId,
      projectName: projects.find((p) => p.id === projectId)?.name || '',
      status,
      priority,
      assigneeId: null,
      dueDate,
      estimatedHours,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      urgencyScore: 0,
      isBlocked,
      createdAt: '',
      updatedAt: '',
    };

    const best = findBestAssignee(mockTask, teamMembers, allTasks);
    if (best) {
      setSmartSuggestion(best);
      setAssigneeId(best.memberId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const project = projects.find((p) => p.id === projectId);

    const partialTask: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      projectId,
      projectName: project?.name || 'General Project',
      status,
      priority,
      assigneeId,
      dueDate,
      estimatedHours: Number(estimatedHours) || 4,
      tags,
      isBlocked,
      blockerReason: isBlocked ? blockerReason.trim() : undefined,
      confidentialNotes: confidentialNotes.trim() || undefined,
      clientBudget: clientBudget.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (!isEditing) {
      partialTask.id = `task-${Date.now()}`;
      partialTask.createdAt = new Date().toISOString();
    } else {
      partialTask.id = taskToEdit!.id;
    }

    // Recalculate dynamic urgency score
    partialTask.urgencyScore = calculateUrgencyScore(partialTask as Task);

    onSaveTask(partialTask, !isEditing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Task Deliverable' : 'Create New Team Task'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Audit AWS KMS Root Keys & HSM Tokens"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Project & Workflow Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Project Stream
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Workflow Column
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                min="1"
                max="160"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Automated Task Assignment Section */}
          <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Team Assignment (Automated or Manual)
              </label>

              <button
                type="button"
                onClick={handleTriggerAutoAssign}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm active:scale-95"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Assign</span>
              </button>
            </div>

            <select
              value={assigneeId || ''}
              onChange={(e) => {
                setAssigneeId(e.target.value || null);
                setSmartSuggestion(null);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Unassigned (Pending Auto-Assignment)</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.role} ({m.skills.slice(0, 2).join(', ')})
                </option>
              ))}
            </select>

            {smartSuggestion && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Auto-Matched to {smartSuggestion.memberName}</span>
                  <p className="text-[11px] opacity-90">{smartSuggestion.reason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Description & Acceptance Criteria
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the technical requirements and delivery specifications..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Skill & Technology Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., Security, React, Go, Mobile, Testing"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Blocker Section */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Is this task currently blocked?
              </span>
              <input
                type="checkbox"
                checked={isBlocked}
                onChange={(e) => setIsBlocked(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {isBlocked && (
              <input
                type="text"
                value={blockerReason}
                onChange={(e) => setBlockerReason(e.target.value)}
                placeholder="Explain the blocker (e.g., Awaiting vendor signing keys)"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-800 text-rose-900 dark:text-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            )}
          </div>

          {/* End-to-End Encrypted Project Data Section */}
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  End-to-End Encrypted Project Vault (AES-256)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 font-bold">
                Zero-Knowledge E2EE
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Data entered here is encrypted on your device using AES-GCM before storage or cloud synchronization.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confidential Budget / Cost Estimate
                </label>
                <input
                  type="text"
                  value={clientBudget}
                  onChange={(e) => setClientBudget(e.target.value)}
                  placeholder="e.g., $25,000 internal allocation"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Restricted Passphrases / Security Details
                </label>
                <input
                  type="text"
                  value={confidentialNotes}
                  onChange={(e) => setConfidentialNotes(e.target.value)}
                  placeholder="e.g., Root token in physical safe"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            {isEditing && onDeleteTask ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    onDeleteTask(taskToEdit!.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all active:scale-95"
              >
                {isEditing ? 'Update Deliverable' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
