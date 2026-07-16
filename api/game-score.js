import crypto from 'node:crypto';
import { getDatabase } from './lib/mongodb.js';

const COLLECTION = 'game_scores';
const GAME_ID = 'boundary-blitz-v2';
const MAX_SCORE = 300;

function cleanText(value, max = 40) {
  return String(value || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, max);
}

function cleanNumber(value, max) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(max, Math.floor(number))) : 0;
}

function requestIp(request) {
  return String(request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || request.socket?.remoteAddress || 'unknown')
    .split(',')[0].trim();
}

function hashIp(ip) {
  return crypto.createHash('sha256').update(`${process.env.GAME_SCORE_SALT || 'ball-kho-gayi-xi'}:${ip}`).digest('hex');
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  try {
    let name = cleanText(request.body?.name, 24) || 'Player';
    const playerId = cleanText(request.body?.playerId, 80);
    const submissionId = cleanText(request.body?.submissionId, 100);
    const score = cleanNumber(request.body?.score, MAX_SCORE);
    const boundaries = cleanNumber(request.body?.boundaries, 12);
    const perfects = cleanNumber(request.body?.perfects, 12);
    const balls = cleanNumber(request.body?.balls, 12);
    const wickets = cleanNumber(request.body?.wickets, 3);

    if (!submissionId) return response.status(400).json({ ok: false, error: 'A submission ID is required.' });
    if (score > 0 && balls < 1) return response.status(400).json({ ok: false, error: 'Invalid innings data.' });
    if (boundaries > balls || perfects > boundaries || wickets > balls || score > balls * 24) {
      return response.status(400).json({ ok: false, error: 'The score does not match the innings data.' });
    }

    const database = await getDatabase();
    if (playerId) {
      const team = await database.collection('team_state').findOne(
        { _id: 'ball-kho-gayi-xi-main' },
        { projection: { 'state.players': 1, 'state.settings.adminName': 1 } }
      );
      if (playerId === 'admin') name = cleanText(team?.state?.settings?.adminName, 24) || 'Administrator';
      else {
        const player = (team?.state?.players || []).find((item) => item.id === playerId && item.status !== 'removed');
        if (!player) return response.status(400).json({ ok: false, error: 'This player profile is no longer active.' });
        name = cleanText(player.name, 24) || name;
      }
    }
    const collection = database.collection(COLLECTION);
    await collection.createIndex({ game: 1, submissionId: 1 }, { unique: true });
    await collection.createIndex({ game: 1, score: -1, perfects: -1, playedAt: 1 });

    const ipHash = hashIp(requestIp(request));
    const since = new Date(Date.now() - 10 * 60 * 1000);
    const recent = await collection.countDocuments({ game: GAME_ID, ipHash, createdAt: { $gte: since } });
    if (recent >= 20) return response.status(429).json({ ok: false, error: 'Too many score submissions. Please wait a few minutes.' });

    const entry = {
      game: GAME_ID,
      submissionId,
      playerId: playerId || null,
      name,
      score,
      boundaries,
      perfects,
      balls,
      wickets,
      playedAt: new Date(),
      createdAt: new Date(),
      ipHash
    };

    try {
      await collection.insertOne(entry);
    } catch (error) {
      if (error?.code === 11000) return response.status(200).json({ ok: true, duplicate: true });
      throw error;
    }

    return response.status(201).json({ ok: true });
  } catch (error) {
    console.error('Game score submission failed:', error);
    return response.status(500).json({ ok: false, error: 'Could not save the score.' });
  }
}
