# Ball Kho Gayi XI — Major MongoDB Update

Keep Vercel Root Directory set to `ball-kho-gayi-xi-fixed-root` and replace the contents of that active folder with this package.

## Added
- New Cric Time image-led front page
- Proper circular Ball Kho Gayi XI logo
- Player join requests with chosen name, phone, jersey, PIN and profile photo
- Player profile editing and compressed photo uploads
- Ananya set as vice-captain during the v3 migration
- Opponent team directory with editable players
- Practice team maker and manual player movement
- MongoDB-synced dressing room group chat
- Admin-editable branding, leadership, hero image, logo, squad and PINs
- MongoDB remains connected through `/api/state`

## Vercel environment variables
- `MONGODB_URI`
- `MONGODB_DB=ball_kho_gayi_xi`

## Important prototype note
PIN hashes are stored in the shared team state. This is suitable for a trusted school group, but a future secure production login should use dedicated server-side sessions and per-user database records.
