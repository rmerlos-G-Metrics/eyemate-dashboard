/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-28 13:06:51
 * @modify date 2026-04-28 13:06:51
 * @desc [description]
 */

"use server"

import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

export async function writeFHIRDocumentReference() {
    const cookieStore = await cookies();
    const token = cookieStore.get("fhir_access_token")?.value;
    const patientId = cookieStore.get("fhir_patient_id")?.value;
    const fhirUrl = cookieStore.get("smart_iss")?.value;

    if (!token || !patientId || !fhirUrl) {
      return { success: false, message: 'Authentication missing. Please log in again.' };
    }

    try {
        const filePath = path.join(process.cwd(), 'data', 'test_documentreference.pdf')
        
        if (!fs.existsSync(filePath)) {
            return { success: false, message: 'Test PDF file not found on server.' };
        }

        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');

        const documentReference = {
            resourceType: "DocumentReference",
            status: "current",
            type: {
                coding: [
                {
                    system: "http://dvmd.de/fhir/CodeSystem/kdl",
                    code: "PT130102",
                    display: "Glaucoma Report"
                }
                ]
            },
            subject: {
                reference: `Patient/${patientId}`
            },
            content: [
                {
                attachment: {
                    contentType: "application/pdf",
                    language: "de",
                    data: base64Data,
                    title: "Glaucoma Report",
                    creation: new Date().toISOString()
                },
                format: {
                    system: "http://ihe.net/fhir/ihe.formatcode.fhir/CodeSystem/formatcode",
                    code: "urn:ihe:iti:xds:2017:mimeTypeSufficient",
                    display: "Format aus MIME Type ableitbar"
                }
                }
            ],
        };

        const response = await fetch(`${fhirUrl}/DocumentReference`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/fhir+json',
                'Accept': 'application/fhir+json',
            },
            body: JSON.stringify(documentReference)
        });

        if (!response.ok) {
        const errorText = await response.text();
        console.error('FHIR Server error:', errorText);
        return { success: false, error: `FHIR Server error: ${response.status}` };
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error("Error writing DocumentReference: ", error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to write DocumentReference. Please try again.' };
    }
}