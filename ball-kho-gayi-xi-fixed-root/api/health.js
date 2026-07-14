import { getDatabase } from './lib/mongodb.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  try {
    const database = await getDatabase();
    await database.command({ ping: 1 });
    return response.status(200).json({ ok: true, message: 'MongoDB connected.' });
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    return response.status(500).json({ ok: false, error: 'MongoDB connection failed.' });
  }
}
