import { getDatabase } from './lib/mongodb.js';

const TEAM_DOCUMENT_ID = 'ball-kho-gayi-xi-main';
const COLLECTION_NAME = 'team_state';

function cleanState(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('A valid state object is required.');
  }

  const state = structuredClone(input);

  // Do not persist prototype PINs in the shared team document.
  if (state.settings) delete state.settings.adminPin;
  if (Array.isArray(state.players)) {
    state.players = state.players.map(({ pin, ...player }) => player);
  }

  return state;
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  try {
    const database = await getDatabase();
    const collection = database.collection(COLLECTION_NAME);

    if (request.method === 'GET') {
      const document = await collection.findOne({ _id: TEAM_DOCUMENT_ID });
      return response.status(200).json({
        ok: true,
        state: document?.state || null,
        updatedAt: document?.updatedAt || null
      });
    }

    if (request.method === 'PUT') {
      const state = cleanState(request.body?.state);
      const updatedAt = new Date();

      await collection.updateOne(
        { _id: TEAM_DOCUMENT_ID },
        {
          $set: { state, updatedAt },
          $setOnInsert: { createdAt: updatedAt }
        },
        { upsert: true }
      );

      return response.status(200).json({ ok: true, updatedAt });
    }

    response.setHeader('Allow', 'GET, PUT');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  } catch (error) {
    console.error('Team state API failed:', error);
    return response.status(500).json({
      ok: false,
      error: 'Database operation failed.'
    });
  }
}
