/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-14 20:18:53
 * @modify date 2026-04-14 20:18:53
 * @desc [description]
 */

'use server';

import { cookies } from 'next/headers';

export async function getFhirPatient() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('fhir_access_token')?.value;
    const patientId = cookieStore.get('fhir_patient_id')?.value;
    const iss = cookieStore.get('fhir_base_url')?.value;

    if (!token || !patientId || !iss) {
      return { success: false, message: 'Authentication missing.', data: null };
    }

    const fhirBaseUrl = iss.replace(/\/$/, '');
    
    const response = await fetch(`${fhirBaseUrl}/Patient/${patientId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
      },
      cache: 'no-store' 
    });

    if (!response.ok) {
      return { success: false, message: `Failed to fetch patient: ${response.status}`, data: null };
    }

    const patientData = await response.json();

    return { success: true, data: patientData };
  } catch (error: any) {
    console.error("Fetch Patient Error:", error);
    return { success: false, message: 'Internal server error', data: null };
  }
}