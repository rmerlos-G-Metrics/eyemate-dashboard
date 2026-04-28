/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-14 16:57:36
 * @modify date 2026-04-14 16:57:36
 * @desc [description]
 */


export interface PatientReportData {
    patientName: string;
    patientId: string;
    dob: string;
    sex: string;
}

export interface PDFDictionary {
    title: string;
    labels: {
        patient: string;
        patientId: string;
        diagnosis: string;
        dob: string;
        sex: string;
        exam: string;
        reportId: string;
        plots?: string[];
    };
    imagePlaceholderText: string;
}