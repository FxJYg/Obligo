import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { Moon, Sun, Snowflake, LogOut, User as UserIcon, Plus, Tag } from 'lucide-react';
import IconHelper, { ICON_OPTIONS } from '../components/IconHelper';
import { Category } from '../types';

const COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-purple-500', 
  'bg-orange-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-slate-500'
];

const SettingsPage: React.FC = () => {
  const { mode, season, toggleMode, toggleSeason } = useTheme();
  const { currentUser, logout, categories, addCategory } = useApp();
  
  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState(ICON_OPTIONS[0]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCatName,
      color: newCatColor,
      icon: newCatIcon
    };

    addCategory(newCategory);
    setNewCatName('');
  };

  return (
    <div className="pb-10">
      {/* Standard Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Preferences</h1>
        <p className="text-gray-500 mt-1">Customize your experience.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8 xl:col-span-1">
              {/* Profile Section */}
              <section className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-gray-100 dark:border-neutral-700 shadow-sm">
                <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                    <UserIcon className="text-blue-500" /> Profile
                </h2>
                <div className="flex items-center gap-4 mb-6">
                    <img src={currentUser?.avatar} className="w-20 h-20 rounded-full border-4 border-gray-50 dark:border-neutral-700" alt="Avatar" />
                    <div>
                        <h3 className="text-lg font-bold dark:text-white">{currentUser?.name}</h3>
                        <p className="text-gray-400">{currentUser?.email}</p>
                    </div>
                </div>
                <button onClick={logout} className="w-full px-4 py-3 text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-xl font-bold text-sm hover:bg-rose-100 transition flex items-center justify-center gap-2">
                    <LogOut size={16} /> Sign Out
                </button>
              </section>
{/* Appearance Section */}
              <section className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-gray-100 dark:border-neutral-700 shadow-sm">
                <h2 className="text-xl font-bold mb-6 dark:text-white">Appearance</h2>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-200 dark:bg-neutral-700 rounded-lg text-gray-700 dark:text-gray-200">
                                {mode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <div className="font-bold dark:text-white">Dark Mode</div>
                                <div className="text-xs text-gray-500">Easier on the eyes</div>
                            </div>
                        </div>
                        <button 
                            onClick={toggleMode}
                            className={`w-12 h-7 rounded-full p-1 transition-colors ${mode === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${mode === 'dark' ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-500">
                                <Snowflake size={20} />
                            </div>
                            <div>
                                <div className="font-bold dark:text-white">Winter Season</div>
                                <div className="text-xs text-gray-500">Enable snow effects</div>
                            </div>
                        </div>
                        <button 
                            onClick={toggleSeason}
                            className={`w-12 h-7 rounded-full p-1 transition-colors ${season === 'winter' ? 'bg-blue-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${season === 'winter' ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>
                </div>
              </section>
              
          </div>

          {/* Right Column */}
          <div className="xl:col-span-2">
            {/* Task Categories Section */}
            <section className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-gray-100 dark:border-neutral-700 shadow-sm h-full">
                <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <Tag className="text-emerald-500" /> Task Categories
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                    {categories.map(cat => (
                        <div key={cat.id} className="p-4 bg-gray-50 dark:bg-neutral-900 rounded-2xl flex flex-col items-center justify-center text-center gap-3 border border-transparent hover:border-gray-200 dark:hover:border-neutral-700 transition">
                            <div className={`w-10 h-10 rounded-full ${cat.color} flex items-center justify-center text-white shadow-sm`}>
                                <IconHelper name={cat.icon} size={20} />
                            </div>
                            <span className="text-sm font-bold dark:text-gray-200">{cat.name}</span>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleAddCategory} className="bg-gray-50 dark:bg-neutral-900 rounded-3xl p-6 border border-gray-100 dark:border-neutral-800">
                    <h3 className="font-bold dark:text-white mb-6 flex items-center gap-2">
                        <div className="p-1 bg-black text-white dark:bg-white dark:text-black rounded-lg"><Plus size={14}/></div>
                        Add New Category
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name</label>
                            <input 
                                value={newCatName}
                                onChange={e => setNewCatName(e.target.value)}
                                placeholder="e.g. Study, Finance..."
                                className="w-full px-4 py-3 rounded-xl border-none ring-1 ring-gray-200 dark:ring-neutral-700 bg-white dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Color</label>
                             <div className="flex flex-wrap gap-3">
                                {COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setNewCatColor(color)}
                                        className={`w-8 h-8 rounded-full ${color} transition-all ${newCatColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                                    />
                                ))}
                             </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Icon</label>
                        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
                            {ICON_OPTIONS.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setNewCatIcon(icon)}
                                    className={`aspect-square rounded-xl flex items-center justify-center transition-all ${newCatIcon === icon ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-110' : 'bg-white dark:bg-neutral-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700 hover:text-gray-600'}`}
                                >
                                    <IconHelper name={icon} size={18} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={!newCatName} 
                        className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 shadow-lg"
                    >
                        Create Category
                    </button>
                </form>
            </section>
          </div>
      </div>
    </div>
  );
};

export default SettingsPage;