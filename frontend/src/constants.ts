import { Category, Currency, Task, TaskSpace, User } from "./types";
import { addDays } from "date-fns";

export const CURRENCY_RATES: Record<string, number> = {
  [Currency.USD]: 1,
  [Currency.EUR]: 0.92,
  [Currency.GBP]: 0.79,
  [Currency.JPY]: 150.5,
};

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Household', color: 'bg-blue-500', icon: 'Home' },
  { id: '2', name: 'Work', color: 'bg-emerald-500', icon: 'Briefcase' },
  { id: '3', name: 'Health', color: 'bg-rose-500', icon: 'Heart' },
  { id: '4', name: 'Social', color: 'bg-purple-500', icon: 'Users' },
];

// Mock Data
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alex Doe', email: 'alex@example.com', avatar: 'https://picsum.photos/100/100?random=1' },
  { id: 'u2', name: 'Jordan Smith', email: 'jordan@example.com', avatar: 'https://picsum.photos/100/100?random=2' },
];

export const MOCK_SPACES: TaskSpace[] = [
  {
    id: 's1',
    name: 'Roommates 101',
    members: [MOCK_USERS[0], MOCK_USERS[1]],
    penaltyBank: 45.50,
    currency: Currency.USD,
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Clean the kitchen',
    description: 'Scrub the counters and mop the floor.',
    categoryId: '1',
    worth: 15,
    currency: Currency.USD,
    dueDate: new Date(),
    status: 'pending',
    isCollaborative: true,
    spaceId: 's1',
    assignees: ['u1', 'u2'],
    completedBy: ['u1'], // Waiting for u2
    createdBy: 'u1',
    recurrence: 'weekly',
    summary: 'Kitchen Clean',
    stages: [
        { id: 's1', title: 'Wipe counters', isCompleted: true },
        { id: 's2', title: 'Mop floor', isCompleted: false },
        { id: 's3', title: 'Empty trash', isCompleted: false }
    ]
  },
  {
    id: 't2',
    title: 'Morning Jog',
    description: 'Run 5km before 8am.',
    categoryId: '3',
    worth: 10,
    currency: Currency.USD,
    dueDate: addDays(new Date(), 1),
    status: 'pending',
    isCollaborative: false,
    spaceId: 's1',
    assignees: ['u1'],
    completedBy: [],
    createdBy: 'u1',
    recurrence: 'daily',
    summary: 'Morning Jog'
  },
  {
    id: 't3',
    title: 'Pay Electricity Bill',
    description: 'Online payment via portal.',
    categoryId: '1',
    worth: 50,
    currency: Currency.USD,
    dueDate: addDays(new Date(), -2),
    status: 'completed',
    isCollaborative: false,
    spaceId: 's1',
    assignees: ['u2'],
    completedBy: ['u2'],
    createdBy: 'u2',
    recurrence: 'monthly',
    summary: 'Pay Electric'
  }
];