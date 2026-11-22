import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    product: 'FairWork',
    version: '1.1.0',
    case: 'STACK 2026 Case 1: Smarter Campus and Learning',
    team: 'Manuk Hiber',
    timestamp: new Date().toISOString(),
  });
}
