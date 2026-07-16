# Phase 3 Review Checklist

## Implemented

- App shell and hash-based screen routing
- Premium Home screen
- Fixed bottom navigation
- Role-specific Quick Actions
- Live-score summary on Home
- Upcoming fixture summary and availability state
- Recent result summary
- Captain announcement
- Light/dark compatibility
- Reduced-motion support
- Mobile notification controls remain visible on the existing Chat screen

## Preserved without changes

- `/api/ping`
- `/api/health`
- `/api/state`
- `/api/push/public-key`
- `/api/push/subscribe`
- `/api/push/send`
- MongoDB collections and state shape
- PIN authentication and session storage
- PWA manifest and Android `assetlinks.json`

## Required review

1. Open Home as a logged-out visitor.
2. Log in as a normal player and review Quick Actions.
3. Log in as captain or vice-captain and test Live Scoring, Schedule Match, Add Result and Announcement shortcuts.
4. Log in as administrator and test the Admin shortcut.
5. Confirm Home, Matches, Squad, Chat and Profile navigation.
6. Confirm light and dark themes.
7. Confirm the APK loads the new Home after its service worker updates.

No later screen has been redesigned in this package.
