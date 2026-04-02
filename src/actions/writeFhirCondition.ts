/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-01 16:28:23
 * @modify date 2026-04-01 16:28:23
 * @desc [description]
 */

'use server';

import { cookies } from 'next/headers';

export async function addGlaucomaCondition() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('fhir_access_token')?.value;
  const patientId = cookieStore.get('fhir_patient_id')?.value;
  const baseUrl = cookieStore.get('fhir_base_url')?.value;

  if (!accessToken || !patientId || !baseUrl) {
    throw new Error('Missing authentication or patient context. Please re-launch the app.');
  }

  // 1. Construct the FHIR R4 Condition Payload for Glaucoma
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
          display: "Primary open angle glaucoma (test)"
        }
      ],
      text: "Primary open angle glaucoma (test)"
    },
    subject: {
      reference: `Patient/${patientId}`
    }
  };

  // 2. Send the POST request to the FHIR Server
  const endpoint = `${baseUrl.replace(/\/$/, '')}/Condition`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(conditionPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FHIR POST Error:', errorText);
      throw new Error(`Failed to create Condition: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Return success and the newly created Resource ID
    return { 
      success: true, 
      resourceId: responseData.id,
      message: 'Glaucoma condition successfully added to EHR.' 
    };

  } catch (error) {
    console.error('Action Error:', error);
    return { success: false, message: (error as Error).message };
  }
}