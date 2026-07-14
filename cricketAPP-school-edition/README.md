# Cricket Circle — School Edition

A static HTML/CSS/JavaScript cricket team website designed for entering match data after returning from school.

## Main features

- Post-match score entry instead of live phone scoring
- Full match archive and scorecards
- Toss simulator and saved toss decision
- Player profiles with school class, role, jersey, batting and bowling styles
- Captain and vice-captain assignment
- Runs, wickets, catches, strike rate and economy leaderboards
- Local browser storage
- JSON backup export and import
- Installable PWA shell
- Admin and developer credit for Swastik Shukla

## Run locally

Open `index.html`, or use the VS Code Live Server extension.

## Deploy to Vercel

Upload all files to the root of the GitHub repository and use:

- Framework Preset: Other
- Build Command: blank
- Output Directory: `.`
- Root Directory: `./`

## Data note

Data is currently saved in the browser using `localStorage`. Export JSON backups from the Admin section. A shared online database can be added later before packaging the website as an APK.
