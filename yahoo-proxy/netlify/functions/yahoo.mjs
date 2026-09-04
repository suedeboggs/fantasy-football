// /api/yahoo?path=...  — CORS-safe proxy to Yahoo Fantasy API.
// The dashboard passes its Bearer token in the Authorization header;
// this function forwards the request and returns JSON.
export default async (req) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Authorization header required', { status: 401,
      headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const url        = new URL(req.url);
  const apiPath    = url.searchParams.get('path');   // e.g. "team/nfl.l.248304.t.3/roster/players"
  const extraQuery = url.searchParams.get('q') || ''; // optional extra query string params

  if (!apiPath) {
    return new Response('Missing `path` query param', { status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const yahooBase = 'https://fantasysports.yahooapis.com/fantasy/v2';
  const separator = apiPath.includes('?') ? '&' : '?';
  const yahooUrl  = `${yahooBase}/${apiPath}${separator}format=json${extraQuery ? '&' + extraQuery : ''}`;

  const yahooRes = await fetch(yahooUrl, {
    headers: { Authorization: authHeader },
  });

  const body = await yahooRes.text();

  return new Response(body, {
    status: yahooRes.status,
    headers: {
      'Content-Type':                 'application/json',
      'Access-Control-Allow-Origin':  '*',
      'Cache-Control':                'no-store',
    },
  });
};

export const config = { path: '/api/yahoo' };
