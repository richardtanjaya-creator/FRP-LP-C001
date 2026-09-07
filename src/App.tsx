import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ExecutiveMetricsStrip } from './components/ExecutiveMetricsStrip';
import { KanbanBoard } from './components/KanbanBoard';
import { StakeholderDashboard } from './components/StakeholderDashboard';
import { TeamView } from './components/TeamView';
import { WeeklySummaryModal } from './components/WeeklySummaryModal';
import { TaskModal } from './components/TaskModal';
import { VaultModal } from './components/VaultModal';
import { NotificationCenter } from './components/NotificationCenter';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { useSync } from './hooks/useSync';
import { Task, TaskStatus, AppNotification } from './types';
import {
  autoAssignAllUnassigned,
  findBestAssignee,
  calculateUrgencyScore,
} from './utils/taskAlgorithms';
import { encryptSensitiveData, decryptSensitiveData } from './utils/crypto';

export default function App() {
  // Cloud & Offline sync state
  const {
    tasks,
    setTasks,
    projects,
    teamMembers,
    setTeamMembers,
    isOnline,
    simulatedOffline,
    toggleSimulateOffline,
    syncStatus,
    syncWithCloud,
  } = useSync();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'board' | 'dashboard' | 'team' | 'digests'>('board');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('autotask_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('autotask_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('autotask_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Automated Urgency Sorting Toggle
  const [autoSortUrgent, setAutoSortUrgent] = useState<boolean>(true);

  // End-to-End Encryption Vault state
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(true);
  const [vaultPassphrase, setVaultPassphrase] = useState<string>('AutoTask-Vault-Key-2026');
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('todo');
  const [isWeeklyDigestOpen, setIsWeeklyDigestOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // In-app Notifications & Browser Push
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Workspace Initialized',
      message: 'Cloud sync active with automated team orchestration & E2EE.',
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false,
    },
  ]);
  const [browserPushPermission, setBrowserPushPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const triggerPushNotification = useCallback(
    (title: string, message: string, type: 'assignment' | 'urgency' | 'status' | 'system' | 'email' = 'system') => {
      // Add in-app notification
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Trigger Web Push Notification if granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: message,
            icon: '/favicon.ico',
          });
        } catch (e) {
          // May be restricted in iframe
        }
      }

      // Add interactive toast
      addToast(title, message, type === 'urgency' ? 'warning' : 'success');
    },
    [addToast]
  );

  const requestBrowserPush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setBrowserPushPermission(result);
        if (result === 'granted') {
          triggerPushNotification('Push Notifications Enabled', 'You will receive real-time alerts for task updates.', 'system');
        }
      } catch (e) {
        console.warn('Could not request notification permission:', e);
      }
    }
  };

  // Drag and drop / Status update
  const handleUpdateTaskStatus = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === newStatus) return;

      const updated = tasks.map((t) => {
        if (t.id === taskId) {
          const updatedTask = {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            pendingSync: true,
          };
          updatedTask.urgencyScore = calculateUrgencyScore(updatedTask);
          return updatedTask;
        }
        return t;
      });

      setTasks(updated);
      syncWithCloud(updated);

      const statusLabels: Record<TaskStatus, string> = {
        backlog: 'Backlog',
        todo: 'To Do',
        in_progress: 'In Progress',
        in_review: 'In Review',
        done: 'Done',
      };

      triggerPushNotification(
        'Task Status Updated',
        `"${task.title}" moved to ${statusLabels[newStatus]}`,
        'status'
      );
    },
    [tasks, setTasks, syncWithCloud, triggerPushNotification]
  );

  // Automated assignment of all unassigned tasks
  const handleAutoAssignAll = useCallback(() => {
    const { updatedTasks, assignmentsCount } = autoAssignAllUnassigned(tasks, teamMembers);
    if (assignmentsCount > 0) {
      setTasks(updatedTasks);
      syncWithCloud(updatedTasks);
      triggerPushNotification(
        'Automated Assignment Complete',
        `Automatically balanced ${assignmentsCount} task(s) across available team members.`,
        'assignment'
      );
    } else {
      addToast('All Tasks Assigned', 'All active tasks already have assigned owners.', 'info');
    }
  }, [tasks, teamMembers, setTasks, syncWithCloud, triggerPushNotification, addToast]);

  // Quick single-task auto assignment
  const handleQuickAutoAssign = useCallback(
    (task: Task) => {
      const match = findBestAssignee(task, teamMembers, tasks);
      if (match) {
        const updated = tasks.map((t) => {
          if (t.id === task.id) {
            return {
              ...t,
              assigneeId: match.memberId,
              updatedAt: new Date().toISOString(),
              pendingSync: true,
            };
          }
          return t;
        });
        setTasks(updated);
        syncWithCloud(updated);
        triggerPushNotification(
          'Task Auto-Assigned',
          `"${task.title}" assigned to ${match.memberName} (${match.reason})`,
          'assignment'
        );
      }
    },
    [tasks, teamMembers, setTasks, syncWithCloud, triggerPushNotification]
  );

  // Save Task (Create or Edit with E2EE)
  const handleSaveTask = async (taskData: Partial<Task>, isNew: boolean) => {
    let encryptedPayload = taskData.encryptedPayload;

    // Encrypt sensitive confidential notes and client budget if present
    if (taskData.confidentialNotes || taskData.clientBudget) {
      const combinedSensitive = JSON.stringify({
        notes: taskData.confidentialNotes,
        budget: taskData.clientBudget,
      });
      encryptedPayload = await encryptSensitiveData(combinedSensitive, vaultPassphrase);
    }

    const finalTaskData: Task = {
      ...(taskData as Task),
      encryptedPayload,
      pendingSync: true,
    };

    let updatedList: Task[];
    if (isNew) {
      updatedList = [finalTaskData, ...tasks];
      triggerPushNotification(
        'New Deliverable Added',
        `"${finalTaskData.title}" added to ${finalTaskData.projectName}`,
        'status'
      );
    } else {
      updatedList = tasks.map((t) => (t.id === finalTaskData.id ? finalTaskData : t));
      triggerPushNotification('Deliverable Updated', `"${finalTaskData.title}" specifications saved`, 'status');
    }

    setTasks(updatedList);
    syncWithCloud(updatedList);
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    syncWithCloud(updated);
    addToast('Task Deleted', 'Deliverable removed from workspace', 'info');
  };

  // Open task details modal
  const handleOpenTaskDetails = async (task: Task) => {
    let decryptedNotes = task.confidentialNotes;
    let decryptedBudget = task.clientBudget;

    if (task.encryptedPayload?.ciphertext && isVaultUnlocked) {
      try {
        const decryptedJson = await decryptSensitiveData(task.encryptedPayload, vaultPassphrase);
        if (decryptedJson) {
          const parsed = JSON.parse(decryptedJson);
          decryptedNotes = parsed.notes;
          decryptedBudget = parsed.budget;
        }
      } catch (e) {
        console.warn('Could not decrypt confidential fields:', e);
      }
    }

    setTaskToEdit({
      ...task,
      confidentialNotes: decryptedNotes,
      clientBudget: decryptedBudget,
    });
    setIsTaskModalOpen(true);
  };

  // Toggle member status (Active / Busy / Away)
  const handleToggleMemberStatus = (memberId: string) => {
    const updated = teamMembers.map((m) => {
      if (m.id === memberId) {
        const nextStatus: 'active' | 'busy' | 'away' =
          m.status === 'active' ? 'busy' : m.status === 'busy' ? 'away' : 'active';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    setTeamMembers(updated);
    addToast('Member Availability Updated', 'Team capacity re-indexed for automated assignment.', 'info');
  };

  const unassignedCount = tasks.filter((t) => !t.assigneeId && t.status !== 'done').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      {/* Left Persistent Navigation Sidebar matching Professional Polish */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        syncStatus={syncStatus}
        isOnline={isOnline}
        simulatedOffline={simulatedOffline}
        toggleSimulateOffline={toggleSimulateOffline}
        syncWithCloud={() => syncWithCloud()}
        isVaultUnlocked={isVaultUnlocked}
        openVaultModal={() => setIsVaultModalOpen(true)}
        openWeeklyDigestModal={() => setIsWeeklyDigestOpen(true)}
        autoSortUrgent={autoSortUrgent}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header matching Professional Polish */}
        <Header
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          openNewTaskModal={() => {
            setTaskToEdit(null);
            setDefaultTaskStatus('todo');
            setIsTaskModalOpen(true);
          }}
          openWeeklyDigestModal={() => setIsWeeklyDigestOpen(true)}
          handleAutoAssignAll={handleAutoAssignAll}
          autoSortUrgent={autoSortUrgent}
          setAutoSortUrgent={setAutoSortUrgent}
          unreadNotificationsCount={unreadNotifsCount}
          openNotifications={() => setIsNotificationCenterOpen(true)}
          unassignedTasksCount={unassignedCount}
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Scrollable Main Content Section matching Professional Polish */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          {/* Executive Stat Strip */}
          <ExecutiveMetricsStrip
            tasks={tasks}
            projects={projects}
            teamMembers={teamMembers}
            autoSortUrgent={autoSortUrgent}
            setAutoSortUrgent={setAutoSortUrgent}
            unassignedTasksCount={unassignedCount}
            handleAutoAssignAll={handleAutoAssignAll}
            openWeeklyDigestModal={() => setIsWeeklyDigestOpen(true)}
          />

          {/* Primary View based on Tab */}
          {currentTab === 'board' && (
            <KanbanBoard
              tasks={tasks}
              projects={projects}
              teamMembers={teamMembers}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onOpenTaskDetails={handleOpenTaskDetails}
              onOpenNewTask={(status) => {
                setTaskToEdit(null);
                setDefaultTaskStatus(status || 'todo');
                setIsTaskModalOpen(true);
              }}
              onQuickAutoAssign={handleQuickAutoAssign}
              autoSortUrgent={autoSortUrgent}
              setAutoSortUrgent={setAutoSortUrgent}
              isVaultUnlocked={isVaultUnlocked}
              externalSearchQuery={searchQuery}
            />
          )}

          {currentTab === 'dashboard' && (
            <StakeholderDashboard
              tasks={tasks}
              projects={projects}
              teamMembers={teamMembers}
              onOpenTaskDetails={handleOpenTaskDetails}
              onOpenWeeklyDigest={() => setIsWeeklyDigestOpen(true)}
            />
          )}

          {currentTab === 'team' && (
            <TeamView
              teamMembers={teamMembers}
              tasks={tasks}
              onOpenTaskDetails={handleOpenTaskDetails}
              onAutoAssignAll={handleAutoAssignAll}
              onToggleMemberStatus={handleToggleMemberStatus}
            />
          )}

          {currentTab === 'digests' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Executive End-of-Week AI Digest
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Automated Gemini-powered Friday synthesis dispatched directly to your inbox summarizing incomplete projects, blockers, and Monday priorities.
                  </p>
                </div>

                <button
                  onClick={() => setIsWeeklyDigestOpen(true)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95 transition-all"
                >
                  Generate Weekly Digest
                </button>
              </div>

              {/* Stakeholder Dashboard summary for digests */}
              <StakeholderDashboard
                tasks={tasks}
                projects={projects}
                teamMembers={teamMembers}
                onOpenTaskDetails={handleOpenTaskDetails}
                onOpenWeeklyDigest={() => setIsWeeklyDigestOpen(true)}
              />
            </div>
          )}
        </main>

        {/* Bottom Persistent Status Footer matching Professional Polish */}
        <Footer
          openVaultModal={() => setIsVaultModalOpen(true)}
          openWeeklyDigestModal={() => setIsWeeklyDigestOpen(true)}
          openNotifications={() => setIsNotificationCenterOpen(true)}
          isOnline={isOnline}
        />
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultStatus={defaultTaskStatus}
        projects={projects}
        teamMembers={teamMembers}
        allTasks={tasks}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        isVaultUnlocked={isVaultUnlocked}
      />

      {/* Weekly Executive Digest Modal */}
      <WeeklySummaryModal
        isOpen={isWeeklyDigestOpen}
        onClose={() => setIsWeeklyDigestOpen(false)}
        tasks={tasks}
        projects={projects}
        teamMembers={teamMembers}
        onTriggerNotification={triggerPushNotification}
      />

      {/* E2EE Vault Settings Modal */}
      <VaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        isUnlocked={isVaultUnlocked}
        vaultPassphrase={vaultPassphrase}
        onUpdatePassphrase={(newPass) => {
          setVaultPassphrase(newPass);
          addToast('Vault Passphrase Updated', 'New key derived for local AES-256 encryption.', 'success');
        }}
        onToggleLock={() => {
          setIsVaultUnlocked((prev) => !prev);
          addToast(
            isVaultUnlocked ? 'Vault Locked' : 'Vault Unlocked',
            isVaultUnlocked ? 'Confidential project fields masked.' : 'Confidential fields decrypted.',
            'info'
          );
        }}
      />

      {/* Push Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          addToast('Notifications Cleared', 'All alerts marked as read', 'info');
        }}
        onClearAll={() => setNotifications([])}
        onRequestBrowserPermission={requestBrowserPush}
        browserPermission={browserPushPermission}
      />

      {/* Toast notifications container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
