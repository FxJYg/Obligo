import React from 'react';
import { Task, TaskStage } from '../types';
import { CheckCircle2, Circle, Users, AlertCircle, RefreshCw, Square, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../contexts/AppContext';
import IconHelper from './IconHelper';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, compact = false }) => {
  const { currentUser, updateTask, spaces, categories } = useApp();
  const category = categories.find(c => c.id === task.categoryId);
  const space = spaces.find(s => s.id === task.spaceId);
  
  const isCompleted = task.status === 'completed';
  const isOverdue = new Date() > new Date(task.dueDate) && !isCompleted;
  const isRecurring = task.recurrence && task.recurrence !== 'none';
  
  // Stages logic
  const stages = task.stages || [];
  const completedStages = stages.filter(s => s.isCompleted).length;
  const totalStages = stages.length;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    let newCompletedBy = [...task.completedBy];
    const userIndex = newCompletedBy.indexOf(currentUser.id);

    if (userIndex >= 0) {
      newCompletedBy.splice(userIndex, 1);
    } else {
      newCompletedBy.push(currentUser.id);
    }

    let newStatus: 'pending' | 'completed' = 'pending';
    
    if (task.isCollaborative) {
        // Must be completed by ALL assignees
        const allDone = task.assignees.every(uid => newCompletedBy.includes(uid));
        newStatus = allDone ? 'completed' : 'pending';
    } else {
        newStatus = newCompletedBy.length > 0 ? 'completed' : 'pending';
    }

    updateTask({
        ...task,
        completedBy: newCompletedBy,
        status: newStatus
    });
  };
  
  const handleStageToggle = (e: React.MouseEvent, stageId: string) => {
      e.stopPropagation();
      const newStages = task.stages?.map(s => 
          s.id === stageId ? { ...s, isCompleted: !s.isCompleted } : s
      );
      updateTask({ ...task, stages: newStages });
  };

  const getUserAvatar = (uid: string) => {
     const u = space?.members.find(m => m.id === uid);
     return u?.avatar || '';
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white dark:bg-neutral-800 rounded-3xl p-5 border border-gray-100 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all cursor-pointer ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 ${category?.color || 'bg-gray-400'}`}>
          <IconHelper name={category?.icon || 'Star'} size={12} />
          {category?.name || 'Task'}
        </div>
        <div className={`text-sm font-bold ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
            {task.currency} {task.worth}
        </div>
      </div>

      <h3 className={`font-bold text-lg mb-1 dark:text-white ${isCompleted ? 'line-through text-gray-400' : 'text-neutral-900'}`}>
        {task.title}
      </h3>
      
      {!compact && <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{task.description}</p>}

      {/* Stages Progress */}
      {!compact && totalStages > 0 && (
          <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-semibold mb-2 text-gray-500 dark:text-gray-400">
                  <span>Progress</span>
                  <span>{completedStages}/{totalStages}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} 
                    style={{ width: `${(completedStages/totalStages)*100}%` }}
                  />
              </div>
              {/* Stages List */}
              <div className="space-y-1.5 pl-1">
                  {stages.map(stage => (
                      <div 
                        key={stage.id} 
                        onClick={(e) => handleStageToggle(e, stage.id)}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700/50 p-1 rounded transition cursor-pointer"
                      >
                          {stage.isCompleted 
                            ? <CheckSquare size={14} className="text-green-500" /> 
                            : <Square size={14} className="text-gray-300" />
                          }
                          <span className={stage.isCompleted ? "line-through opacity-50" : ""}>{stage.title}</span>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex items-center gap-2">
           <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
             <AlertCircle size={12} />
             {format(new Date(task.dueDate), 'MMM d, p')}
           </span>
           
           {isRecurring && (
               <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                   <RefreshCw size={10} />
                   {task.recurrence === 'daily' ? '1D' : task.recurrence === 'weekly' ? '1W' : '1M'}
               </span>
           )}
           
           {task.isCollaborative && (
             <div className="flex items-center -space-x-2 ml-2">
                {task.assignees.map(uid => (
                    <img key={uid} src={getUserAvatar(uid)} alt="assignee" className={`w-6 h-6 rounded-full border-2 border-white dark:border-neutral-800 ${task.completedBy.includes(uid) ? 'opacity-100' : 'opacity-40 grayscale'}`} />
                ))}
             </div>
           )}
        </div>

        <button 
          onClick={handleToggle}
          className={`p-2 rounded-full transition-colors ${isCompleted ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
        >
          {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;