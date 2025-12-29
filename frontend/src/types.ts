export type ThemeMode = 'light' | 'dark';
export type Season = 'none' | 'winter';

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string; // Icon name identifier
}

export interface TaskStage {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  worth: number; // Penalty value
  currency: string;
  dueDate: Date;
  status: 'pending' | 'completed';
  isCollaborative: boolean;
  spaceId: string;
  assignees: string[]; // User IDs
  completedBy: string[]; // User IDs who marked it as done
  createdBy: string;
  stages?: TaskStage[];
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  summary?: string; // AI generated short title
}

export interface TaskSpace {
  id: string;
  name: string;
  members: User[];
  penaltyBank: number; // Accumulated penalty
  currency: string;
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
}