'use server';

import { cookies } from 'next/headers';

export async function addGlaucomaObservation(pressure: number, dateString: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('fhir_access_token')?.value;
  const patientId = cookieStore.get('fhir_patient_id')?.value;
  const baseUrl = cookieStore.get('fhir_base_url')?.value;
  const iss = cookieStore.get('smart_iss')?.value;
  
  const fhirEndpoint = baseUrl || iss;

  if (!accessToken || !patientId || !fhirEndpoint) {
    throw new Error('Missing authentication context.');
  }

  // 1. Construct the Dynamic FHIR Payload
  const observationPayload = {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "exam",
            display: "Exam"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "55284-4",
          display: "Intraocular pressure of Eye"
        }
      ],
      text: "Intraocular Pressure (IOP)"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    // Inject the dynamic date
    effectiveDateTime: new Date(dateString).toISOString(),
    // Inject the dynamic pressure value
    valueQuantity: {
      value: pressure,
      unit: "mmHg",
      system: "http://unitsofmeasure.org",
      code: "mm[Hg]"
    }
  };

  const endpoint = `${fhirEndpoint.replace(/\/$/, '')}/Observation`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(observationPayload)
    });

    if (!response.ok) {
      throw new Error(`FHIR POST Error: ${response.status}`);
    }

    const responseData = await response.json();
    return { success: true, resourceId: responseData.id };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}