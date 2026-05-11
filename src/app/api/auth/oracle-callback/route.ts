/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-05-08 11:56:23
 * @modify date 2026-05-08 11:56:23
 * @desc [description]
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    console.log("\n=============================================");
    console.log("🛬 CERNER CALLBACK");
    console.log("=============================================");

    const searchParams = new URL(request.url).searchParams;
    const code = searchParams.get('code');
    const stateReturned = searchParams.get('state');
    const errorReturned = searchParams.get('error');
    const errorUri = searchParams.get('error_uri');

    console.log(`📥 [Incoming URL Params]`);
    console.log(`   - Code: ${code ? '✅ Present' : '❌ Missing'}`);
    console.log(`   - State: ${stateReturned}`);
    if (errorReturned) {
        console.error(`❌ [Incoming Auth Error] ${errorReturned}`);
        console.error(`❌ [Incoming Error URI] ${errorUri}`);
        return NextResponse.json({ error: errorReturned, description: errorUri }, { status: 400 });
    }

    if (!code) {
        return NextResponse.json({ error: 'No authorization code provided in URL' }, { status: 400 });
    }

    // 1. Read Cookies
    const cookieStore = await cookies();
    const stateSaved = cookieStore.get('cerner_state')?.value;
    const codeVerifier = cookieStore.get('cerner_code_verifier')?.value;
    const tokenEndpoint = cookieStore.get('cerner_token_endpoint')?.value;

    console.log(`🍪 [Cookies Read]`);
    console.log(`   - State Match: ${stateReturned === stateSaved ? '✅ TRUE' : '❌ FALSE'}`);
    console.log(`   - Token Endpoint available: ${tokenEndpoint ? '✅ YES' : '❌ NO'}`);

    if (stateReturned !== stateSaved) {
        console.error("❌ [Security] State mismatch detected. Aborting.");
        return NextResponse.json({ error: 'State mismatch' }, { status: 400 });
    }

    if (!tokenEndpoint) {
        console.error("❌ [Error] Token endpoint missing from cookies.");
        return NextResponse.json({ error: 'Missing token endpoint configuration' }, { status: 500 });
    }

    // 2. Prepare Token Request
    const clientId = process.env.CERNER_CLIENT_ID || '';
    const clientSecret = process.env.CERNER_CLIENT_SECRET || '';

    if (!clientSecret) {
        console.error("❌ [Error] Missing CERNER_CLIENT_SECRET in environment variables.");
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // 🌟 THE FIX: Create the Basic Auth Header for Confidential Clients
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('code', code);
    tokenParams.append('redirect_uri', process.env.CERNER_REDIRECT_URI || "");
    // Note: client_id is no longer needed in the body since it is in the header
    
    if (codeVerifier) {
        tokenParams.append('code_verifier', codeVerifier);
    }

    console.log(`📤 [Token Request] Sending POST to: ${tokenEndpoint}`);
    
    // 3. Execute Token Exchange
    try {
        const tokenResponse = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization': `Basic ${credentials}` // 🌟 Send the Basic Auth header
            },
            body: tokenParams.toString(),
            cache: 'no-store'
        });

        console.log(`📥 [Token Response] HTTP Status: ${tokenResponse.status}`);
        
        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('❌ [Token Error Data]', tokenData);
            return NextResponse.json({ error: 'Failed to exchange token', details: tokenData }, { status: tokenResponse.status });
        }

        console.log(`✅ [Token Success] Received access_token! Length: ${tokenData.access_token?.length}`);
        console.log(`✅ [Token Success] Patient ID bound to token: ${tokenData.patient}`);

        // 4. Save Session Data
        const isLocalhost = request.url.includes('localhost') || request.url.includes('127.0.0.1');
        const cookieOptions = { httpOnly: true, path: '/', secure: !isLocalhost };
        
        cookieStore.set('fhir_access_token', tokenData.access_token, cookieOptions);
        cookieStore.set('fhir_patient_id', tokenData.patient, cookieOptions);
        cookieStore.set('fhir_base_url', process.env.CERNER_OPEN_URL || '', cookieOptions);
        
        console.log("🧹 [Cleanup] Deleting temporary cerner auth cookies");
        cookieStore.delete('cerner_state');
        cookieStore.delete('cerner_code_verifier');
        cookieStore.delete('cerner_token_endpoint');

        console.log("🚀 [Complete] Redirecting to /dashboard");
        console.log("=============================================\n");
        
        // Redirect to your Dashboard
        return NextResponse.redirect(new URL(`/dashboard`, request.url));

    } catch (error) {
        console.error('❌ [CRITICAL ERROR] Token exchange fetch failed:', error);
        return NextResponse.json({ error: 'Token exchange failed catastrophically' }, { status: 500 });
    }
}