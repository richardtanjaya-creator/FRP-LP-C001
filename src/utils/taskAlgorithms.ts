import { Task, TeamMember } from '../types';

/**
 * Calculates a dynamic urgency score (0 - 100) based on due date proximity,
 * priority level, and blocker status.
 */
export function calculateUrgencyScore(task: Task): number {
  if (task.status === 'done') {
    return 0;
  }

  let score = 0;

  // Base score from priority
  switch (task.priority) {
    case 'urgent':
      score += 40;
      break;
    case 'high':
      score += 28;
      break;
    case 'medium':
      score += 15;
      break;
    case 'low':
      score += 5;
      break;
  }

  // Blocker penalty (blocked items demand urgent stakeholder triage)
  if (task.isBlocked) {
    score += 15;
  }

  // Due date proximity calculation
  if (task.dueDate) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [year, month, day] = task.dueDate.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // Overdue
      score += 45;
    } else if (diffDays === 0) {
      // Due today
      score += 40;
    } else if (diffDays <= 2) {
      // Due in 1-2 days
      score += 30;
    } else if (diffDays <= 5) {
      // Due within the week
      score += 18;
    } else if (diffDays <= 10) {
      score += 8;
    }
  }

  // In-progress bonus to maintain momentum
  if (task.status === 'in_progress') {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

export interface AssignmentResult {
  memberId: string;
  memberName: string;
  matchScore: number;
  reason: string;
}

/**
 * Automatically assigns a task to the most suitable team member based on:
 * 1. Skill tag overlap
 * 2. Real-time capacity and workload headroom
 * 3. Availability status
 */
export function findBestAssignee(
  task: Task,
  teamMembers: TeamMember[],
  allTasks: Task[]
): AssignmentResult | null {
  if (!teamMembers || teamMembers.length === 0) {
    return null;
  }

  // Calculate current active workload hours for each team member
  const memberWorkloadHours: Record<string, number> = {};
  for (const member of teamMembers) {
    memberWorkloadHours[member.id] = 0;
  }

  for (const t of allTasks) {
    if (t.assigneeId && t.status !== 'done' && t.id !== task.id) {
      memberWorkloadHours[t.assigneeId] =
        (memberWorkloadHours[t.assigneeId] || 0) + (t.estimatedHours || 4);
    }
  }

  let bestMember: TeamMember | null = null;
  let highestScore = -Infinity;
  let matchReason = '';

  for (const member of teamMembers) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Availability Status
    if (member.status === 'away') {
      score -= 50;
      reasons.push('Out of office');
    } else if (member.status === 'busy') {
      score -= 10;
    } else {
      score += 15;
    }

    // 2. Skill Tag Overlap
    const taskTagsLower = task.tags.map((t) => t.toLowerCase());
    const memberSkillsLower = member.skills.map((s) => s.toLowerCase());

    const matchingSkills = taskTagsLower.filter((tag) =>
      memberSkillsLower.some((skill) => skill.includes(tag) || tag.includes(skill))
    );

    if (matchingSkills.length > 0) {
      score += matchingSkills.length * 25;
      reasons.push(`Matches skills (${matchingSkills.join(', ')})`);
    }

    // 3. Workload Headroom & Capacity Balance
    const currentLoad = memberWorkloadHours[member.id] || 0;
    const maxCapacity = member.maxCapacityHours || 40;
    const projectedLoad = currentLoad + (task.estimatedHours || 4);
    const utilizationRate = projectedLoad / maxCapacity;

    if (utilizationRate < 0.6) {
      score += 35;
      reasons.push(`Optimal capacity (${Math.round(utilizationRate * 100)}% load)`);
    } else if (utilizationRate <= 0.85) {
      score += 20;
      reasons.push(`Comfortable bandwidth (${Math.round(utilizationRate * 100)}% load)`);
    } else if (utilizationRate <= 1.0) {
      score += 5;
      reasons.push('Near maximum capacity');
    } else {
      score -= 30;
      reasons.push('Currently over capacity');
    }

    if (score > highestScore) {
      highestScore = score;
      bestMember = member;
      matchReason = reasons.join(' • ');
    }
  }

  if (!bestMember) {
    return null;
  }

  return {
    memberId: bestMember.id,
    memberName: bestMember.name,
    matchScore: Math.max(10, Math.min(99, highestScore)),
    reason: matchReason || 'Best available team workload match',
  };
}

/**
 * Automatically assigns all unassigned tasks across the team in an equitable batch.
 */
export function autoAssignAllUnassigned(
  tasks: Task[],
  teamMembers: TeamMember[]
): { updatedTasks: Task[]; assignmentsCount: number; details: string[] } {
  const updatedTasks = [...tasks];
  let assignmentsCount = 0;
  const details: string[] = [];

  for (let i = 0; i < updatedTasks.length; i++) {
    const task = updatedTasks[i];
    if (!task.assigneeId && task.status !== 'done') {
      const assignment = findBestAssignee(task, teamMembers, updatedTasks);
      if (assignment) {
        updatedTasks[i] = {
          ...task,
          assigneeId: assignment.memberId,
          updatedAt: new Date().toISOString(),
          pendingSync: true,
        };
        assignmentsCount++;
        details.push(`"${task.title}" → ${assignment.memberName} (${assignment.reason})`);
      }
    }
  }

  return { updatedTasks, assignmentsCount, details };
}

/**
 * Sorts tasks by Urgency Score in descending order.
 */
export function sortTasksByUrgency(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const scoreA = calculateUrgencyScore(a);
    const scoreB = calculateUrgencyScore(b);
    return scoreB - scoreA;
  });
}
