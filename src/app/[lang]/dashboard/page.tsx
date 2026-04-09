/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-03-31 15:31:37
 * @desc Clinical FHIR Dashboard for Glaucoma Patient Monitoring
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDictionary, Locale } from '@/dictionaries/getDictionary';
import AddObservationButtonTest from '@/components/clinical/AddObservationButtonTest';
import AddConditionButtonTest from '@/components/clinical/AddConditionButtonTest';
import AddDiagnosticReportButton from '@/components/clinical/AddDiagnosticReportButton';


interface DashboardPageProps {
  params: Promise<{
    lang: Locale;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = await params;
  
  const dictionary = await getDictionary(lang);
  const dict = dictionary.dashboard_FHIR;

  const cookieStore = await cookies();
  const token = cookieStore.get('fhir_access_token')?.value;
  const patientId = cookieStore.get('fhir_patient_id')?.value;
  const iss = cookieStore.get('smart_iss')?.value;

  if (!token || !patientId || !iss) {
    redirect(`/${lang}/login`);
  }

  const fhirBaseUrl = iss.replace(/\/$/, '');
  
  // Parallel Fetching
  const [patientRes, conditionRes, observationRes, diagnosticRes] = await Promise.all([
    fetch(`${fhirBaseUrl}/Patient/${patientId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store' 
    }),
    fetch(`${fhirBaseUrl}/Condition?patient=${patientId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store' 
    }),
    fetch(`${fhirBaseUrl}/Observation?patient=${patientId}&_sort=-date`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store' 
    }),
    fetch(`${fhirBaseUrl}/DiagnosticReport?patient=${patientId}&_sort=-date`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store' 
    })
  ]);

  if (!patientRes.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">
        {dict.errorFetching}
      </div>
    );
  }

  const patient = await patientRes.json();
  const conditionBundle = conditionRes.ok ? await conditionRes.json() : { entry: [] };
  const observationBundle = observationRes.ok ? await observationRes.json() : { entry: [] };
  const diagnosticBundle = diagnosticRes.ok ? await diagnosticRes.json() : { entry: [] };
  
  // FHIR returns search results in a "Bundle"
  const conditions = conditionBundle.entry?.map((e: any) => e.resource) || [];
  const observations = observationBundle.entry?.map((e: any) => e.resource) || [];
  const diagnosticReports = diagnosticBundle.entry?.map((e: any) => e.resource) || [];

  const officialName = patient.name?.find((n: any) => n.use === 'official') || patient.name?.[0];
  const givenName = officialName?.given?.join(' ') || '';
  const familyName = officialName?.family || '';
  const fullName = `${givenName} ${familyName}`.trim();


  return (
    <main className='m-20'>
      <div className="max-w-4xl mx-auto space-y-8 w-full p-4">
      <header>
        <h1 className="text-4xl font-light text-health-blue tracking-tight">
          {dict.titlePrefix} <span className="text-health-blue font-semibold">{dict.titleHighlight}</span>
        </h1>
        <p className="text-slate-400 mt-2">{dict.connectionStatus}</p>
      </header>

      {/* 1. Patient Demographics Card */}
      <div className="bg-health-100/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 sm:p-10">
        <div className="flex items-center space-x-4 mb-8 border-b border-white/10 pb-6">
          <div className="h-16 w-16 rounded-full bg-health-blue flex items-center justify-center border border-black shadow-inner">
             <span className="text-2xl text-black font-semibold">
               {givenName.charAt(0)}{familyName.charAt(0)}
             </span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-black">{fullName}</h2>
            <p className="text-sm text-slate-500 font-mono">{dict.fhirId}: {patient.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">{dict.dob}</span>
            <p className="text-lg text-black font-medium">{patient.birthDate || dict.unknown}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">{dict.gender}</span>
            <p className="text-lg text-black capitalize font-medium">{patient.gender || dict.unknown}</p>
          </div>
        </div>
      </div>

      {/* 2. Clinical Conditions Card */}
      <div className="bg-health-100/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 sm:p-10">
        <h3 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          {dict.conditionsTitle}
        </h3>

        {conditions.length === 0 ? (
          <p className="text-slate-500 text-sm italic">{dict.noConditions}</p>
        ) : (
          <ul className="space-y-3">
            {conditions.map((condition: any, index: number) => {
              // FHIR parsing: Name of the condition
              const conditionName = condition.code?.coding?.[0]?.display || condition.code?.text || 'Unknown Condition';
              
              // FHIR parsing: Clinical Status
              const statusCode = condition.clinicalStatus?.coding?.[0]?.code || 'unknown';
              const isActive = statusCode === 'active' || statusCode === 'recurrence' || statusCode === 'relapse';
              
              // UI logic for status translation and colors
              let statusLabel = dict.statusUnknown;
              let statusColor = "bg-slate-500/10 text-slate-400 border-slate-500/20";
              
              if (isActive) {
                statusLabel = dict.statusActive;
                statusColor = "bg-red-500/10 text-red-600 border-red-500/20"; // Active conditions map to alert colors
              } else if (statusCode === 'resolved' || statusCode === 'remission' || statusCode === 'inactive') {
                statusLabel = dict.statusResolved;
                statusColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"; // Resolved maps to safe colors
              }

              return (
                <li key={condition.id || index} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-black font-medium">{conditionName}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-bold tracking-wide uppercase ${statusColor}`}>
                    {statusLabel}
                  </span>
                </li>
              );
            })}
          </ul>
        )}  
        <AddConditionButtonTest></AddConditionButtonTest>
      </div>
      
      {/* 3. Clinical Observations Card (NEW) */}
      <div className="bg-health-100/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 sm:p-10">
        <h3 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Observations
        </h3>

        {observations.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No observations found for this patient.</p>
        ) : (
          <ul className="space-y-3">
            {observations.map((obs: any, index: number) => {
              const obsName = obs.code?.coding?.[0]?.display || obs.code?.text || 'Unknown Observation';
              const value = obs.valueQuantity?.value || '--';
              const unit = obs.valueQuantity?.unit || '';
              
              // Format the timestamp nicely
              const dateStr = obs.effectiveDateTime 
                ? new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(obs.effectiveDateTime))
                : 'Unknown Date';

              return (
                <li key={obs.id || index} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-black font-medium">{obsName}</span>
                    <span className="text-xs text-slate-500 mt-1">{dateStr}</span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-blue-600">{value}</span>
                    <span className="text-sm font-medium text-slate-500 mb-1">{unit}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <AddObservationButtonTest></AddObservationButtonTest>
      </div>
      
      {/* 4. Diagnostic Reports Card (NEW) */}
      <div className="bg-health-100/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 sm:p-10">
        <h3 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Diagnostic Reports
        </h3>

        {diagnosticReports.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No diagnostic reports found for this patient.</p>
        ) : (
          <ul className="space-y-4">
            {diagnosticReports.map((report: any, index: number) => {
              const reportName = report.code?.coding?.[0]?.display || report.code?.text || 'Unknown Test';
              const conclusion = report.conclusion || 'No conclusion provided.';
              const status = report.status || 'unknown';
              
              const dateStr = report.effectiveDateTime 
                ? new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(new Date(report.effectiveDateTime))
                : 'Unknown Date';

              return (
                <li key={report.id || index} className="flex flex-col p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-black font-semibold">{reportName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-mono">{dateStr}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-600 border-indigo-500/20 uppercase tracking-widest font-bold">
                        {status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-indigo-400 pl-3 mt-2">
                    "{conclusion}"
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        <AddDiagnosticReportButton />
      </div>
    </div>
    </main>
  );
}