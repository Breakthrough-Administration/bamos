import { NextResponse } from 'next/server';
import { runServerStartupHealthCheck } from '@/lib/serverHealthCheck';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = await runServerStartupHealthCheck();
    return NextResponse.json(report, {
      status: report.overallStatus === 'critical' ? 503 : 200,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        overallStatus: 'critical',
        summary: `Startup health check failed unexpectedly: ${err?.message}`,
        checks: [],
      },
      { status: 500 }
    );
  }
}
