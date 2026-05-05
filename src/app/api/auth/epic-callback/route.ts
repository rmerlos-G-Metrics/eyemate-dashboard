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

  console.log('\n=== 1. CALLBACK HIT (CHECK YOUR TERMINAL) ===');
  console.log('Code:', code ? 'Exists' : 'Missing');
  console.log('State Match:', stateReturned === stateSaved);

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }
  if (stateReturned !== stateSaved) {
    return NextResponse.json({ error: 'State mismatch' }, { status: 400 });
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

    console.log('\n=== 3. EPIC RESPONSE ===');
    console.log('Status:', tokenResponse.status);
    console.log('Data:', tokenData);

    if (!tokenResponse.ok) {
      return NextResponse.json({
        debug_message: "Epic rejected the token request. Look at 'epic_error' below.",
        epic_status: tokenResponse.status,
        epic_error: tokenData
      }, { status: tokenResponse.status });
    }

    // 3. Map to Eyemate Dashboard Standard Cookies
    const isLocalhost = request.url.includes('localhost') || request.url.includes('127.0.0.1');
    const cookieOptions = { httpOnly: true, path: '/', secure: !isLocalhost};
    cookieStore.set('fhir_access_token', tokenData.access_token, cookieOptions);
    cookieStore.set('fhir_patient_id', tokenData.patient, cookieOptions);

    // 4. Clean up auth state
    //cookieStore.delete('epic_state');
    //cookieStore.delete('epic_code_verifier');

    // 5. Redirect to the Bilingual Dashboard
    console.log(new URL(`/${lang}/dashboard`, request.url));
    return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));

  } catch (error) {
    console.error('Fetch failed entirely:', error);
    return NextResponse.redirect(new URL(`/${lang}/login?error=network_failed`, request.url));
  }
}