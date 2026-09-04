// /api/refresh  — trades a Yahoo refresh token for a new access token.
// Called by the dashboard ~1 hour after the last token was issued.
export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  let body;
  try { body = await req.json(); }
  catch { return new Response('Invalid JSON', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }); }

  const { refresh_token } = body;
  if (!refresh_token) {
    return new Response('Missing refresh_token', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const clientId     = process.env.YAHOO_CLIENT_ID;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET;
  const basic        = btoa(`${clientId}:${clientSecret}`);

  const tokenRes = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token,
    }),
  });

  const tokens = await tokenRes.json();

  return new Response(JSON.stringify({
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token || refresh_token, // Yahoo may not return a new refresh token
    expires_at:    Date.now() + (tokens.expires_in || 3600) * 1000,
  }), {
    status: tokenRes.ok ? 200 : 502,
    headers: {
      'Content-Type':                'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const config = { path: '/api/refresh' };
