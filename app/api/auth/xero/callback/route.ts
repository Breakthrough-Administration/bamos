import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // In production, exchange code for Xero access token
  console.info('Received Xero OAuth callback:', { code, state });

  // Redirect to application root with success indicator
  const redirectUrl = new URL('/?xero_connected=true', req.url);
  return NextResponse.redirect(redirectUrl);
}
