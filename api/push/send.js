import webpush from 'web-push';
import { getDatabase } from '../lib/mongodb.js';

const COLLECTION_NAME = 'push_subscriptions';
const VALID_ROLES = new Set(['Administrator', 'Captain', 'Vice-Captain']);

function cleanText(value, max) {
  return String(value || '').trim().slice(0, max);
}

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:jiking847@gmail.com';
  if (!publicKey || !privateKey) throw new Error('VAPID environment variables are missing.');
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

function matchesAudience(item, audience, targetUserId, targetEndpoint) {
  if (audience === 'leadership') return VALID_ROLES.has(item.role);
  if (audience === 'admin') return item.role === 'Administrator';
  if (audience === 'player') return Boolean(targetUserId && item.userId === targetUserId);
  if (audience === 'endpoint') return Boolean(targetEndpoint && item.endpoint === targetEndpoint);
  return true;
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  try {
    configureWebPush();
    const title = cleanText(request.body?.title, 80) || 'CricCircle';
    const body = cleanText(request.body?.body, 220);
    if (!body) return response.status(400).json({ ok: false, error: 'Notification text is required.' });

    const audience = cleanText(request.body?.audience, 30) || 'all';
    const targetUserId = cleanText(request.body?.targetUserId, 100);
    const targetEndpoint = cleanText(request.body?.targetEndpoint, 2048);
    const excludeEndpoint = cleanText(request.body?.excludeEndpoint, 2048);
    const payload = JSON.stringify({
      title,
      body,
      url: cleanText(request.body?.url, 240) || '/#chat',
      tag: cleanText(request.body?.tag, 80) || 'criccircle-update',
      type: cleanText(request.body?.type, 40) || 'general',
      timestamp: Date.now()
    });

    const database = await getDatabase();
    const collection = database.collection(COLLECTION_NAME);
    const all = await collection.find({ active: true }).limit(500).toArray();
    const recipients = all.filter((item) => item.endpoint !== excludeEndpoint && matchesAudience(item, audience, targetUserId, targetEndpoint));

    const expiredEndpoints = [];
    const results = await Promise.allSettled(recipients.map(async (item) => {
      try {
        await webpush.sendNotification(item.subscription, payload, { TTL: 60 * 60 * 12, urgency: 'high' });
        return true;
      } catch (error) {
        if (error?.statusCode === 404 || error?.statusCode === 410) expiredEndpoints.push(item.endpoint);
        throw error;
      }
    }));

    if (expiredEndpoints.length) await collection.deleteMany({ endpoint: { $in: expiredEndpoints } });
    const sent = results.filter((result) => result.status === 'fulfilled').length;
    const failed = results.length - sent;
    return response.status(200).json({ ok: true, sent, failed, recipients: recipients.length });
  } catch (error) {
    console.error('Push send API failed:', error);
    return response.status(500).json({ ok: false, error: 'Could not send notifications.' });
  }
}
