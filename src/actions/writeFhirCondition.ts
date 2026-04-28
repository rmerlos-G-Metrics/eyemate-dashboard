/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-14 10:33:23
 * @modify date 2026-04-14 10:33:23
 * @desc [description]
 */

'use server';

import { cookies } from 'next/headers';

export async function writeCustomCondition(conditionText: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('fhir_access_token')?.value;
    const patientId = cookieStore.get('fhir_patient_id')?.value;
    const iss = cookieStore.get('smart_iss')?.value;

    if (!token || !patientId || !iss) {
      return { success: false, message: 'Authentication missing. Please log in again.' };
    }

    if (!conditionText || conditionText.trim() === '') {
        return { success: false, message: 'Condition text cannot be empty.' };
    }

    const fhirBaseUrl = iss.replace(/\/$/, '');

    const conditionPayload = {
      resourceType: "Condition",
      clinicalStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
            code: "active",
          }
        ]
      },
      verificationStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
            code: "confirmed"
          }
        ]
      },
      code: {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: "19941000",
            display: conditionText
          }
        ],
        text: conditionText
      },
      subject: {
        reference: `Patient/${patientId}`
      }
    };

    const response = await fetch(`${fhirBaseUrl}/Condition`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(conditionPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FHIR Post Error:", errorText);
      return { success: false, message: `FHIR Server Error: ${response.status}` };
    }

    return { success: true, message: 'Condition written successfully.' };
  } catch (error: any) {
    console.error("Action Error:", error);
    return { success: false, message: error.message || 'Internal Server Error' };
  }
}