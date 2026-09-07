import React, { useState } from 'react';
import {
  Plus,
  Filter,
  Search,
  Zap,
} from 'lucide-react';
import { Task, Project, TeamMember, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { sortTasksByUrgency } from '../utils/taskAlgorithms';

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenTaskDetails: (task: Task) => void;
  onOpenNewTask: (defaultStatus?: TaskStatus) => void;
  onQuickAutoAssign: (task: Task) => void;
  autoSortUrgent: boolean;
  setAutoSortUrgent: (val: boolean) => void;
  isVaultUnlocked: boolean;
  externalSearchQuery?: string;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  dotColor: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    dotColor: 'bg-slate-400',
  },
  {
    id: 'todo',
    title: 'To Do',
    dotColor: 'bg-amber-400',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    dotColor: 'bg-indigo-500',
  },
  {
    id: 'in_review',
    title: 'In Review',
    dotColor: 'bg-emerald-500',
  },
  {
    id: 'done',
    title: 'Done',
    dotColor: 'bg-emerald-600',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  projects,
  teamMembers,
  onUpdateTaskStatus,
  onOpenTaskDetails,
  onOpenNewTask,
  onQuickAutoAssign,
  autoSortUrgent,
  setAutoSortUrgent,
  isVaultUnlocked,
  externalSearchQuery = '',
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('all');
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const activeSearch = externalSearchQuery || internalSearch;

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) {
      return false;
    }
    if (selectedAssigneeId === 'unassigned') {
      if (task.assigneeId) return false;
    } else if (selectedAssigneeId !== 'all' && task.assigneeId !== selectedAssigneeId) {
      return false;
    }
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchTags = task.tags.some((t) => t.toLowerCase().includes(q));
      const matchProject = task.projectName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTags && !matchProject) {
        return false;
      }
    }
    return true;
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: TaskStatus) => {
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Controls & Filter Bar matching Professional Polish */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Project & Assignee Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Project filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Assignee:</span>
            <select
              value={selectedAssigneeId}
              onChange={(e) => setSelectedAssigneeId(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Team Members</option>
              <option value="unassigned">⚠️ Unassigned Tasks</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Urgency auto-sort switch */}
          <button
            onClick={() => setAutoSortUrgent(!autoSortUrgent)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              autoSortUrgent
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${autoSortUrgent ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>Urgent Items First</span>
          </button>
        </div>

        {/* Task counter */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredTasks.length}</strong> of {tasks.length} Deliverables
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1 items-start min-h-[520px]">
        {COLUMNS.map((column) => {
          let colTasks = filteredTasks.filter((t) => t.status === column.id);
          if (autoSortUrgent) {
            colTasks = sortTasksByUrgency(colTasks);
          }

          const isColumnHovered = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={(e) => handleDragLeave(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col rounded-xl p-3 border transition-all min-h-[480px] ${
                isColumnHovered
                  ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
                  : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Column Header matching Professional Polish (dot + title + count pill) */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70 dark:border-slate-800/80 px-1">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <span className={`w-2 h-2 ${column.dotColor} rounded-full`} />
                  {column.title}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-bold text-slate-600 dark:text-slate-400">
                    {colTasks.length < 10 ? `0${colTasks.length}` : colTasks.length}
                  </span>
                  <button
                    onClick={() => onOpenNewTask(column.id)}
                    title={`Add task to ${column.title}`}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Task Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => {
                    const project = projects.find((p) => p.id === task.projectId);
                    const assignee = teamMembers.find((m) => m.id === task.assigneeId);
                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        project={project}
                        assignee={assignee}
                        onOpenDetails={onOpenTaskDetails}
                        onQuickAutoAssign={onQuickAutoAssign}
                        isVaultUnlocked={isVaultUnlocked}
                        onDragStart={handleDragStart}
                      />
                    );
                  })
                ) : (
                  <div
                    onClick={() => onOpenNewTask(column.id)}
                    className="bg-white/60 dark:bg-slate-900/40 p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center h-28 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors text-center"
                  >
                    <span className="text-xs text-slate-400">
                      Drop task here or + Add
                    </span>
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
