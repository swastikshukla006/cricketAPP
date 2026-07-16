# Final Production Release Notes — v7.0

## Login and account access

- Player profiles are listed before the separate Administrator account.
- Captain is selected by default instead of remembering an old Administrator selection.
- Added clear Player versus Administrator guidance, inline errors, a PIN visibility toggle and persistent-login control.
- Existing PIN hashes and authentication rules are preserved.

## Product and usability improvements

- Focused routed views with fixed Home, Matches, Squad, Chat and Profile navigation.
- Prominent Boundary Blitz card on Home plus shortcuts from Profile and Admin.
- Easier full-screen mobile profile editor with photo preview, jersey validation, unsaved-change protection and clear save feedback.
- Loading overlay, connection state, save state, offline feedback and conflict warnings.
- Accessible modal focus handling, stronger keyboard focus, larger touch targets and reduced-motion support.
- Visible service-worker update prompt for the installed web app/APK.

## Chat

- Optimistic message display with Sending and Retry states.
- Date separators, connection state and jump-to-latest control.
- Messages save locally when offline and clearly report sync failures.

## Boundary Blitz

The old embedded mini-game has been replaced by the supplied two-over timing game in `public/game.html`.

- 12-ball innings, three wickets, timing zones and score multipliers.
- Pause/resume, sound preference, replay and score sharing.
- Logged-in player identity is loaded automatically.
- Device scores work offline and pending scores retry after reconnecting.
- Global MongoDB leaderboard stores each player's best innings.
- New endpoints: `POST /api/game-score` and `GET /api/game-leaderboard`.
- Submission validation, duplicate protection and basic rate limiting are included.

## Permissions

- Toss controls and the Toss route are hidden and blocked for ordinary players.
- Toss remains available to the captain, vice-captain and the administrator/captain account.

## Data protection

- Existing endpoint names and MongoDB state fields remain compatible.
- `PUT /api/state` now optionally accepts `baseUpdatedAt` and rejects stale writes with HTTP 409 instead of silently overwriting newer team data.
- Old clients that do not send `baseUpdatedAt` remain compatible.
- Game scores use a separate `game_scores` collection, avoiding contention with chat, profiles and live scoring.

## Cache version

`ball-kho-gayi-xi-v11-production`

## Validation performed

- JavaScript syntax checks for all frontend, service-worker and API files.
- Duplicate HTML ID check.
- JavaScript-to-DOM ID reference check.
- CSS brace and asset-reference checks.
- Manifest and service-worker asset verification.

A real Vercel Preview on one phone remains the final visual/device acceptance step before promoting the commit to Production.
