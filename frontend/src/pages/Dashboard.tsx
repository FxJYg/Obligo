import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import TaskCard from '../components/TaskCard';
import { TrendingUp, ChevronRight, X, CheckCircle2, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { currentUser, tasks, spaces } = useApp();
  const { season } = useTheme();
  const [filter, setFilter] = useState<'all' | 'mine' | 'team'>('all');
  const [showLedger, setShowLedger] = useState(false);
  
  if (!currentUser) return null;

  // 1. Identify User's Spaces
  const userSpaces = spaces.filter(s => s.members.some(m => m.id === currentUser.id));
  const userSpaceIds = userSpaces.map(s => s.id);
  const activeSpace = userSpaces[0];

  // 2. Filter tasks relevant to these spaces
  const allSpaceTasks = tasks.filter(t => userSpaceIds.includes(t.spaceId));
  
  // 3. Calculate Totals (Pending Tasks - "At Risk")
  const totalPendingValue = allSpaceTasks
    .filter(t => t.status === 'pending')
    .reduce((acc, t) => acc + t.worth, 0);

  const myPendingTasks = allSpaceTasks.filter(t => 
    t.status === 'pending' && t.assignees.includes(currentUser.id)
  );
  
  const myPendingValue = myPendingTasks.reduce((acc, t) => acc + t.worth, 0);

  const contributionPercentage = totalPendingValue > 0 
    ? Math.round((myPendingValue / totalPendingValue) * 100) 
    : 0;

  // 4. Recent Activity / Ledger Data
  const completedTasks = allSpaceTasks
    .filter(t => t.status === 'completed')
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const recentActivity = completedTasks.slice(0, 3);

  // 5. Filter Logic for Display Grid
  const displayedTasks = allSpaceTasks.filter(t => {
      if (t.status !== 'pending') return false;
      const isMine = t.assignees.includes(currentUser.id);
      if (filter === 'mine') return isMine;
      if (filter === 'team') return !isMine;
      return true; // 'all'
  });

  const getMemberAvatar = (memberId: string) => {
      const member = activeSpace?.members.find(m => m.id === memberId);
      return member?.avatar;
  };

  return (
    <div className="pb-10">
      {/* Standard Header */}
      <header className="mb-8">
         <div>
            <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                Welcome back, {currentUser.name.split(' ')[0]}.
            </h1>
         </div>
      </header>

      {/* OVERVIEW SUMMARY CARD */}
      <div className="bg-white dark:bg-neutral-800 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-neutral-700 mb-8">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl">
                    <TrendingUp size={24} />
                </div>
                <h2 className="text-xl font-bold dark:text-white">Overview Summary</h2>
            </div>
            <button 
                onClick={() => setShowLedger(true)}
                className="text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center gap-1 hover:opacity-80 transition"
            >
                View Ledger <ChevronRight size={16} />
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:divide-x dark:divide-neutral-700">
            {/* Total Value */}
            <div className="space-y-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">TOTAL VALUE</div>
                <div className="text-5xl font-black text-neutral-900 dark:text-white tracking-tighter">
                    ${totalPendingValue.toFixed(2)}
                </div>
                <p className="text-gray-500 text-sm font-medium mt-2">Total value of tasks in the space.</p>
            </div>

            {/* Contribution */}
            <div className="space-y-3 lg:px-8">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">YOUR CONTRIBUTION</div>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight">${myPendingValue}</span>
                    <span className="text-gray-400 font-medium">/ ${totalPendingValue} total</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${contributionPercentage}%` }}></div>
                </div>
                <p className="text-gray-500 text-sm font-medium">You are responsible for {contributionPercentage}% of the total.</p>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4 lg:px-8">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">RECENT ACTIVITY</div>
                <div className="space-y-5">
                    {recentActivity.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No recent activity recorded.</p>
                    ) : (
                        recentActivity.map(task => {
                             const user = activeSpace?.members.find(u => u.id === task.assignees[0]);
                             return (
                                <div key={task.id} className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-700 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-neutral-600 text-xs font-bold">
                                            {user ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-gray-500">?</span>}
                                        </div>
                                        <span className="text-sm font-bold text-neutral-700 dark:text-gray-200 truncate max-w-[140px]">{task.title}</span>
                                    </div>
                                    <span className="font-bold text-neutral-900 dark:text-white">${task.worth}</span>
                                </div>
                             )
                        })
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Pending Commitments Section */}
       <div>
           <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Pending Commitments</h2>
                    <p className="text-gray-500 font-medium mt-1">Tasks at risk of forfeiture.</p>
                </div>
                
                {/* Filter Toggle */}
                <div className="bg-white dark:bg-neutral-800 p-1.5 rounded-full border border-gray-100 dark:border-neutral-700 flex items-center shadow-sm w-full sm:w-auto overflow-x-auto">
                    {(['all', 'mine', 'team'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 sm:flex-none px-6 py-1.5 rounded-full text-sm font-bold transition-all capitalize whitespace-nowrap ${
                                filter === f 
                                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' 
                                : 'text-gray-500 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
           </div>

          {/* Task Grid */}
          {displayedTasks.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-3xl">
                  <p className="text-gray-400 font-medium">No pending commitments found.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                ))}
              </div>
          )}
       </div>

       {/* Ledger Modal */}
       {showLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-900">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" /> Space Ledger
                        </h2>
                        <p className="text-sm text-gray-500">History of completed obligations and cleared debts.</p>
                    </div>
                    <button onClick={() => setShowLedger(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="min-w-full overflow-x-auto">
                        <div className="min-w-[600px]">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/80 dark:bg-neutral-800/50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-neutral-800 sticky top-0 backdrop-blur-md">
                                <div className="col-span-5">Task Details</div>
                                <div className="col-span-3">Completed By</div>
                                <div className="col-span-2">Due Date</div>
                                <div className="col-span-2 text-right">Value</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                                {completedTasks.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400">
                                        <p>No completed tasks found in the ledger.</p>
                                    </div>
                                ) : (
                                    completedTasks.map(task => (
                                        <div key={task.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition-colors">
                                            <div className="col-span-5">
                                                <div className="font-bold text-gray-900 dark:text-white">{task.title}</div>
                                                <div className="text-xs text-gray-500 truncate">{task.description}</div>
                                            </div>
                                            <div className="col-span-3 flex items-center -space-x-2">
                                                {task.completedBy.length > 0 ? (
                                                    task.completedBy.map(uid => (
                                                        <img 
                                                            key={uid}
                                                            src={getMemberAvatar(uid)} 
                                                            title={uid}
                                                            className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900"
                                                            alt="User" 
                                                        />
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Unknown</span>
                                                )}
                                            </div>
                                            <div className="col-span-2 flex items-center gap-1.5 text-sm text-gray-500">
                                                <Calendar size={14} />
                                                {format(new Date(task.dueDate), 'MMM d')}
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    +{task.currency} {task.worth}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Total Value Cleared
                    </div>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white">
                        ${completedTasks.reduce((acc, t) => acc + t.worth, 0).toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
       )}
    </div>
  );
};

export default Dashboard;