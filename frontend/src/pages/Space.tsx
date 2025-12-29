import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import PenaltyBank from '../components/PenaltyBank';
import { Plus, Users, Settings, X, Trash2, Mail, Edit3 } from 'lucide-react';

const SpacePage: React.FC = () => {
  const { spaces, tasks, currentUser, addMemberToSpace, removeMemberFromSpace, updateSpaceName } = useApp();
  // Simplified: Focus on first space for now
  const activeSpace = spaces[0];
  const [showForm, setShowForm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [spaceNameEdit, setSpaceNameEdit] = useState('');

  // Sync space name when modal opens or active space changes
  useEffect(() => {
    if (activeSpace) {
      setSpaceNameEdit(activeSpace.name);
    }
  }, [activeSpace, showSettingsModal]);

  if (!activeSpace) return <div>No Space Found</div>;

  const spaceTasks = tasks.filter(t => t.spaceId === activeSpace.id);
  const activeTasks = spaceTasks.filter(t => t.status === 'pending');
  const collaborativeTasks = activeTasks.filter(t => t.isCollaborative);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if(!inviteEmail) return;
    addMemberToSpace(activeSpace.id, inviteEmail);
    setInviteEmail('');
  };

  const handleNameSave = () => {
      if (spaceNameEdit.trim()) {
          updateSpaceName(activeSpace.id, spaceNameEdit.trim());
      }
  };

  return (
    <div className="pb-10">
      {/* Standard Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{activeSpace.name}</h1>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {activeSpace.members.length} Members
                    </span>
                    <button 
                        onClick={() => setShowSettingsModal(true)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition"
                        title="Space Settings"
                    >
                        <Settings size={16} />
                    </button>
                </div>
           </div>
           <p className="text-gray-500 mt-1 max-w-lg">Manage shared responsibilities and penalties.</p>
        </div>
        <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-bold hover:opacity-80 transition shadow-lg shadow-gray-200 dark:shadow-none whitespace-nowrap"
        >
            <Plus size={18} />
            New Task
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tasks */}
        <div className="lg:col-span-2 space-y-8">
            {/* Collaborative Section */}
            {collaborativeTasks.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="text-blue-500" size={20} />
                        <h2 className="text-xl font-bold dark:text-white">Collaborative Tasks</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {collaborativeTasks.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                </section>
            )}

            {/* Individual Tasks by Member */}
            <section>
                 <h2 className="text-xl font-bold dark:text-white mb-4">Individual Obligations</h2>
                 <div className="space-y-6">
                    {activeSpace.members.map(member => {
                        const memberTasks = activeTasks.filter(t => !t.isCollaborative && t.assignees.includes(member.id));
                        if (memberTasks.length === 0) return null;
                        
                        return (
                            <div key={member.id}>
                                <div className="flex items-center gap-3 mb-3">
                                    <img src={member.avatar} className="w-8 h-8 rounded-full" alt={member.name} />
                                    <h3 className="font-bold text-gray-700 dark:text-gray-300">{member.name}</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {memberTasks.map(task => <TaskCard key={task.id} task={task} />)}
                                </div>
                            </div>
                        )
                    })}
                 </div>
            </section>
        </div>

        {/* Right Column: Bank & Info */}
        <div className="lg:col-span-1 space-y-6">
            <PenaltyBank space={activeSpace} />
            
            <div className="bg-blue-50 dark:bg-neutral-900 p-6 rounded-3xl border border-blue-100 dark:border-neutral-800">
                <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-2">Space Stats</h3>
                <div className="space-y-2 text-sm text-blue-800 dark:text-gray-400">
                    <div className="flex justify-between">
                        <span>Total Tasks Created</span>
                        <span className="font-bold">{spaceTasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Completion Rate</span>
                        <span className="font-bold">
                            {Math.round((spaceTasks.filter(t => t.status === 'completed').length / (spaceTasks.length || 1)) * 100)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {showForm && <TaskForm spaceId={activeSpace.id} onClose={() => setShowForm(false)} />}
      
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Settings className="text-blue-500" size={20}/> Space Settings
                    </h2>
                    <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    
                    {/* Rename Section */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Space Name</h3>
                        <div className="relative">
                            <input 
                                value={spaceNameEdit}
                                onChange={e => setSpaceNameEdit(e.target.value)}
                                onBlur={handleNameSave}
                                placeholder="Enter space name"
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-neutral-800 rounded-xl font-bold text-lg dark:text-white border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
                            />
                            <Edit3 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    {/* Members Section */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Current Members</h3>
                        <div className="space-y-3 mb-8">
                            {activeSpace.members.map(member => (
                                <div key={member.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <img src={member.avatar} className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700" alt={member.name} />
                                        <div>
                                            <div className="font-bold text-sm dark:text-white flex items-center gap-2">
                                                {member.name}
                                                {member.id === currentUser?.id && <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded">YOU</span>}
                                            </div>
                                            <div className="text-xs text-gray-400">{member.email}</div>
                                        </div>
                                    </div>
                                    {member.id !== currentUser?.id && (
                                        <button 
                                            onClick={() => removeMemberFromSpace(activeSpace.id, member.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                            title="Remove Member"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-6 border-t border-gray-100 dark:border-neutral-800">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Invite New Member</h3>
                                <form onSubmit={handleInvite} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="email" 
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 border-none dark:text-white transition-all"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={!inviteEmail} 
                                    className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-sm hover:opacity-80 disabled:opacity-50 transition"
                                >
                                    Invite
                                </button>
                                </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SpacePage;