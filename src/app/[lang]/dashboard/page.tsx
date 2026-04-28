/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-03-31 15:31:37
 * @desc [description]
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDictionary } from "@/dictionaries/getDictionary";

import ProviderDashboard from "@/components/dashboard/provider-view/ProviderDashboard";
import PatientDashboard from "@/components/dashboard/patient-view/PatientDashboard";


interface DashboardPageProps {
  params: Promise< {lang: string} >;
}

export default async function DashboardPage({params}: DashboardPageProps) {
  const {lang} = await params;
  const cookieStore = await cookies();
  const dictionary = await getDictionary(lang)

  const token = cookieStore.get('fhir_access_token')?.value;
  const userRole = cookieStore.get('user_role')?.value;

  if (!token || !userRole) {
    redirect(`/${lang}/login`);
  }

  if (userRole === 'practitioner') {
    return (
      <ProviderDashboard lang={lang} token={token} dictionary={dictionary}></ProviderDashboard>
    )
  }

  if (userRole === 'patient') {
    return (
      <PatientDashboard lang={lang} token={token}></PatientDashboard>
    )
  }

  //Fallback
  redirect(`/%{lang}/login?error=invalid_role`);
}