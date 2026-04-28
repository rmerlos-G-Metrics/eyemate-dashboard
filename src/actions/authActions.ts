/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-13 09:29:50
 * @modify date 2026-04-13 10:03:04
 * @desc [description]
 */


'use server'

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction(lang:string) {
    const cookieStore = await cookies();

    cookieStore.delete("fhir_access_token");
    cookieStore.delete("fhir_patient_id");
    cookieStore.delete("fhir_base_url");

    redirect(`/${lang}`);
}