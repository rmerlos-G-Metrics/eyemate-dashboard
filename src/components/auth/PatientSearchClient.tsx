// src/components/patient/PatientSearchClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { searchFhirPatients, setPatientContextAndRedirect } from '@/actions/patientSearchActions';
import { motion, AnimatePresence } from 'framer-motion';

// Assuming dictionary interface structure
interface PatientSearchProps {
  dictionary: any;
  lang: string;
}

export default function PatientSearchClient({ dictionary, lang }: PatientSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    const res = await searchFhirPatients(query);
    if (res.success && res.data) {
      setResults(res.data);
    }
    setIsSearching(false);
  };

  const handleSelectPatient = (patientId: string) => {
    startTransition(() => {
      setPatientContextAndRedirect(patientId, lang);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl glass-panel bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-8"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-800 dark:text-white mb-2">
            {dictionary?.patientSearch?.title || "Find a Patient"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {dictionary?.patientSearch?.subtitle || "Search by name."}
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dictionary?.patientSearch?.placeholder || "e.g., Sam, Tim..."}
              className="w-full px-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-health-blue transition-all backdrop-blur-sm"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-3 top-3 px-6 py-2 bg-health-blue text-white rounded-xl font-medium hover:bg-health-blue/90 disabled:opacity-50 transition-colors shadow-md"
            >
              {isSearching ? (dictionary?.common?.loading || "Searching...") : (dictionary?.common?.search || "Search")}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          <AnimatePresence>
            {results.map((patient) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => handleSelectPatient(patient.id)}
                className="group flex items-center justify-between p-5 bg-white/40 dark:bg-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md"
              >
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white text-lg">
                    {patient.name}
                  </h3>
                  <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span>{dictionary?.common?.dob || "DOB"}: {patient.birthDate}</span>
                    <span className="capitalize">{patient.gender}</span>
                  </div>
                </div>
                <div className="text-health-blue opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPending ? (dictionary?.common?.loading || "Loading...") : (dictionary?.common?.select || "Select →")}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {results.length === 0 && !isSearching && query && (
             <p className="text-center text-slate-500 py-8">
               {dictionary?.patientSearch?.noResults || "No patients found. Please try another query."}
             </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}