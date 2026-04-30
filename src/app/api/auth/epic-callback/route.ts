/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-30 13:49:57
 * @modify date 2026-04-30 13:49:57
 * @desc [description]
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    const cookieStore = await cookies();
    const savedState = cookieStore.get("smart_auth_state")?.value;
    const codeVerifier = cookieStore.get("smart_code_verifier")?.value;
    const iss = cookieStore.get("smart_iss")?.value;
    const lang = cookieStore.get("smart_locale")?.value || "en";

    console.log("=== EPIC CALLBACK DIAGNOSTICS ===");
    console.log("Incoming State:", state);
    console.log("Saved State:", savedState);
    console.log("Code Verifier:", codeVerifier);
    console.log("ISS:", iss);
    console.log("=================================");

    

    // 1. Handle Authorization Denials
  if (error || !code) {
    console.error("Epic Authorization Error:", error);
    return NextResponse.redirect(new URL(`/${lang}/login?error=access_denied`, request.url));
  }

  // 2. CSRF Protection Check
  if (!state || state !== savedState) {
    console.error("CSRF State Mismatch");
    return NextResponse.redirect(new URL(`/${lang}/login?error=csrf_failed`, request.url));
  }

  if (!codeVerifier || !iss) {
    console.error("Missing PKCE verifier or ISS context");
    return NextResponse.redirect(new URL(`/${lang}/login?error=session_expired`, request.url));
  }

  try {
    // 3. Discover Token Endpoint
    const configRes = await fetch(`${iss.replace(/\/$/, '')}/.well-known/smart-configuration`);
    const config = await configRes.json();
    const tokenEndpoint = config.token_endpoint;

    // 4. Construct Epic-Specific Token Request (PKCE + Client Secret)
    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/epic-callback`, // MUST match exactly
      client_id: process.env.EPIC_CLIENT_ID!,
      code_verifier: codeVerifier, // Fulfills the PKCE requirement
    });

    // Fulfills the Confidential Client requirement
    if (process.env.EPIC_CLIENT_SECRET) {
      tokenBody.append('client_secret', process.env.EPIC_CLIENT_SECRET);
    }

    // 5. Execute Token Exchange
    const tokenRes = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody.toString(),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("Epic Token Exchange Failed:", errorText);
      throw new Error("invalid_grant");
    }

    const tokenData = await tokenRes.json();

    // 6. Secure Session Establishment
    const response = NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenData.expires_in || 3600,
      path: '/'
    };

    response.cookies.set('fhir_access_token', tokenData.access_token, cookieOptions);
    if (tokenData.patient) {
      response.cookies.set('fhir_patient_id', tokenData.patient, cookieOptions);
    }

    // Clean up temporary launch cookies
    response.cookies.delete('smart_auth_state');
    response.cookies.delete('pkce_code_verifier');

    return response;

  } catch (err) {
    console.error("Epic Callback Error:", err);
    return NextResponse.redirect(new URL(`/${lang}/login?error=server_error`, request.url));
  }

}