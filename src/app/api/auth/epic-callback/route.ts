/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-30 13:49:57
 * @modify date 2026-04-30 13:49:57
 * @desc [description]
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateReturned = searchParams.get('state');

  const cookieStore = await cookies();
  const stateSaved = cookieStore.get('epic_state')?.value;
  const codeVerifier = cookieStore.get('epic_code_verifier')?.value;
  const lang = cookieStore.get('smart_locale')?.value || 'en'; // i18n routing

  if (!code || stateReturned !== stateSaved) {
    return NextResponse.redirect(new URL(`/${lang}/login?error=auth_mismatch`, request.url));
  }

  // 1. Construct the body (Your exact PoC logic - NO client_id here)
  const tokenParams = new URLSearchParams();
  tokenParams.append('grant_type', 'authorization_code'); 
  tokenParams.append('code', code); 
  tokenParams.append('redirect_uri', 'http://localhost:3000/api/auth/epic-callback'); 
  
  if (codeVerifier) {
    tokenParams.append('code_verifier', codeVerifier); 
  }

  // 2. Construct the Basic Auth Header (Your exact PoC logic)
  const clientId = process.env.EPIC_CLIENT_ID || '70fe610a-bf18-4e74-a672-16610db7d1a9';
  const clientSecret = process.env.EPIC_CLIENT_SECRET || ''; 
  const authString = `${clientId}:${clientSecret}`;
  const authHeader = Buffer.from(authString).toString('base64');

  try {
    const tokenResponse = await fetch('https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Epic Token Error:', tokenData);
      return NextResponse.redirect(new URL(`/${lang}/login?error=epic_rejected`, request.url));
    }

    // 3. Map to Eyemate Dashboard Standard Cookies
    const cookieOptions = { httpOnly: true, path: '/', secure: process.env.NODE_ENV === 'production' };
    cookieStore.set('fhir_access_token', tokenData.access_token, cookieOptions);
    cookieStore.set('fhir_patient_id', tokenData.patient, cookieOptions);

    // 4. Clean up auth state
    cookieStore.delete('epic_state');
    cookieStore.delete('epic_code_verifier');

    // 5. Redirect to the Bilingual Dashboard
    return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));

  } catch (error) {
    console.error('Fetch failed entirely:', error);
    return NextResponse.redirect(new URL(`/${lang}/login?error=network_failed`, request.url));
  }
}