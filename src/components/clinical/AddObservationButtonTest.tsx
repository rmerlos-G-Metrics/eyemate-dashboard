/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-07 11:23:52
 * @modify date 2026-04-07 11:23:52
 * @desc [description]
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Ensure this path matches where you saved the updated action
import { addGlaucomaObservation } from '@/actions/writeFhirObservation'; 

export default function AddObservationForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Set default pressure to a standard baseline (e.g., 15 mmHg)
  const [pressure, setPressure] = useState<number>(15);
  
  // Set default date to right now, formatted for <input type="datetime-local">
  // The format required is YYYY-MM-DDThh:mm
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 16) 
  );

  const router = useRouter();

  const handleAddObservation = async () => {
    setLoading(true);
    setMessage('');
    
    // Pass our state variables to the Server Action
    const result = await addGlaucomaObservation(pressure, date);
    
    if (result.success) {
      setMessage(`Success! IOP of ${pressure} mmHg recorded.`);
      router.refresh(); 
    } else {
      setMessage(`Error: ${result.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="mt-6 pt-6 border-t border-white/10">
      <h4 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
        Record Manual IOP Entry
      </h4>
      
      <div className="flex flex-col sm:flex-row items-end gap-4">
        {/* Pressure Input */}
        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-xs text-slate-400 mb-1 ml-1">Pressure (mmHg)</label>
          <input 
            type="number" 
            value={pressure}
            onChange={(e) => setPressure(Number(e.target.value))}
            className="px-4 py-2 bg-black/20 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
            min="0"
            max="60"
            step="1"
          />
        </div>

        {/* Date/Time Input */}
        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-xs text-slate-400 mb-1 ml-1">Date & Time</label>
          <input 
            type="datetime-local" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 bg-black/20 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono [color-scheme:dark]"
          />
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleAddObservation}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/30 text-blue-100 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
             <span className="animate-pulse">Saving...</span>
          ) : (
            <>
              <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Log Measurement
            </>
          )}
        </button>
      </div>

      {message && (
        <p className={`mt-3 text-sm font-medium ${message.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}