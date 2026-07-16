import { getDatabase } from '../lib/mongodb.js';

const COLLECTION_NAME = 'push_subscriptions';

const DEFAULT_PREFERENCES = Object.freeze({
  matches: true,
  live: true,
  chat: true,
  announcements: true,
  team: true,
  game: true
});

function cleanPreferences(value) {
  const source = value && typeof value === 'object' ? value : {};
  return Object.fromEntries(Object.entries(DEFAULT_PREFERENCES).map(([key, fallback]) => [key, source[key] === undefined ? fallback : Boolean(source[key])]));
}

function validSubscription(value) {
  return Boolean(
    value && typeof value === 'object' &&
    typeof value.endpoint === 'string' && value.endpoint.startsWith('https://') &&
    value.keys && typeof value.keys.p256dh === 'string' && typeof value.keys.auth === 'string'
  );
}

function cleanText(value, max = 80) {
  return String(value || '').trim().slice(0, max);
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  try {
    const database = await getDatabase();
    const collection = database.collection(COLLECTION_NAME);

    if (request.method === 'POST') {
      const subscription = request.body?.subscription;
      if (!validSubscription(subscription)) return response.status(400).json({ ok: false, error: 'A valid push subscription is required.' });

      const now = new Date();
      const identity = request.body?.identity || {};
      const record = {
        endpoint: subscription.endpoint,
        subscription,
        userId: cleanText(identity.userId, 100),
        userName: cleanText(identity.userName, 80),
        role: cleanText(identity.role, 40) || 'Player',
        preferences: cleanPreferences(request.body?.preferences),
        userAgent: cleanText(request.headers['user-agent'], 240),
        active: true,
        updatedAt: now
      };

      await collection.updateOne(
        { endpoint: subscription.endpoint },
        { $set: record, $setOnInsert: { createdAt: now } },
        { upsert: true }
      );
      await collection.createIndex({ endpoint: 1 }, { unique: true });
      return response.status(200).json({ ok: true });
    }

    if (request.method === 'DELETE') {
      const endpoint = cleanText(request.body?.endpoint, 2048);
      if (!endpoint) return response.status(400).json({ ok: false, error: 'Subscription endpoint is required.' });
      await collection.deleteOne({ endpoint });
      return response.status(200).json({ ok: true });
    }

    response.setHeader('Allow', 'POST, DELETE');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  } catch (error) {
    console.error('Push subscription API failed:', error);
    return response.status(500).json({ ok: false, error: 'Could not update notification subscription.' });
  }
}
