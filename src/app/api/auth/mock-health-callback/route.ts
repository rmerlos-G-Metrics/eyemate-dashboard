/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-05-07 13:45:05
 * @modify date 2026-05-07 13:45:05
 * @desc [description]
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const code = searchParams.get('code');
    const stateReturned = searchParams.get('state');

    const cookieStore = await cookies();
    const stateSaved = cookieStore.get('mock_state')?.value;
    const codeVerifier = cookieStore.get('mock_code_verifier')?.value;
    const lang = cookieStore.get('smart_locale')?.value || 'en';

    console.log('\n=== 1. CALLBACK HIT ===');
    console.log('Code:', code ? 'Exists' : 'Missing');
    console.log('State Match:', stateReturned === stateSaved);

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }
    if (stateReturned !== stateSaved) {
        return NextResponse.json({ error: 'State mismatch' }, { status: 400 });
    }

    const clientId = process.env.MOCK_CLIENT_ID || '';
    const clientSecret = process.env.MOCK_CLIENT_SECRET || '';

    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('code', code);
    tokenParams.append('redirect_uri', process.env.MOCK_REDIRECT_URI || "");
    tokenParams.append('client_id', clientId);
    tokenParams.append('client_secret', clientSecret);


    if (codeVerifier) {
        tokenParams.append('code_verifier', codeVerifier);
    }

    

    try {
        const tokenResponse = await fetch('https://api.mock.health/smart/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: tokenParams.toString(),
        });

        const tokenData = await tokenResponse.json();

        console.log('\n=== 3. MOCK HEALTH RESPONSE ===');
        console.log('Status:', tokenResponse.status);
        console.log('Data:', tokenData);


        const isLocalhost = request.url.includes('localhost') || request.url.includes('127.0.0.1');
        const cookieOptions = { httpOnly: true, path: '/', secure: !isLocalhost};
        cookieStore.set('fhir_access_token', tokenData.access_token, cookieOptions);
        cookieStore.set('fhir_patient_id', tokenData.patient, cookieOptions);
        cookieStore.set('fhir_base_url', 'https://api.mock.health/fhir', {httpOnly: true, path: '/'});
        cookieStore.set('user_role', 'practitioner', cookieOptions); // Assuming practitioner role for Epic, adjust as needed
        // 4. Clean up auth state
        cookieStore.delete('mock_state');
        cookieStore.delete('mock_code_verifier');

        // 5. Redirect to the Bilingual Dashboard
        console.log(new URL(`/${lang}/dashboard`, request.url));
        return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));

    } catch (error) {
        console.error('Token exchange failed:', error);
    }
    
}