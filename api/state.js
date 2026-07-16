import { getDatabase } from './lib/mongodb.js';

const TEAM_DOCUMENT_ID = 'ball-kho-gayi-xi-main';
const COLLECTION_NAME = 'team_state';

function cleanState(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('A valid state object is required.');
  const state = structuredClone(input);
  if (Array.isArray(state.chat)) state.chat = state.chat.slice(-100);
  if (Array.isArray(state.joinRequests)) state.joinRequests = state.joinRequests.slice(-100);
  return state;
}

function sameTimestamp(left, right) {
  if (!left || !right) return true;
  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();
  return Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime === rightTime;
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  try {
    const database = await getDatabase();
    const collection = database.collection(COLLECTION_NAME);

    if (request.method === 'GET') {
      const document = await collection.findOne({ _id: TEAM_DOCUMENT_ID });
      return response.status(200).json({ ok: true, state: document?.state || null, updatedAt: document?.updatedAt || null });
    }

    if (request.method === 'PUT') {
      const state = cleanState(request.body?.state);
      const baseUpdatedAt = request.body?.baseUpdatedAt || null;
      const existing = baseUpdatedAt ? await collection.findOne({ _id: TEAM_DOCUMENT_ID }, { projection: { updatedAt: 1 } }) : null;

      // Old clients remain compatible. New clients send baseUpdatedAt so a stale phone
      // cannot silently overwrite a newer score, message or profile edit.
      if (existing?.updatedAt && !sameTimestamp(baseUpdatedAt, existing.updatedAt)) {
        return response.status(409).json({
          ok: false,
          error: 'Newer team data is available. Refresh before saving again.',
          updatedAt: existing.updatedAt
        });
      }

      const updatedAt = new Date();
      await collection.updateOne(
        { _id: TEAM_DOCUMENT_ID },
        { $set: { state, updatedAt }, $setOnInsert: { createdAt: updatedAt } },
        { upsert: true }
      );
      return response.status(200).json({ ok: true, updatedAt });
    }

    response.setHeader('Allow', 'GET, PUT');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  } catch (error) {
    console.error('Team state API failed:', error);
    return response.status(500).json({ ok: false, error: 'Database operation failed.' });
  }
}
