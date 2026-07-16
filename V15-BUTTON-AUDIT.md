# Ball Kho Gayi XI v15 — Button Reliability Audit

## What changed

- Added a self-healing interaction layer for critical navigation, profile, captain, live-scoring and admin controls.
- Fixed the **See the Teams** hero link so it opens the Squad route instead of an unused `#teams` anchor.
- Added fallback behavior for profile editing, photo editing, PIN changes, match scheduling, results, live scoring, chat tools, theme switching, admin tabs and practice-team controls.
- Added clear permission feedback instead of silent clicks when a player does not have captain/admin access.
- Added visible pressed, disabled and keyboard-focus states.
- Added accessible labels and purpose tooltips to buttons that did not already provide them.
- Added user-visible error feedback when a click handler throws, while keeping saved team data untouched.
- Fixed the profile statistic cards in dark mode so labels and values are readable.
- Updated the service-worker cache to v15 so installed apps receive the repair automatically.

## Compatibility

This release keeps the existing MongoDB state structure, API endpoints, PIN hashes, player records, matches, chat, notifications and Boundary Blitz leaderboard intact.

## Audit coverage

The production document contains 125 static buttons. Every static button is now accounted for by at least one of the following:

- a direct element handler,
- a form submit handler,
- a close/confirmation handler,
- a route or action data attribute,
- or the v15 reliability fallback.

Dynamic buttons generated for players, matches, opponent teams, join requests, chat messages and practice teams continue to use their existing delegated action handlers.
