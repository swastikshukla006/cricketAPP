export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) return response.status(503).json({ ok: false, error: 'Push notifications are not configured.' });
  return response.status(200).json({ ok: true, publicKey });
}
