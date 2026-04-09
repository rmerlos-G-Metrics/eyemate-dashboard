'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addGlaucomaDiagnosticReport } from '@/actions/writeFhirDiagnosticReport';

export default function AddDiagnosticReportButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAddReport = async () => {
    setLoading(true);
    setMessage('');
    
    const result = await addGlaucomaDiagnosticReport();
    
    if (result.success) {
      setMessage(`Success! Report ${result.resourceId} added.`);
      // Re-fetch the Server Component data seamlessly
      router.refresh(); 
    } else {
      setMessage(`Error: ${result.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="mt-6 pt-6 border-t border-white/10 flex flex-col items-start gap-3">
      <button 
        onClick={handleAddReport}
        disabled={loading}
        className="px-5 py-2.5 bg-blue-400 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading Scan...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Report
          </>
        )}
      </button>
      {message && (
        <p className={`text-sm font-medium ${message.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}