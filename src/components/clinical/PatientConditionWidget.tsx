/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-14 10:52:53
 * @modify date 2026-04-14 10:52:53
 * @desc [description]
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { BaseWidgetProps } from '../dashboard/registry/widgetRegistry';
import { getFhirConditions } from '@/actions/getFhirConditions';
import AddConditionInput from './AddConditionInput';
import { motion } from 'framer-motion';

export default function PatientConditionWidget({ dictionary }: BaseWidgetProps) {
  const [conditions, setConditions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Extract specific dictionary section if needed, or use directly
  const dict = dictionary?.dashboard_FHIR || dictionary;

  // We wrap fetch in useCallback so we can pass it down to refresh data after writing
  const fetchConditions = useCallback(async () => {
    setIsLoading(true);
    const result = await getFhirConditions();
    
    if (result.success) {
      setConditions(result.data);
      setError('');
    } else {
      setError(result.message || 'Error fetching conditions');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchConditions();
  }, [fetchConditions]);

  return (
    <div className="flex flex-col h-full w-full">

      <div className="flex-1 overflow-y-auto max-h-[480px] pr-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-health-blue"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
        ) : conditions.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm italic">{dict?.noConditions || 'No active conditions found.'}</p>
        ) : (
          <ul className="space-y-3">
            {conditions.map((condition: any, index: number) => {
              const conditionName = condition.code?.coding?.[0]?.display || condition.code?.text || 'Unknown Condition';
              const statusCode = condition.clinicalStatus?.coding?.[0]?.code || 'unknown';
              const isActive = statusCode === 'active' || statusCode === 'recurrence' || statusCode === 'relapse';
              
              let statusLabel = dict?.statusUnknown || 'Unknown';
              let statusColor = "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
              
              if (isActive) {
                statusLabel = dict?.statusActive || 'Active';
                statusColor = "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
              } else if (statusCode === 'resolved' || statusCode === 'remission' || statusCode === 'inactive') {
                statusLabel = dict?.statusResolved || 'Resolved';
                statusColor = "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
              }

              return (
                <motion.li 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={condition.id || index} 
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="text-slate-800 dark:text-slate-100 font-medium text-sm sm:text-base">{conditionName}</span>
                  <span className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full border font-bold tracking-wide uppercase ${statusColor}`}>
                    {statusLabel}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/10">
         <AddConditionInput dict={dict} onConditionAdded={fetchConditions} />
      </div>
    </div>
  );
}