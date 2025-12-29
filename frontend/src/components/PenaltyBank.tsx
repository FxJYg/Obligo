import React, { useState } from 'react';
import { TaskSpace, Currency } from '../types';
import { useApp } from '../contexts/AppContext';
import { CURRENCY_RATES } from '../constants';
import { Wallet, RefreshCw, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PenaltyBankProps {
  space: TaskSpace;
}

const PenaltyBank: React.FC<PenaltyBankProps> = ({ space }) => {
  const { convertBankCurrency, cashOutBank } = useApp();
  const [targetCurrency, setTargetCurrency] = useState<Currency>(Currency.EUR);
  
  const handleConvert = () => {
    convertBankCurrency(space.id, targetCurrency);
  };

  // Mock data for the chart visualization
  const data = [
      { name: 'Mon', amount: space.penaltyBank * 0.1 },
      { name: 'Tue', amount: space.penaltyBank * 0.2 },
      { name: 'Wed', amount: space.penaltyBank * 0.15 },
      { name: 'Thu', amount: space.penaltyBank * 0.05 },
      { name: 'Fri', amount: space.penaltyBank * 0.3 },
      { name: 'Sat', amount: space.penaltyBank * 0.1 },
      { name: 'Sun', amount: space.penaltyBank * 0.1 },
  ];

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-gray-100 dark:border-neutral-700 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
            <Wallet className="text-rose-500" />
            Penalty Bank
        </h2>
        <span className="text-xs px-2 py-1 rounded bg-rose-50 text-rose-600 font-bold dark:bg-rose-900/20 dark:text-rose-400">
            {space.currency}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center mb-8">
        <div className="text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
            {space.currency === 'USD' ? '$' : space.currency === 'EUR' ? '€' : space.currency === 'GBP' ? '£' : '¥'}
            {space.penaltyBank.toFixed(2)}
        </div>
        <p className="text-gray-400 text-sm">Accumulated Debt</p>
      </div>

      <div className="h-24 w-full mb-6">
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: 'transparent'}}
                />
                <Bar dataKey="amount" radius={[4, 4, 4, 4]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 4 ? '#f43f5e' : '#e2e8f0'} />
                    ))}
                </Bar>
            </BarChart>
         </ResponsiveContainer>
      </div>

      <div className="space-y-4 mt-auto">
        <div className="p-3 bg-gray-50 dark:bg-neutral-900 rounded-2xl flex items-center gap-2">
            <select 
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value as Currency)}
                className="bg-transparent text-sm font-semibold focus:outline-none dark:text-gray-300"
            >
                {Object.keys(CURRENCY_RATES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ArrowRight size={14} className="text-gray-400" />
            <button onClick={handleConvert} className="ml-auto p-1.5 bg-white dark:bg-neutral-800 rounded-lg shadow-sm text-gray-500 hover:text-blue-500 transition">
                <RefreshCw size={14} />
            </button>
        </div>

        <button 
            onClick={() => cashOutBank(space.id)}
            className="w-full py-3 rounded-2xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition active:scale-95"
        >
            Cash Out & Clear
        </button>
      </div>
    </div>
  );
};

export default PenaltyBank;