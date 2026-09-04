// /api/auth  — redirects browser to Yahoo's OAuth consent screen
export default async (req) => {
  const clientId     = process.env.YAHOO_CLIENT_ID;
  const redirectUri  = process.env.YAHOO_REDIRECT_URI; // e.g. https://your-site.netlify.app/api/callback

  if (!clientId) {
    return new Response('YAHOO_CLIENT_ID env var not set', { status: 500 });
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    language:      'en-us',
  });

  const yahooAuthUrl = `https://api.login.yahoo.com/oauth2/request_auth?${params}`;
  return Response.redirect(yahooAuthUrl, 302);
};

export const config = { path: '/api/auth' };
