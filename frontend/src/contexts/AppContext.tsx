import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskSpace, User, Currency, Category } from '../types';
import { MOCK_TASKS, MOCK_USERS, MOCK_SPACES, CURRENCY_RATES, CATEGORIES } from '../constants';
import { addDays, addWeeks, addMonths } from 'date-fns';

interface AppContextType {
  currentUser: User | null;
  tasks: Task[];
  spaces: TaskSpace[];
  categories: Category[];
  login: (email: string) => void;
  logout: () => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  addCategory: (category: Category) => void;
  cashOutBank: (spaceId: string) => void;
  convertBankCurrency: (spaceId: string, newCurrency: string) => void;
  getSpace: (id: string) => TaskSpace | undefined;
  addMemberToSpace: (spaceId: string, email: string) => void;
  removeMemberFromSpace: (spaceId: string, userId: string) => void;
  updateSpaceName: (spaceId: string, name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [spaces, setSpaces] = useState<TaskSpace[]>(MOCK_SPACES);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  const login = (email: string) => {
    // Simple mock login
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) setCurrentUser(user);
    else alert("User not found (try alex@example.com)");
  };

  const logout = () => setCurrentUser(null);

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prevTasks => {
      // Find the old version of the task to compare status
      const oldTask = prevTasks.find(t => t.id === updatedTask.id);
      
      const newTasks = prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t);

      // Check for recurrence triggering
      if (
        oldTask && 
        oldTask.status !== 'completed' && 
        updatedTask.status === 'completed' &&
        updatedTask.recurrence && 
        updatedTask.recurrence !== 'none'
      ) {
        // Create the next instance of the recurring task
        let nextDate = new Date(updatedTask.dueDate);
        switch (updatedTask.recurrence) {
          case 'daily': nextDate = addDays(nextDate, 1); break;
          case 'weekly': nextDate = addWeeks(nextDate, 1); break;
          case 'monthly': nextDate = addMonths(nextDate, 1); break;
        }

        const nextTask: Task = {
          ...updatedTask,
          id: Date.now().toString(), // New ID
          dueDate: nextDate,
          status: 'pending',
          completedBy: [],
          // Reset stages if they exist
          stages: updatedTask.stages?.map(s => ({ ...s, isCompleted: false })),
        };
        
        // Add next task immediately
        return [...newTasks, nextTask];
      }

      return newTasks;
    });
  };

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const cashOutBank = (spaceId: string) => {
    setSpaces(prev => prev.map(s => {
      if (s.id === spaceId) {
        return { ...s, penaltyBank: 0 };
      }
      return s;
    }));
  };

  const convertBankCurrency = (spaceId: string, newCurrency: string) => {
    setSpaces(prev => prev.map(s => {
      if (s.id === spaceId) {
        const rate = CURRENCY_RATES[newCurrency] / CURRENCY_RATES[s.currency];
        return { 
          ...s, 
          currency: newCurrency,
          penaltyBank: parseFloat((s.penaltyBank * rate).toFixed(2))
        };
      }
      return s;
    }));
  };

  const getSpace = (id: string) => spaces.find(s => s.id === id);

  const addMemberToSpace = (spaceId: string, email: string) => {
    setSpaces(prev => prev.map(s => {
      if (s.id !== spaceId) return s;
      
      const normalizedEmail = email.toLowerCase().trim();
      if (s.members.some(m => m.email.toLowerCase() === normalizedEmail)) {
          return s; // Already exists
      }

      // Try to find in mock users or create new
      let user = MOCK_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        user = {
            id: `u-${Date.now()}`,
            name: email.split('@')[0],
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`
        };
      }
      
      return { ...s, members: [...s.members, user] };
    }));
  };

  const removeMemberFromSpace = (spaceId: string, userId: string) => {
    setSpaces(prev => prev.map(s => {
        if (s.id !== spaceId) return s;
        return { ...s, members: s.members.filter(m => m.id !== userId) };
    }));
  };

  const updateSpaceName = (spaceId: string, name: string) => {
    setSpaces(prev => prev.map(s => {
      if (s.id === spaceId) {
        return { ...s, name };
      }
      return s;
    }));
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, tasks, spaces, categories, login, logout, 
      addTask, updateTask, addCategory, cashOutBank, convertBankCurrency, getSpace,
      addMemberToSpace, removeMemberFromSpace, updateSpaceName
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};