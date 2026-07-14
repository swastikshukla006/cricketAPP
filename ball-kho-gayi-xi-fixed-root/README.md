# Ball Kho Gayi XI — MongoDB/Vercel Edition

This folder is ready to be placed directly at the root of the GitHub repository used by Vercel.

## Required Vercel environment variables
- `MONGODB_URI`
- `MONGODB_DB` = `ball_kho_gayi_xi`

## Test routes
- `/api/ping` confirms Vercel Functions are deployed.
- `/api/health` confirms MongoDB is connected.
- `/api/state` reads/writes the shared team state.

## Important filenames
Keep these exact names: `index.html`, `app.js`, `package.json`, and the `api` folder.
