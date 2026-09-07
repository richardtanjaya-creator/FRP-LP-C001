export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';
export type ProjectStatus = 'on_track' | 'at_risk' | 'delayed' | 'completed';

export interface EncryptedPayload {
  iv: string;
  ciphertext: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  status: TaskStatus;
  priority: PriorityLevel;
  assigneeId: string | null;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  estimatedHours: number;
  tags: string[];
  urgencyScore: number; // 0 - 100 calculated dynamically
  isBlocked: boolean;
  blockerReason?: string;
  
  // End-to-End Encrypted confidential payload (stored encrypted in cloud & local)
  encryptedPayload?: EncryptedPayload;
  
  // Client-side decrypted fields (in-memory only when vault unlocked)
  confidentialNotes?: string;
  clientBudget?: string;
  
  createdAt: string;
  updatedAt: string;
  pendingSync?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  stakeholder: string;
  dueDate: string;
  status: ProjectStatus;
  color: string;
  budgetAllocated?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  skills: string[];
  maxCapacityHours: number;
  status: 'active' | 'busy' | 'away';
}

export interface WeeklySummary {
  id: string;
  generatedAt: string;
  period: string;
  recipientEmail: string;
  overallStatus: 'On Track' | 'Attention Needed' | 'Critical Bottlenecks';
  executiveSummary: string;
  incompleteProjects: {
    projectName: string;
    progress: number;
    blocker?: string;
    remainingTasks: number;
    dueDate: string;
  }[];
  urgentTasks: {
    title: string;
    assignee: string;
    dueDate: string;
    priority: PriorityLevel;
    urgencyReason: string;
  }[];
  workloadAlerts: string[];
  nextWeekPriorities: string[];
  emailDraft: string;
  sentStatus: 'draft' | 'sent' | 'scheduled';
  sentAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'urgency' | 'status' | 'system' | 'email';
  timestamp: string;
  read: boolean;
  taskId?: string;
}

export interface CloudSyncPayload {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  lastUpdated: string;
  clientVersion: number;
}

export interface VaultState {
  isUnlocked: boolean;
  passphraseHash?: string;
}
