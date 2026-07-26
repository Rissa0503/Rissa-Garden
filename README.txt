RISSA'S GARDEN v0.4.1
========================

NEW IN THIS VERSION
-------------------
1. Export Save
   - Downloads the entire browser save as a JSON file.
   - Includes cumulative totals, XP, selected date, and all dated logs.

2. Import Save
   - Restores a JSON backup on another browser or computer.
   - Shows a summary and asks for confirmation before replacement.

3. Sound system
   - General button click
   - Counter + / -
   - Review / confirmation
   - XP gained
   - Level up
   - Global mute / unmute button in the bottom-right corner

4. Processed sound files
   - click.mp3: 0.287 s
   - counter.mp3: 0.366 s
   - confirm.mp3: 1.384 s
   - xp.mp3: 2.429 s
   - level-up.mp3: 2.978 s

The uploaded sounds were shortened where appropriate, faded out,
and balanced again in JavaScript with per-sound volume settings.

HOW EXPORT / IMPORT HELPS
-------------------------
Old computer/browser:
1. Open Rissa's Garden.
2. Choose Export Save.
3. Keep the downloaded JSON file.

New computer/browser:
1. Copy or download the Rissa_Garden project folder.
2. Open index.html through PyCharm/local server.
3. Choose Import Save.
4. Select the JSON backup and confirm.

The JSON file is the bridge between otherwise separate browser
localStorage databases.

PROJECT STRUCTURE
-----------------
Rissa_Garden_v0.4.1/
├── index.html
├── style.css
├── script.js
├── README.txt
├── assets/
│   └── garden.png
└── sounds/
    ├── click.mp3
    ├── confirm.mp3
    ├── counter.mp3
    ├── level-up.mp3
    └── xp.mp3

IMPORTANT
---------
- Keep using the same local server setup in PyCharm.
- The existing localStorage key remains unchanged:
  rissaGardenSaveV1
- Your current browser data should therefore remain available.
- Before major code changes or browser cleanup, export a backup.
- After replacing project files, press Command + Shift + R in Chrome.

MOBILE ROADMAP
--------------
The practical mobile route is a Progressive Web App (PWA):
1. Publish this static project through a free HTTPS host.
2. Add a web manifest, icons, and a service worker.
3. Open it in the phone browser and add it to the Home Screen.
4. Import the same JSON backup on the phone.

Phone and desktop browser storage are separate, so JSON export/import
remains useful even after the mobile version exists.


PWA VERSION
-----------
This package also includes manifest.webmanifest, sw.js, app icons, safe-area support, and GitHub Pages instructions in README.md.
