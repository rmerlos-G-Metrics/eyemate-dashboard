/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-05-07 11:34:26
 * @modify date 2026-05-07 11:34:26
 * @desc [description]
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    const state = crypto.randomBytes(16).toString('hex');

    const cookieStore = await cookies();
    const cookieOptions = {
        httpOnly: true,
        path: '/'
    }

    cookieStore.set('mock_code_verifier', codeVerifier, cookieOptions);
    cookieStore.set('mock_state', state, cookieOptions);

    const authUrl = new URL('https://api.mock.health/smart/authorize');

    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', process.env.MOCK_CLIENT_ID || '');
    authUrl.searchParams.append('redirect_uri', 'http://localhost:3000/api/auth/mock-health-callback');
    authUrl.searchParams.append('scope', 'launch/patient patient/*.read patient/Patient.read openid fhirUser');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('aud', 'https://api.mock.health/fhir&');
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    
    console.log(authUrl.toString());

    return NextResponse.redirect(authUrl.toString());

}