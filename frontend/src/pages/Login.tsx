import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Logo } from '../components/Logo';

const Login: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('alex@example.com');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:invert"></div>
      
      <div className="bg-white dark:bg-neutral-800 p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 border border-gray-100 dark:border-neutral-700">
        <div className="mb-10 text-center flex flex-col items-center">
            <Logo className="h-16 w-auto mb-4" />
            <p className="text-gray-400">Collaborative accountability.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition dark:text-white"
                />
                <p className="text-xs text-gray-400 mt-2 ml-2">Try: alex@example.com or jordan@example.com</p>
            </div>
            
            <button 
                type="submit" 
                className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl"
            >
                Enter Space
            </button>
        </form>
      </div>
    </div>
  );
};

export default Login;