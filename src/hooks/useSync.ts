import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, Project, TeamMember, CloudSyncPayload } from '../types';
import { INITIAL_TASKS, INITIAL_PROJECTS, INITIAL_TEAM_MEMBERS } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'autotask_workspace_v1';
const SYNC_QUEUE_KEY = 'autotask_sync_queue_v1';

export function useSync() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.tasks || INITIAL_TASKS;
      } catch (e) {
        console.error('Failed to parse local tasks:', e);
      }
    }
    return INITIAL_TASKS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.projects || INITIAL_PROJECTS;
      } catch (e) {
        console.error('Failed to parse local projects:', e);
      }
    }
    return INITIAL_PROJECTS;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.teamMembers || INITIAL_TEAM_MEMBERS;
      } catch (e) {
        console.error('Failed to parse local team members:', e);
      }
    }
    return INITIAL_TEAM_MEMBERS;
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => new Date().toISOString());
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);

  const effectiveOnline = isOnline && !simulatedOffline;
  const isSyncingRef = useRef(false);

  // Monitor real browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const payload = {
      tasks,
      projects,
      teamMembers,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
  }, [tasks, projects, teamMembers]);

  // Sync with cloud backend
  const syncWithCloud = useCallback(
    async (overrideTasks?: Task[]) => {
      if (!effectiveOnline) {
        setSyncStatus('offline');
        return;
      }

      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      setSyncStatus('syncing');

      try {
        const currentTasks = overrideTasks || tasks;
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tasks: currentTasks,
            projects,
            teamMembers,
            clientVersion: Date.now(),
          }),
        });

        if (res.ok) {
          const result = await res.json();
          setSyncStatus('synced');
          setLastSyncedAt(new Date().toISOString());
          setPendingQueueCount(0);
          localStorage.removeItem(SYNC_QUEUE_KEY);
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.warn('Sync failed (likely offline or server unreachable):', err);
        setSyncStatus(effectiveOnline ? 'error' : 'offline');
      } finally {
        isSyncingRef.current = false;
      }
    },
    [effectiveOnline, tasks, projects, teamMembers]
  );

  // Attempt sync when coming back online
  useEffect(() => {
    if (effectiveOnline && syncStatus === 'offline') {
      syncWithCloud();
    }
  }, [effectiveOnline, syncStatus, syncWithCloud]);

  const toggleSimulateOffline = () => {
    setSimulatedOffline((prev) => {
      const next = !prev;
      if (next) {
        setSyncStatus('offline');
      } else {
        setTimeout(() => syncWithCloud(), 300);
      }
      return next;
    });
  };

  return {
    tasks,
    setTasks,
    projects,
    setProjects,
    teamMembers,
    setTeamMembers,
    isOnline: effectiveOnline,
    simulatedOffline,
    toggleSimulateOffline,
    syncStatus,
    lastSyncedAt,
    pendingQueueCount,
    syncWithCloud,
  };
}
