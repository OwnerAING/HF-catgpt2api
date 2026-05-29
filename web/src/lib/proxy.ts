import { NextRequest } from 'next/server';

export const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, '') || '';

const VERCEL_HEADERS_TO_STRIP = [
  'host',
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

export async function proxyToBackend(request: NextRequest): Promise<Response> {
  if (!BACKEND_URL) {
    return new Response(
      JSON.stringify({ error: 'BACKEND_URL not configured' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  const url = new URL(request.url);
  const pathname = url.pathname;
  const targetUrl = `${BACKEND_URL}${pathname}${url.search}`;

  const headers = new Headers(request.headers);
  for (const name of VERCEL_HEADERS_TO_STRIP) {
    headers.delete(name);
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
    // @ts-ignore duplex is needed for streaming request body (multipart/form-data, SSE)
    duplex: 'half',
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('content-encoding');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
