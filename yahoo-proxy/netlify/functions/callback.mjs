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
