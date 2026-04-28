/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-14 20:30:06
 * @modify date 2026-04-14 20:30:06
 * @desc [description]
 */

import { PatientReportData } from "@/types/report";

export function mapFhirPatientToReportData(fhirPatient: any): PatientReportData {
    // 1. Safely extract Name (First official name)
    const officialName = fhirPatient.name?.find((n: any) => n.use === 'official') || fhirPatient.name?.[0];
    const patientName = officialName 
        ? `${officialName.given?.join(" ") || ""} ${officialName.family || ""}`.trim() 
        : "Unknown Patient";

    // 2. Safely extract ID (Medical Record Number or internal ID)
    const patientId = fhirPatient.id || "Unknown ID";

    // 3. Format Demographics
    const dob = fhirPatient.birthDate || "N/A";
    
    // Capitalize the first letter of gender
    const sex = fhirPatient.gender 
        ? fhirPatient.gender.charAt(0).toUpperCase() + fhirPatient.gender.slice(1) 
        : "Unknown";

    return {
        patientName,
        patientId,
        dob,
        sex
    };
}