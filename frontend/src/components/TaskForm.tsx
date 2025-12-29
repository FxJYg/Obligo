import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
//import { evaluateTaskWorth } from '../services/geminiService';
import { Task, TaskStage } from '../types';
import { X, Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import IconHelper from './IconHelper';

interface TaskFormProps {
  onClose: () => void;
  spaceId: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, spaceId }) => {
  const { currentUser, addTask, spaces, categories } = useApp();
  const space = spaces.find(s => s.id === spaceId);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [worth, setWorth] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [summary, setSummary] = useState('');
  const [isCollaborative, setIsCollaborative] = useState(false);
  
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59'); // Default to end of day

  // New State
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [stages, setStages] = useState<{title: string}[]>([]);
  const [newStage, setNewStage] = useState('');

  // Set default category
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
        setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleAI = async () => {
    if (!title) return;
    setLoading(true);
    // const result = await evaluateTaskWorth(title, description, space?.currency || 'USD');
    // setWorth(result.worth);
    // setReason(result.reason);
    // setSummary(result.summary);
    setLoading(false);
  };

  const handleAddStage = () => {
      if (!newStage.trim()) return;
      setStages([...stages, { title: newStage }]);
      setNewStage('');
  };

  const handleRemoveStage = (index: number) => {
      const newStages = [...stages];
      newStages.splice(index, 1);
      setStages(newStages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !space) return;

    const taskStages: TaskStage[] = stages.map((s, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        title: s.title,
        isCompleted: false
    }));

    // If no summary provided (AI not used), generate a naive short one (first 3 words)
    const generatedSummary = summary || title.split(' ').slice(0, 3).join(' ');

    // Construct Date with Time
    const now = new Date();
    // If no date selected, default to today
    const dateStr = dueDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const finalDueDate = new Date(`${dateStr}T${dueTime}`);

    const newTask: Task = {
        id: Date.now().toString(),
        title,
        description,
        categoryId,
        worth,
        currency: space.currency,
        dueDate: finalDueDate,
        status: 'pending',
        isCollaborative,
        spaceId,
        assignees: isCollaborative ? space.members.map(m => m.id) : [currentUser.id],
        completedBy: [],
        createdBy: currentUser.id,
        recurrence,
        stages: taskStages.length > 0 ? taskStages : undefined,
        summary: generatedSummary
    };

    addTask(newTask);
    onClose();
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
            <h2 className="text-xl font-bold dark:text-white">New Obligation</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition">
                <X size={20} />
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="e.g., Clean the garage"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white h-20 resize-none"
                    placeholder="Details about the task..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
            </div>

            {/* Stages Section */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sub-tasks / Stages</label>
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3 space-y-2">
                    {stages.map((stage, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white dark:bg-neutral-700 p-2 rounded-lg">
                            <span className="flex-1 text-sm dark:text-gray-200">{stage.title}</span>
                            <button type="button" onClick={() => handleRemoveStage(idx)} className="text-red-400 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                        <input 
                            value={newStage}
                            onChange={e => setNewStage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddStage())}
                            placeholder="Add a step..."
                            className="flex-1 px-3 py-2 text-sm rounded-lg border-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white"
                        />
                        <button type="button" onClick={handleAddStage} className="p-2 bg-black dark:bg-white dark:text-black text-white rounded-lg"><Plus size={16}/></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <div className="relative">
                        <select 
                            value={categoryId} 
                            onChange={e => setCategoryId(e.target.value)}
                            className="w-full px-4 py-3 pl-10 rounded-xl bg-gray-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none"
                        >
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                             <IconHelper name={selectedCategory?.icon || 'Star'} size={16} />
                        </div>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recurrence</label>
                    <select 
                        value={recurrence}
                        onChange={e => setRecurrence(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none"
                    >
                        <option value="none">One-off</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                    <input 
                        type="date"
                        value={dueDate} 
                        onChange={e => setDueDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Time</label>
                    <input 
                        type="time"
                        value={dueTime} 
                        onChange={e => setDueTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-blue-900 dark:text-blue-100">Penalty Worth ({space?.currency})</label>
                    <button 
                        type="button"
                        onClick={handleAI} 
                        disabled={loading || !title}
                        className="flex items-center gap-2 text-xs font-semibold bg-white dark:bg-blue-600 px-3 py-1.5 rounded-lg shadow-sm hover:shadow text-blue-600 dark:text-white transition disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        AI Evaluate
                    </button>
                </div>
                <div className="flex gap-3 items-center">
                     <input 
                        type="number"
                        value={worth}
                        onChange={e => setWorth(Number(e.target.value))}
                        className="w-32 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-lg dark:text-white"
                     />
                     {reason && <p className="text-xs text-blue-700 dark:text-blue-300 italic flex-1">{reason}</p>}
                </div>
                {summary && (
                    <div className="mt-2 text-xs text-blue-500 dark:text-blue-400 border-t border-blue-100 dark:border-blue-800 pt-2">
                        <span className="font-bold">AI Summary:</span> "{summary}" (used for calendar)
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <input 
                    type="checkbox" 
                    id="collab"
                    checked={isCollaborative}
                    onChange={e => setIsCollaborative(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="collab" className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-bold">Combined Task?</span> (All members must complete)
                </label>
            </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-neutral-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-neutral-900">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-neutral-800 transition">Cancel</button>
            <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl font-medium bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-lg transition transform active:scale-95">Create Task</button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;