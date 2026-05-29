import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/proxy';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  return proxyToBackend(request);
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request);
}

export async function PUT(request: NextRequest) {
  return proxyToBackend(request);
}

export async function DELETE(request: NextRequest) {
  return proxyToBackend(request);
}

export async function PATCH(request: NextRequest) {
  return proxyToBackend(request);
}

export async function OPTIONS(request: NextRequest) {
  return proxyToBackend(request);
}
