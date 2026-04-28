/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-14 11:38:41
 * @modify date 2026-04-14 11:38:41
 * @desc [description]
 */


'use client';

import { useState } from 'react';
import { writeCustomCondition } from '@/actions/writeFhirCondition';
import { motion } from 'framer-motion';

interface AddConditionInputProps {
  dict: any;
  onConditionAdded: () => void; // Parent controls the refetching
}

export default function AddConditionInput({ dict, onConditionAdded }: AddConditionInputProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [conditionText, setConditionText] = useState('');

  const handleAddCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionText.trim()) return;

    setLoading(true);
    setMessage('');
    
    const result = await writeCustomCondition(conditionText);
    
    if (result.success) {
      setMessage(dict?.successMessage || 'Added successfully.');
      setConditionText(''); 
      onConditionAdded(); // Trigger parent widget to refetch
    } else {
      setMessage(`Error: ${result.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleAddCondition} className="flex gap-2 items-center">
        <input
          type="text"
          value={conditionText}
          onChange={(e) => setConditionText(e.target.value)}
          placeholder={dict?.inputPlaceholder || "Enter condition..."}
          disabled={loading}
          className="flex-1 min-w-0 bg-transparent border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-health-blue transition-all disabled:opacity-50"
        />
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || !conditionText.trim()}
          className="px-4 py-2 bg-health-blue hover:bg-blue-600 text-black dark:text-white rounded-lg text-sm font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            dict?.addBtn || 'Add'
          )}
        </motion.button>
      </form>

      {message && (
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`text-xs font-medium ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}