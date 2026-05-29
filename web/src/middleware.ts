import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, '') || '';

export async function middleware(request: NextRequest) {
  // 诊断端点：确认 Middleware 是否生效
  if (request.nextUrl.pathname === '/ping') {
    return NextResponse.json({
      ok: true,
      middleware: 'running',
      backendUrl: BACKEND_URL ? 'configured' : 'NOT SET',
      env: process.env.VERCEL ? 'vercel' : 'local',
    });
  }

  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: 'BACKEND_URL not configured' },
      { status: 500 }
    );
  }

  const targetUrl = `${BACKEND_URL}${request.nextUrl.pathname}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  const vercelHeaders = [
    'x-vercel-id',
    'x-vercel-deployment-url',
    'x-vercel-forwarded-for',
    'x-vercel-proxied-for',
    'x-vercel-signature',
    'x-vercel-ip-country',
    'x-vercel-ip-city',
    'x-vercel-ip-latitude',
    'x-vercel-ip-longitude',
    'x-vercel-ip-timezone',
    'x-vercel-ja4-digest',
    'x-vercel-scdn',
    'x-vercel-cache',
  ];
  for (const name of vercelHeaders) {
    headers.delete(name);
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      // @ts-ignore duplex needed for streaming request body (multipart/form-data, SSE)
      duplex: 'half',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Proxy request failed',
        message,
        target: targetUrl,
        method: request.method,
        originalPath: request.nextUrl.pathname,
      },
      { status: 502 }
    );
  }
}

export const config = {
  matcher: [
    '/v1/:path*',
    '/api/:path*',
    '/auth/:path*',
    '/ping',
    '/ping/',
  ],
};
