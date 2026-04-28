/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-14 11:11:31
 * @modify date 2026-04-14 11:11:31
 * @desc [description]
 */

'use server';

import { cookies } from 'next/headers';

export async function getFhirConditions() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('fhir_access_token')?.value;
    const patientId = cookieStore.get('fhir_patient_id')?.value;
    const iss = cookieStore.get('smart_iss')?.value;

    if (!token || !patientId || !iss) {
      return { success: false, message: 'Authentication missing.', data: [] };
    }

    const fhirBaseUrl = iss.replace(/\/$/, '');
    
    const response = await fetch(`${fhirBaseUrl}/Condition?patient=${patientId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store' 
    });

    if (!response.ok) {
      return { success: false, message: `Failed to fetch conditions: ${response.status}`, data: [] };
    }

    const conditionBundle = await response.json();
    const conditions = conditionBundle.entry?.map((e: any) => e.resource) || [];

    return { success: true, data: conditions };
  } catch (error: any) {
    console.error("Fetch Conditions Error:", error);
    return { success: false, message: 'Internal server error', data: [] };
  }
}