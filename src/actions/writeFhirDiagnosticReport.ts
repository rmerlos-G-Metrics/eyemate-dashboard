'use server';

import { cookies } from 'next/headers';

export async function addGlaucomaDiagnosticReport() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('fhir_access_token')?.value;
  const patientId = cookieStore.get('fhir_patient_id')?.value;
  const baseUrl = cookieStore.get('fhir_base_url')?.value;

  // We fall back to the SMART issuer if base_url isn't explicitly set
  const iss = cookieStore.get('smart_iss')?.value;
  const fhirEndpoint = baseUrl || iss;

  if (!accessToken || !patientId || !fhirEndpoint) {
    throw new Error('Missing authentication or patient context. Please re-launch the app.');
  }

  // 1. Construct the FHIR R4 DiagnosticReport Payload for a Glaucoma OCT Scan
  const reportPayload = {
    resourceType: "DiagnosticReport",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0074",
            code: "RAD",
            display: "Radiology"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "419984006",
          display: "Diagnostic Report Test"
        }
      ],
      text: "Diagnostic Report Test"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: new Date().toISOString(),
    issued: new Date().toISOString(),
    conclusion: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
  };

  // 2. Send the POST request to the FHIR Server
  const endpoint = `${fhirEndpoint.replace(/\/$/, '')}/DiagnosticReport`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(reportPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FHIR POST Error:', errorText);
      throw new Error(`Failed to create DiagnosticReport: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    return { 
      success: true, 
      resourceId: responseData.id,
      message: 'OCT Diagnostic Report successfully synced to EHR.' 
    };

  } catch (error) {
    console.error('Action Error:', error);
    return { success: false, message: (error as Error).message };
  }
}