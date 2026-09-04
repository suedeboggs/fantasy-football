// /api/callback  — Yahoo redirects here after user approves.
// Exchanges the one-time code for access + refresh tokens, then
// sends both to the dashboard via the URL hash (never hits a server).
export default async (req) => {
  const url          = new URL(req.url);
  const code         = url.searchParams.get('code');
  const clientId     = process.env.YAHOO_CLIENT_ID;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET;
  const redirectUri  = process.env.YAHOO_REDIRECT_URI;
  const dashboardUrl = process.env.DASHBOARD_URL; // your artifact / hosted dashboard URL
 
  if (!code) {
    const error = url.searchParams.get('error');
    const desc  = url.searchParams.get('error_description');
    return new Response(`OAuth failed: ${error || 'no code'} — ${desc || url.search}`, { status: 400 });
  }
 
  // Exchange authorization code for tokens
  const basic = btoa(`${clientId}:${clientSecret}`);
  const tokenRes = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type:   'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });
 
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return new Response(`Token exchange failed: ${err}`, { status: 502 });
  }
 
  const tokens = await tokenRes.json();
 
  // Send tokens to the dashboard in the hash fragment.
  // Hash never reaches any server — stays 100% client-side.
  const expiresAt = Date.now() + tokens.expires_in * 1000;
  const hash = new URLSearchParams({
    yahoo_token:   tokens.access_token,
    yahoo_refresh: tokens.refresh_token,
    yahoo_expires: expiresAt,
  });
 
  return Response.redirect(`${dashboardUrl}#${hash}`, 302);
};
 
export const config = { path: '/api/callback' };
