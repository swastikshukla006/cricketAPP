# Ball Kho Gayi XI — Final Production Release

A mobile-first cricket team application built with vanilla HTML, CSS and JavaScript, MongoDB Atlas and Vercel Functions.

## Final application

The app is now organized as focused screens instead of one endless webpage:

- **Home:** live match, next fixture, recent result, announcement and role-based quick actions
- **Matches:** upcoming/completed tabs, dedicated match details, availability and scorecards
- **Squad:** search, role filters, player cards, player profiles and leaderboards
- **Chat:** MongoDB-backed team messages, visible push-notification controls and WhatsApp access
- **Profile:** quick profile/photo editing, personal statistics, availability, goal, PIN, theme and notification tools
- **Admin:** dashboard, opponent teams, players, join requests, live scoring and settings
- **Utilities:** practice team maker, toss room and season statistics
- **Boundary Blitz:** touch/keyboard cricket mini-game with personal best and MongoDB-backed team high scores

The supplied pastel line icons are included as optimized transparent assets in `public/assets/ui-icons/` and used throughout the interface.

## Preserved contracts

This release does not rename or remove backend endpoints and does not alter authentication behaviour.

- `GET /api/ping`
- `GET /api/health`
- `GET /api/state`
- `PUT /api/state`
- `GET /api/push/public-key`
- `POST/DELETE /api/push/subscribe`
- `POST /api/push/send`

Existing player, match, chat, opponent, live-scoring, availability and settings data remain compatible. `gameScores` is an additive state field used only by the mini-game leaderboard.

## Vercel deployment

Use these project settings:

- **Root Directory:** `./`
- **Framework Preset:** Other
- **Build Command:** leave empty/automatic
- **Output Directory:** handled by the included `vercel.json`
- **Node.js:** 22.x

Required environment variables:

```text
MONGODB_URI
MONGODB_DB=ball_kho_gayi_xi
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT=mailto:jiking847@gmail.com
```

Add the variables to Production, Preview and Development. Keep `VAPID_PRIVATE_KEY` private.

Deploy from the repository root:

```powershell
git add -A
git commit -m "Release final Ball Kho Gayi XI app"
git push
```

Vercel will create the deployment automatically.

## First production check

After the deployment becomes **READY**:

1. Open `https://cricket-app-pi-six.vercel.app/api/health` and confirm MongoDB is connected.
2. Open the website once in Chrome and verify Home, Matches, Squad, Chat and Profile.
3. Close and reopen the installed Android app. A visible update prompt is included when a newer service worker is waiting.
4. Test login as player, captain/vice-captain and administrator.
5. Send a test notification from Chat → Chat tools.
6. Start Boundary Blitz while logged in and confirm the score appears on the team leaderboard.

## Android/TWA verification

The package association remains in:

```text
public/.well-known/assetlinks.json
```

Do not change the Android package name or signing fingerprint unless a new signed Android package is generated.

## Operational note

The existing app saves the complete shared state through `PUT /api/state`. To avoid overwriting live match activity, only one authorized device should operate live scoring at a time. This release preserves that backend contract exactly.
