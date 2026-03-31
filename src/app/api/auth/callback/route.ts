// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const savedState = cookieStore.get('smart_auth_state')?.value;
  const iss = cookieStore.get('smart_iss')?.value;

  // 1. CSRF Protection Check
  if (!savedState || savedState !== state || !iss || !code) {
    console.error('Auth Pipeline Failed: Invalid state or missing parameters.');
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }

  try {
    // 2. Re-run Discovery to find the Token Endpoint
    const configUrl = `${iss.replace(/\/$/, '')}/.well-known/smart-configuration`;
    const configRes = await fetch(configUrl);
    const config = await configRes.json();
    
    // 3. Construct Token Exchange Request (Step 5)
    // IMPORTANT: For the sandbox, clientId must be 'my_web_app'
    const clientId = process.env.NEXT_PUBLIC_SMART_CLIENT_ID || 'my_web_app';
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback`;

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
    });

    const tokenRes = await fetch(config.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${await tokenRes.text()}`);
    }

    const tokenData = await tokenRes.json();

    // 4. Securely store the Access Token and Patient ID in HttpOnly cookies
    cookieStore.set('fhir_access_token', tokenData.access_token, { httpOnly: true, path: '/' });
    cookieStore.set('fhir_patient_id', tokenData.patient, { httpOnly: true, path: '/' });
    
    if (tokenData.refresh_token) {
      cookieStore.set('fhir_refresh_token', tokenData.refresh_token, { httpOnly: true, path: '/' });
    }

    // Clean up temporary launch state
    cookieStore.delete('smart_auth_state');

    // 5. Redirect to our clinical dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch (error) {
    console.error('SMART Token Exchange Error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}