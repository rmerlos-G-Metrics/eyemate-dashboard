/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-28 16:46:30
 * @modify date 2026-04-28 16:46:30
 * @desc [description]
 */

'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Helper functions for PKCE (Proof Key for Code Exchange)
function generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string) {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
}

export async function initiateEpicLaunch(iss: string, lang: string, role: string) {
  // 1. Fetch SMART configuration from Epic
  const configUrl = `${iss.replace(/\/$/, '')}/.well-known/smart-configuration`;
  
  const response = await fetch(configUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch SMART configuration from Epic.');
  }

  const config = await response.json();
  const authEndpoint = config.authorization_endpoint;

  // 2. Client ID Isolation
  const clientId = process.env.EPIC_CLIENT_ID;
  if (!clientId) {
      throw new Error("EPIC_CLIENT_ID is missing from environment variables.");
  }

  // Must exactly match the 'Endpoint URI' in Epic portal!
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/epic-callback`;

  // 3. Define Epic Standalone Scopes
  // 'launch/patient' is critical here: it tells Epic to render the patient selection screen after login.
  const scopes = [
    'launch/patient',
    'openid',
    'fhirUser',
    'patient/Patient.read',
  ].join(' ');

  // 4. Generate Security Parameters
  const state = crypto.randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  
  const cookieStore = await cookies();

  // 5. Store State, PKCE, and Context Securely in HttpOnly Cookies
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const, // 'lax' allows the cookie to be sent on top-level cross-origin GET redirects (from Epic back to us)
    maxAge: 60 * 10, // 10 minutes
    path: '/'
  };

  cookieStore.set('smart_auth_state', state, cookieOptions);
  cookieStore.set('pkce_code_verifier', codeVerifier, cookieOptions); // Stored for the callback route
  cookieStore.set('smart_iss', iss, cookieOptions);
  cookieStore.set('smart_locale', lang, cookieOptions);
  cookieStore.set('user_role', role, cookieOptions);

  // 6. Construct the Epic-Specific Authorization URL
  const authUrl = new URL(authEndpoint);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('aud', iss); // Audience MUST exactly match the ISS URL
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  // 7. Execute the Redirect to Epic's Login Screen
  redirect(authUrl.toString());
}