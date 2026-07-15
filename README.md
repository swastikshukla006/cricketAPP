# Ball Kho Gayi XI - Mobile Cricket App Website

Flat-root Vercel project with a static mobile-first frontend and MongoDB-backed Vercel Functions.

## Included

- Player join, login, private PIN hashing, profile photo, phone, jersey and self-editable role
- Captain and Ananya vice-captain leadership access
- Live ball-by-ball scoring with undo, strike swap, extras, target, share and result-desk transfer
- Post-match scorecards and automatic player statistics
- Our team, editable opponent teams and temporary opponent players
- Practice team maker, availability, toss room and MongoDB group chat
- WhatsApp group link and downloadable player guide PDF
- Admin-editable branding, leadership, players, opponents and links

## Vercel

Use these settings:

- Root Directory: `./`
- Framework Preset: Other
- Build Command: automatic / empty
- Output Directory: automatic (the included `vercel.json` serves `public`)

Environment variables:

- `MONGODB_URI`
- `MONGODB_DB=ball_kho_gayi_xi`

Push the whole folder contents to the repository root.

## Android Trusted Web Activity verification

This package includes:

```text
public/.well-known/assetlinks.json
```

After deploying, verify that this URL displays JSON rather than a 404 page:

```text
https://cricket-app-pi-six.vercel.app/.well-known/assetlinks.json
```

The file is matched to the PWABuilder Android package ID and signing certificate. Do not change its package name or SHA-256 fingerprint unless a new Android signing key/package is generated.


## Web Push Notifications

This build includes real Android/PWA push notifications for:

- New dressing-room chat messages
- New match fixtures and completed-match results
- Captain announcements
- Important live-score events (wicket, four, six and innings completion)
- Join requests for leadership and approved-player updates

### Required Vercel environment variables

Add these in **Vercel → Project Settings → Environment Variables** for Production, Preview and Development:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (example: `mailto:jiking847@gmail.com`)

Do not place the private key in `public/`, GitHub, HTML, or frontend JavaScript. A separate private setup text file is supplied next to the ZIP.

After adding the variables, redeploy once. Each player must log in and tap **Enable Notifications** on their own phone. Android will then ask for notification permission.
