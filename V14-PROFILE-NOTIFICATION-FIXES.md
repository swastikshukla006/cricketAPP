# Ball Kho Gayi XI v14

## Player photo upload reliability

- Replaced the hidden label-only file chooser with explicit **Choose from gallery** and **Take photo** buttons.
- Added a direct photo shortcut from the profile image pencil button.
- Added live preview, remove-photo support, file-size validation and clear error messages.
- Supports JPG, PNG, WebP and any other image format that the phone browser can decode.
- Photos are converted to a compact JPEG before saving to reduce MongoDB payload size.
- Profile saves now merge with the newest MongoDB state and automatically retry conflicts, reducing lost profile/photo updates when another phone saves at the same time.
- Offline profile edits remain in local backup and retry when the phone reconnects.

## Notification coverage

Push notifications now cover:

- Team chat
- New fixtures and match cancellations
- Completed results
- Live scoring start, boundaries, wickets and innings end
- Captain announcements
- Join requests and approved/new players
- Player availability updates for leadership
- Practice-team changes
- Toss decisions
- Leadership changes
- Player profile/PIN security changes
- New Boundary Blitz leaderboard records

Players can independently enable or disable notification categories for matches, live scoring, chat, announcements, team updates and the game. Existing subscriptions default to all categories enabled.

## Other reliability fixes

- Service worker cache bumped to `ball-kho-gayi-xi-v14-profile-notifications`.
- Service-worker registration URL bumped to `/sw.js?v=14` so installed apps detect this release.
- Notification preferences sync to MongoDB push-subscription records without changing existing endpoint names.
- Existing authentication, team state, match state, MongoDB document and Android package association remain compatible.
