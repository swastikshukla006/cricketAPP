**Current release: v14 — player photo upload and complete notification coverage.**

# Ball Kho Gayi XI — Production Release v7.0

A mobile-first cricket team application using vanilla HTML/CSS/JavaScript, Vercel Functions and MongoDB Atlas.

## Main screens

- Home: live match, next fixture, result, announcements, role-based actions and Boundary Blitz
- Matches and dedicated Match Details
- Squad and Player Profiles
- Chat with push-notification controls
- Profile with easy editing, availability, goal, PIN and preferences
- Admin dashboard, teams, players, join requests, live scoring and settings
- Practice Team Maker, season statistics and leadership-only Toss Room
- Boundary Blitz game with local/offline scores and a MongoDB leaderboard

## API endpoints

Existing endpoints remain available:

- `GET /api/ping`
- `GET /api/health`
- `GET /api/state`
- `PUT /api/state`
- `GET /api/push/public-key`
- `POST` and `DELETE /api/push/subscribe`
- `POST /api/push/send`

Game endpoints added for the approved leaderboard:

- `POST /api/game-score`
- `GET /api/game-leaderboard?limit=25`

`PUT /api/state` accepts an optional `baseUpdatedAt` value for stale-write protection. No existing endpoint was renamed.

## MongoDB collections

- `team_state`: existing shared application state
- `push_subscriptions`: existing web-push subscriptions
- `game_scores`: Boundary Blitz leaderboard entries

No existing schema field is removed.

## Vercel setup

- Root Directory: `./`
- Framework Preset: Other
- Build Command: automatic/empty
- Output Directory: configured by `vercel.json`
- Node.js: 22.x

Required environment variables:

```text
MONGODB_URI
MONGODB_DB
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
```

Optional hardening variable:

```text
GAME_SCORE_SALT=<a-long-private-random-value>
```

The game works without `GAME_SCORE_SALT`, but setting it makes IP rate-limit hashes project-specific. Never commit its value.

## Deploy

```powershell
git add -A
git commit -m "Release Ball Kho Gayi XI production v7"
git push
```

After Vercel shows **READY**, test:

1. Player login by selecting the player profile, not Administrator.
2. Captain and vice-captain access to Toss and live scoring.
3. Normal player cannot open Toss, including by direct hash URL.
4. Profile photo and details save correctly.
5. Chat send, failure/retry and push notification.
6. Boundary Blitz score appears on the global leaderboard.
7. Installed app displays the update prompt and new Home game card.

## Android/TWA

`public/.well-known/assetlinks.json`, the manifest scope and existing Android package association are preserved. Web-only changes do not require a new APK.
