// src/actions/patientSearchActions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function searchFhirPatients(searchQuery: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('fhir_access_token')?.value;
    const iss = cookieStore.get('fhir_base_url')?.value;

    if (!token || !iss) {
      return { success: false, message: 'Authentication missing.', data: null };
    }

    const fhirBaseUrl = iss.replace(/\/$/, '');
    
    // Simple FHIR name search. Can be expanded to ?family=...&given=...
    const url = `${fhirBaseUrl}/Patient?name=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return { success: false, message: `Search failed: ${response.status}`, data: null };
    }

    const bundle = await response.json();
    
    // Map FHIR Bundle to a clean array of patients to send to the client
    const patients = (bundle.entry || []).map((entry: any) => {
      const p = entry.resource;
      const name = p.name?.[0];
      return {
        id: p.id,
        name: name ? `${name.given?.join(' ')} ${name.family}` : 'Unknown',
        birthDate: p.birthDate || 'Unknown',
        gender: p.gender || 'Unknown'
      };
    });

    return { success: true, data: patients };
  } catch (error: any) {
    console.error("Search Patient Error:", error);
    return { success: false, message: 'Internal server error', data: null };
  }
}

export async function setPatientContextAndRedirect(patientId: string, lang: string) {
    const cookieStore = await cookies();
    const isLocalhost = process.env.NODE_ENV === 'development';
    
    // Bind the patient ID securely
    cookieStore.set('fhir_patient_id', patientId, {
        httpOnly: true,
        path: '/',
        secure: !isLocalhost
    });

    // Redirect to the dashboard in the correct locale
    redirect(`/dashboard`);
}