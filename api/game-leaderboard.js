import { getDatabase } from './lib/mongodb.js';

const COLLECTION = 'game_scores';
const GAME_ID = 'boundary-blitz-v2';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  try {
    const limit = Math.max(1, Math.min(50, Number(request.query?.limit) || 25));
    const database = await getDatabase();
    const collection = database.collection(COLLECTION);
    const rows = await collection.aggregate([
      { $match: { game: GAME_ID, score: { $gte: 0, $lte: 300 } } },
      { $sort: { score: -1, perfects: -1, playedAt: 1 } },
      { $addFields: { leaderboardKey: { $cond: [
        { $and: [{ $ne: ['$playerId', null] }, { $ne: ['$playerId', ''] }] },
        { $concat: ['player:', '$playerId'] },
        { $concat: ['guest:', { $toLower: '$name' }] }
      ] } } },
      { $group: {
        _id: '$leaderboardKey',
        name: { $first: '$name' },
        playerId: { $first: '$playerId' },
        score: { $first: '$score' },
        boundaries: { $first: '$boundaries' },
        perfects: { $first: '$perfects' },
        balls: { $first: '$balls' },
        playedAt: { $first: '$playedAt' }
      } },
      { $sort: { score: -1, perfects: -1, playedAt: 1 } },
      { $limit: limit },
      { $project: { _id: 0, name: 1, playerId: 1, score: 1, boundaries: 1, perfects: 1, balls: 1, playedAt: 1 } }
    ]).toArray();

    response.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=60');
    return response.status(200).json({ ok: true, scores: rows });
  } catch (error) {
    console.error('Game leaderboard failed:', error);
    return response.status(500).json({ ok: false, error: 'Could not load the leaderboard.', scores: [] });
  }
}
