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
