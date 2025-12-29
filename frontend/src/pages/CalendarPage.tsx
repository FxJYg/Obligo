import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  isSameDay, format, isSameMonth, isToday, 
  addMonths, addWeeks, addDays, 
  eachDayOfInterval
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Grid, AlignLeft, Clock, 
  Plus, ArrowLeft, Snowflake, CheckCircle2, Circle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import { useTheme } from '../contexts/ThemeContext';
import { Task } from '../types';
import IconHelper from '../components/IconHelper';

type ViewMode = 'month' | 'week' | 'day';

// Local implementations replacing missing date-fns exports
const startOfMonth = (date: Date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfMonth = (date: Date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Adjust to Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (6 - day); // Adjust to Saturday
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Local date helpers to ensure consistency
const getStartOfMonth = (date: Date) => startOfMonth(date);
const getEndOfMonth = (date: Date) => endOfMonth(date);
const getStartOfWeek = (date: Date) => startOfWeek(date);
const getEndOfWeek = (date: Date) => endOfWeek(date);

const CalendarPage: React.FC = () => {
  const { tasks, categories, spaces, updateTask } = useApp();
  const { season } = useTheme();
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month'); // Default to month
  const [showForm, setShowForm] = useState(false);

  // Navigation Logic
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, -1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, -1));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const getDayTasks = (date: Date) => tasks.filter(t => isSameDay(new Date(t.dueDate), date));
  
  const selectedDayTasks = getDayTasks(currentDate);
  const dailyTotal = selectedDayTasks.reduce((acc, t) => acc + t.worth, 0);

  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getCategoryName = (id: string) => getCategory(id)?.name.toUpperCase() || 'GENERAL';
  
  // Helper to convert strong bg colors to pastel styles for the calendar pills/cards
  const getPillStyle = (categoryId: string) => {
      const cat = getCategory(categoryId);
      const colorClass = cat?.color || 'bg-gray-500';
      
      // Map basic tailwind colors to their pastel/text counterparts
      if (colorClass.includes('blue')) return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      if (colorClass.includes('emerald') || colorClass.includes('green')) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      if (colorClass.includes('rose') || colorClass.includes('red')) return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
      if (colorClass.includes('purple')) return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      if (colorClass.includes('orange')) return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      if (colorClass.includes('cyan')) return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300';
      if (colorClass.includes('yellow')) return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      if (colorClass.includes('slate')) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      
      return 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300';
  };

  // --- Sub-Components ---

  const TimelineTaskCard: React.FC<{ task: Task, style?: React.CSSProperties }> = ({ task, style }) => {
     const isCompleted = task.status === 'completed';
     const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateTask({
            ...task,
            status: isCompleted ? 'pending' : 'completed',
            completedBy: isCompleted ? [] : [task.createdBy]
        });
     };

     return (
        <div 
            onClick={handleToggle}
            className={`
                group absolute left-16 right-4 p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 shadow-sm hover:shadow-lg transition-all cursor-pointer flex justify-between items-center z-20
                ${isCompleted ? 'opacity-50 grayscale' : ''}
            `}
            style={{...style, height: 'auto', minHeight: '80px'}}
        >
            <div className="flex-1 pr-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock size={10} />
                        {format(new Date(task.dueDate), 'h:mm a')}
                     </span>
                     <span className="text-[10px] font-bold text-gray-300 dark:text-neutral-500 uppercase tracking-wider">
                        {getCategoryName(task.categoryId)}
                     </span>
                </div>
                <h3 className={`font-black text-lg text-neutral-900 dark:text-white leading-tight ${isCompleted ? 'line-through' : ''}`}>
                    {task.title}
                </h3>
                <p className="text-gray-500 text-xs font-medium line-clamp-1 mt-1">{task.description}</p>
            </div>
            
            <div className="flex flex-col items-end justify-center h-full pl-4 border-l border-gray-50 dark:border-neutral-700">
                 <div className="text-base font-black text-neutral-900 dark:text-white">
                    ${task.worth}
                 </div>
                 {isCompleted ? (
                    <div className="text-green-500 mt-1"><CheckCircle2 size={20} /></div>
                 ) : (
                    <div className="text-gray-200 dark:text-neutral-700 group-hover:text-blue-500 transition-colors mt-1"><Circle size={20} /></div>
                 )}
            </div>
        </div>
     );
  };

  const DayView = () => {
    const hours = Array.from({ length: 19 }, (_, i) => i + 6); // 6 AM to 12 AM
    return (
      <div className="relative min-h-full pb-32 pt-10 px-6">
         {/* Decorative Background Elements */}
         <Snowflake className="absolute top-20 right-20 text-blue-100 dark:text-white/5 opacity-50 animate-pulse" size={40} />
         <Snowflake className="absolute bottom-40 left-10 text-blue-50 dark:text-white/5 opacity-30" size={24} />
         
         <div className="space-y-32 relative z-10">
            {hours.map(hour => (
                <div key={hour} className="flex items-center relative h-0">
                    <span className="w-12 text-[10px] font-bold text-gray-300 dark:text-neutral-600 uppercase">
                        {hour > 12 ? `${hour - 12}PM` : hour === 12 ? '12PM' : `${hour}AM`}
                    </span>
                    <div className="flex-1 h-px bg-gray-50 dark:bg-neutral-800 w-full" />
                </div>
            ))}
            {selectedDayTasks.map(task => {
                const date = new Date(task.dueDate);
                const taskHour = date.getHours();
                const taskMin = date.getMinutes();
                const startHour = 6;
                // Simple vertical positioning: 1 hour = 8rem (128px) based on space-y-32
                const hourHeight = 128; 
                
                if (taskHour < startHour) return null;
                const topPosition = ((taskHour - startHour) * hourHeight) + ((taskMin / 60) * hourHeight) + 40; // +40 for padding-top offset
                
                return <TimelineTaskCard key={task.id} task={task} style={{ top: `${topPosition}px` }} />;
            })}
         </div>
         
         {selectedDayTasks.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none mt-20">
                 <span className="text-4xl font-black text-gray-300 dark:text-neutral-700 uppercase tracking-widest">Free Day</span>
             </div>
         )}
      </div>
    );
  };

  const WeekView = () => {
    const start = getStartOfWeek(currentDate);
    const end = getEndOfWeek(currentDate);
    const days = eachDayOfInterval({ start, end });

    return (
        <div className="h-full flex flex-col pt-6 pb-2 px-6 overflow-hidden">
             {/* Wrapper for horizontal scroll on small screens */}
             <div className="flex-1 overflow-auto custom-scrollbar">
                <div className="min-w-[900px] h-full flex flex-col">
                    {/* Header */}
                    <div className="grid grid-cols-7 mb-2 border-b border-gray-100 dark:border-neutral-800 pb-4">
                        {days.map(day => {
                            const isSelected = isSameDay(day, currentDate);
                            const isTodayDate = isToday(day);
                            return (
                                <div 
                                    key={day.toISOString()} 
                                    onClick={() => setCurrentDate(day)}
                                    className={`flex flex-col items-center cursor-pointer transition-all hover:opacity-100 group ${isSelected ? 'opacity-100' : 'opacity-50'}`}
                                >
                                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isTodayDate ? 'text-blue-500' : 'text-gray-400 group-hover:text-neutral-900 dark:group-hover:text-white'}`}>
                                        {format(day, 'EEE')}
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black transition-all ${
                                        isSelected 
                                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-lg scale-110' 
                                            : isTodayDate 
                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                                : 'text-neutral-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800'
                                    }`}>
                                        {format(day, 'd')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Columns */}
                    <div className="flex-1 grid grid-cols-7 divide-x divide-gray-100 dark:divide-neutral-800 min-h-0 -mx-2">
                        {days.map(day => {
                            const dTasks = getDayTasks(day).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                            const isSelected = isSameDay(day, currentDate);
                            const isTodayDate = isToday(day);
                            
                            return (
                                <div 
                                    key={day.toISOString()} 
                                    onClick={() => setCurrentDate(day)}
                                    className={`flex flex-col gap-3 py-4 px-2 transition-colors min-h-full ${
                                        isSelected ? 'bg-gray-50/50 dark:bg-neutral-800/30' : ''
                                    } ${isTodayDate && !isSelected ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}
                                >
                                    {dTasks.map(t => {
                                        const cat = getCategory(t.categoryId);
                                        const pillStyle = getPillStyle(t.categoryId);
                                        const displayTitle = t.summary || t.title;

                                        return (
                                            <div key={t.id} className={`p-3 bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all group cursor-pointer ${t.status === 'completed' ? 'opacity-40 grayscale' : ''}`}>
                                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md w-fit max-w-full mb-2 ${pillStyle}`}>
                                                    <div className="flex-shrink-0">
                                                        <IconHelper name={cat?.icon || 'Circle'} size={10} />
                                                    </div>
                                                    <span className="text-[9px] font-bold uppercase truncate">{cat?.name}</span>
                                                </div>
                                                
                                                <div className="text-xs font-bold text-neutral-900 dark:text-white leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 break-words">
                                                    {displayTitle}
                                                </div>
                                                
                                                <div className="flex justify-between items-end border-t border-gray-50 dark:border-neutral-700 pt-2">
                                                    <div className="text-[10px] text-gray-400 font-medium">
                                                        ${t.worth}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>
             </div>
        </div>
    );
  };

  const MonthView = () => {
    const monthStart = getStartOfMonth(currentDate);
    const monthEnd = getEndOfMonth(currentDate);
    const days = eachDayOfInterval({ start: getStartOfWeek(monthStart), end: getEndOfWeek(monthEnd) });
    
    return (
        <div className="h-full flex flex-col p-6 overflow-hidden">
             {/* Header */}
             <div className="grid grid-cols-7 mb-4 flex-shrink-0">
                {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                    <div key={d} className="text-center text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest py-2">
                        {d}
                    </div>
                ))}
             </div>
             
             {/* Grid */}
             <div className="flex-1 grid grid-cols-7 grid-rows-6 border-t border-l border-gray-100 dark:border-neutral-800 min-h-0">
                {days.map(day => {
                    const isCurrMonth = isSameMonth(day, currentDate);
                    const isSel = isSameDay(day, currentDate);
                    const isTodayDate = isToday(day);
                    const dTasks = getDayTasks(day);
                    
                    return (
                        <div 
                            key={day.toISOString()}
                            onClick={() => { setCurrentDate(day); }}
                            className={`
                                relative border-r border-b border-gray-100 dark:border-neutral-800 transition-colors cursor-pointer flex flex-col p-2 group overflow-hidden
                                ${isSel 
                                    ? 'bg-blue-50/30 dark:bg-blue-900/10' 
                                    : 'bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                }
                                ${!isCurrMonth ? 'bg-gray-50/50 dark:bg-neutral-950/50' : ''}
                            `}
                        >
                            {/* Snow Effect (Optional, subtle per cell) */}
                            {season === 'winter' && Math.random() > 0.8 && (
                                <Snowflake className="absolute top-2 right-2 text-blue-100 dark:text-blue-900/40 opacity-50 pointer-events-none" size={14} />
                            )}

                            <div className="flex justify-between items-start mb-2">
                                <span className={`
                                    text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors flex-shrink-0
                                    ${isTodayDate 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : !isCurrMonth 
                                            ? 'text-gray-300 dark:text-neutral-700' 
                                            : 'text-gray-700 dark:text-gray-300'
                                    }
                                `}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            {/* Task Pills */}
                            <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
                                {dTasks.slice(0, 3).map(t => {
                                    const cat = getCategory(t.categoryId);
                                    const pillStyle = getPillStyle(t.categoryId);
                                    // Use summary, or fallback to short title on the fly
                                    const displayTitle = t.summary || t.title.split(' ').slice(0, 3).join(' ');

                                    return (
                                        <div 
                                            key={t.id} 
                                            title={t.title}
                                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg min-w-0 transition-transform hover:scale-[1.02] ${pillStyle} ${t.status === 'completed' ? 'opacity-50 grayscale' : ''}`}
                                        >
                                            <div className="flex-shrink-0">
                                                <IconHelper name={cat?.icon || 'Circle'} size={12} />
                                            </div>
                                            <span className="text-[10px] font-bold truncate leading-none pt-0.5">
                                                {displayTitle}
                                            </span>
                                        </div>
                                    )
                                })}
                                {dTasks.length > 3 && (
                                    <div className="px-2">
                                        <span className="text-[9px] font-bold text-gray-400">
                                            +{dTasks.length - 3} more
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
             </div>
        </div>
    )
  };

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100vh-6rem)] bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-neutral-800">
      
      {/* LEFT SIDEBAR (Navigation & Summary) */}
      <div className="w-full md:w-[290px] flex-shrink-0 flex flex-col p-6 md:border-r border-gray-100 dark:border-neutral-800 relative bg-white dark:bg-neutral-900 z-20">
        
        {/* Top Controls */}
        <div className="flex justify-between items-start mb-8 md:mb-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 text-[10px] font-bold text-gray-400 hover:text-neutral-900 dark:hover:text-white transition uppercase tracking-[0.2em]">
                <ArrowLeft size={14} /> Exit
            </button>
            
            {/* View Switcher (Mini) */}
            <div className="flex bg-gray-50 dark:bg-neutral-800 p-1 rounded-xl">
                {(['day', 'week', 'month'] as const).map(m => (
                    <button 
                        key={m}
                        onClick={() => setViewMode(m)}
                        className={`p-2 rounded-lg transition ${viewMode === m ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}
                        title={m}
                    >
                        {m === 'day' ? <Clock size={14} /> : m === 'week' ? <AlignLeft size={14} /> : <Grid size={14} />}
                    </button>
                ))}
            </div>
        </div>

        {/* Date Display */}
        <div className="mb-auto">
            <div className="text-8xl md:text-[9rem] leading-none font-black tracking-tighter text-neutral-900 dark:text-white -ml-2 md:-ml-3">
                {format(currentDate, 'd')}
            </div>
            <div className="text-blue-600 dark:text-blue-400 font-bold text-sm tracking-[0.25em] uppercase mb-10 pl-1">
                {format(currentDate, 'MMMM yyyy')}
            </div>
            
            <div className="flex gap-3 pl-1">
                <button onClick={handlePrev} className="w-14 h-14 rounded-full border border-gray-100 dark:border-neutral-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-800 transition text-neutral-900 dark:text-white">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={handleNext} className="w-14 h-14 rounded-full border border-gray-100 dark:border-neutral-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-800 transition text-neutral-900 dark:text-white">
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 md:mt-12">
            <div className="mb-8 pl-1 hidden md:block">
                <div className="text-[10px] font-bold text-gray-300 dark:text-neutral-500 uppercase tracking-[0.2em] mb-2">
                     Daily Obligation
                </div>
                <div className="text-5xl font-black text-neutral-900 dark:text-white tracking-tighter">
                    ${dailyTotal.toFixed(2)}
                </div>
            </div>
            
            <button 
                onClick={() => setShowForm(true)}
                className="w-full py-4 md:py-5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-3xl font-bold text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform shadow-xl flex items-center justify-center gap-3"
            >
               <Plus size={16} /> New Entry
            </button>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 relative bg-white/40 dark:bg-neutral-950/40 custom-scrollbar overflow-hidden min-h-[500px]">
          {viewMode === 'day' && <div className="h-full overflow-y-auto"><DayView /></div>}
          {viewMode === 'week' && <WeekView />}
          {viewMode === 'month' && <MonthView />}
      </div>

      {showForm && spaces.length > 0 && <TaskForm spaceId={spaces[0].id} onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default CalendarPage;