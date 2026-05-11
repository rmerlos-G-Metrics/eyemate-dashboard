/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-05-07 16:50:13
 * @modify date 2026-05-07 16:50:13
 * @desc [description]
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    console.log("\n=============================================");
    console.log("🚀 CERNER LOGIN");
    console.log("=============================================");

    try {
        // 1. Generate Security Parameters (PKCE & State)
        const codeVerifier = crypto.randomBytes(32).toString('base64url');
        const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
        const state = crypto.randomBytes(16).toString('hex');
        
        console.log("🔑 [Security] Generated State:", state);
        console.log("🔑 [Security] Generated Code Verifier:", codeVerifier);

        // 2. Set Cookies
        const cookieStore = await cookies();
        const cookieOptions = { httpOnly: true, path: '/' };
        
        cookieStore.set('cerner_code_verifier', codeVerifier, cookieOptions);
        cookieStore.set('cerner_state', state, cookieOptions);
        console.log("🍪 [Cookies] Saved 'cerner_code_verifier' and 'cerner_state'");

        // 3. Fetch SMART Configuration
        const fhirBaseUrl = process.env.CERNER_OPEN_URL || '';
        const configUrl = `${fhirBaseUrl}/.well-known/smart-configuration`;
        console.log(`🌐 [Discovery] Fetching config from: ${configUrl}`);
        
        const configResponse = await fetch(configUrl);
        if (!configResponse.ok) {
            throw new Error(`Failed to fetch SMART config. Status: ${configResponse.status}`);
        }

        // CRITICAL FIX: Parse the JSON!
        const configData = await configResponse.json(); 
        const authEndpoint = configData.authorization_endpoint;
        const tokenEndpoint = configData.token_endpoint;
        
        console.log(`✅ [Discovery] Auth Endpoint Found: ${authEndpoint}`);
        console.log(`✅ [Discovery] Token Endpoint Found: ${tokenEndpoint}`);

        // Save token endpoint to cookie so the callback route knows where to go!
        cookieStore.set('cerner_token_endpoint', tokenEndpoint, cookieOptions);

        // 4. Construct Authorization URL
        const authUrl = new URL(authEndpoint);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('client_id', process.env.CERNER_CLIENT_ID || '');
        authUrl.searchParams.append('redirect_uri', process.env.CERNER_REDIRECT_URI || "");
        
        // Use EXACT scopes supported by Cerner
        const scopes = 'openid fhirUser user/Patient.read';
        authUrl.searchParams.append('scope', scopes);
        authUrl.searchParams.append('state', state);
        
        // Exact FHIR Base URL required for the Audience
        authUrl.searchParams.append('aud', fhirBaseUrl);
        authUrl.searchParams.append('code_challenge_method', 'S256');
        authUrl.searchParams.append('code_challenge', codeChallenge);
        
        console.log("🔗 [Redirect] Final Auth URL constructed:");
        console.log(authUrl.toString());
        console.log("=============================================\n");

        return NextResponse.redirect(authUrl.toString());

    } catch (error) {
        console.error("❌ [ERROR] Login Flow Failed:", error);
        return NextResponse.json({ error: 'Internal Server Error during login setup' }, { status: 500 });
    }
}