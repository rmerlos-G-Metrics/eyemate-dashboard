/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-07 10:26:44
 * @modify date 2026-04-07 10:26:44
 * @desc [description]
 */

'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function initiateSmartLaunch(iss: string, lang: string) {
  // 1. Fetch the SMART configuration from the Issuer (Discovery)
  const configUrl = `${iss.replace(/\/$/, '')}/.well-known/smart-configuration`;
  
  const response = await fetch(configUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch SMART configuration from the provider.');
  }

  const config = await response.json();
  const authEndpoint = config.authorization_endpoint;

  const clientId = process.env.NEXT_PUBLIC_SMART_CLIENT_ID || 'gmetrics-client-id';
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback`;

  // 3. Define Clinical Scopes
  const scopes = [
    'launch/patient',
    'openid',
    'fhirUser',
    'patient/Patient.read',
    'patient/Condition.read',
    'patient/Condition.write',
    'patient/Observation.read',
    'patient/Observation.write'
  ].join(' ');

  // 4. Generate & Store State for CSRF Protection
  const state = crypto.randomUUID();
  
  const cookieStore = await cookies();

  console.log("Setting SMART Locale to: ", lang)

  cookieStore.set('smart_auth_state', state, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes 
    path: '/' 
  });

  cookieStore.set('smart_iss', iss, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60*10,
    path: '/'
  })

  cookieStore.set('smart_locale', lang, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60*10,
    path: '/'
  });

  // 5. Construct the Authorization URL
  const authUrl = new URL(authEndpoint);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('aud', iss); 

  // 6. Execute the Redirect
  redirect(authUrl.toString());
}