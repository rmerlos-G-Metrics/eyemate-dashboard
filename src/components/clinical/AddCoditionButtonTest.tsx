/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-02 11:34:23
 * @modify date 2026-04-02 11:34:23
 * @desc [description]
 */

'use client';

import { useState } from 'react';
import { addGlaucomaCondition } from '@/actions/writeFhirCondition';
import { useRouter } from 'next/navigation';

export default function AddConditionButtonTest() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter(); // refresh the page after posting

  const handleAddCondition = async () => {
    setLoading(true);
    setMessage('');
    
    const result = await addGlaucomaCondition();
    
    if (result.success) {
      setMessage(`Success! Condition added.`);
      // Force the server component to re-fetch the FHIR data so the new condition appears immediately
      router.refresh(); 
    } else {
      setMessage(`Error: ${result.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="mt-6 pt-6 border-t border-white flex flex-col items-start gap-3">
      <button 
        onClick={handleAddCondition}
        disabled={loading}
        className="px-5 py-2.5 bg-blue-300 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Writing to EHR...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post AI Glaucoma Detection
          </>
        )}
      </button>
      {message && (
        <p className={`text-sm font-medium ${message.startsWith('Error') ? 'text-red-600' : 'text-emerald-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}