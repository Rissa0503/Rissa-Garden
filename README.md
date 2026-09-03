# Rissa's Garden PWA

A personal growth garden for ML, research, English, and life.

## Publish with GitHub Pages

1. Create a new GitHub repository, for example `rissas-garden`.
2. Upload the **contents of this folder** to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select the `main` branch and the `/ (root)` folder.
6. Save and wait for GitHub Pages to provide the HTTPS address.

The website will normally be available at:

```text
https://rissa0503.github.io/rissas-garden/
```

All project paths are relative, so the PWA works as a GitHub project site.

## Install on iPhone

1. Open the GitHub Pages address in **Safari**.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Turn on **Open as Web App**.
5. Tap **Add**.

The app will appear on the iPhone Home Screen with its own icon and open without the ordinary Safari address bar.

## Move the existing save

The GitHub Pages address has a different browser storage area from `localhost`.

1. In the old localhost version, choose **Export Save**.
2. Open the published PWA.
3. Choose **Import Save** and select the JSON backup.

The same method moves data between Mac, iPhone, different browsers, or future computers.

## Offline use

After the first successful online load, the service worker caches the application shell, background, icons, and sounds. The app can then open offline. Data remains stored locally in that browser/app installation.

## Important privacy note

Do **not** upload exported save JSON files to the public repository. Source code and media in a public GitHub Pages repository can be viewed by other people, but browser `localStorage` data stays on the device unless you deliberately upload or share it.


## v0.5.1 update

- Uses `black-translucent` iOS status-bar mode.
- Locks the outer PWA shell to stop whole-page rubber-band dragging from exposing white space.
- Keeps long content scrollable inside the glass panels.
- Adds **Reset Save** with a second confirmation step.
- Updates the service-worker cache to `rissa-garden-pwa-v0.5.1`.


## v0.5.2 update

- Extends `assets/garden.png` across the root `html` canvas and a fixed body background layer.
- Removes the solid cream status-area fallback after the app has loaded.
- Updates the theme/background fallback color to match the garden sky.
- Updates the service-worker cache to `rissa-garden-pwa-v0.5.2`.

Because iOS stores some Home Screen web-app metadata at installation time,
remove the old Home Screen app and add it again from Safari after the new
GitHub Pages deployment is live.


## v0.5.3 update

- Adds a dedicated portrait mobile wallpaper: `assets/garden-mobile.png`
- Desktop still uses `assets/garden.png`
- iPhone / narrow screens now switch automatically to the portrait background
- Updates service-worker cache to `rissa-garden-pwa-v0.5.3`

After uploading the new files to GitHub Pages:
1. wait for deployment,
2. open the website once in Safari,
3. if the old background still appears, remove the Home Screen app and add it again.


## v0.5.4 update

The portrait image was not too short. The gap came from an iOS viewport
sizing conflict:

- `position: fixed; inset: 0`
- combined with an explicit `height: 100dvh`

In standalone iPhone PWAs, that explicit height can stop before the
bottom Home Indicator safe area. v0.5.4 removes the explicit fixed
height and lets `top: 0` plus `bottom: 0` stretch the wallpaper and each
page across the complete viewport.

The service-worker cache is now `rissa-garden-pwa-v0.5.4`.


## v0.5.5 update

This version replaces the accumulated mobile/PWA override blocks with
one consolidated layout.

The bottom strip was the iPhone Home Indicator safe area. The new
`.app-background` is a real fixed element and extends beyond the
ordinary viewport by each `env(safe-area-inset-*)` value. The portrait
artwork therefore continues behind the bottom system area instead of
ending at its upper boundary.

Cache version: `rissa-garden-pwa-v0.5.5`.


## v0.5.6 update

- Restores full-height internal panels by removing the double subtraction
  of page padding and safe-area values.
- Uses one stable mobile layout block.
- Stops attempting to position DOM content outside WebKit's standalone
  viewport.
- Fades the bottom of `garden-mobile.png` into `#76603d`, the same color
  used by the iOS PWA system-area fallback.
- Cache version: `rissa-garden-pwa-v0.5.6`.


## v0.6.0 — Rissa's Purse

A fifth domain, **Purse**, is now integrated into both Experience and Mode.

### Experience
- Purse Level + XP bar
- Total Income (AUD)
- Total Expense (AUD)

### Mode → Purse
Income:
- Income (AUD)

Expenses:
- Transport (AUD)
- Food (AUD)
- Housing (AUD)
- Other (AUD)
- Optional Other note, e.g. medical, beauty, gifts

Every confirmed Purse entry stores:
- chosen record date
- real submission timestamp
- raw income/expense categories
- optional note
- total expense
- Purse XP gained

### Date behavior
No internet request is required. The PWA reads the device's local clock.
Each fresh app launch defaults to today's local date. A manual date choice
still works for back-filling old entries.

### Purse XP
Expenses earn **0 XP**.

Income uses a deliberately high-weight but diminishing cumulative curve:

`F(total income in AUD) = round(30 × sqrt(total income))`

For each new income entry, XP gained is:

`F(income after entry) - F(income before entry)`

Examples from a zero-income starting point:
- A$25 cumulative income → 150 XP
- A$100 → 300 XP
- A$500 → about 671 XP
- A$1,000 → about 949 XP
- A$5,000 → about 2,121 XP

Because XP is awarded as a difference on the cumulative curve, splitting one
income payment into several entries does not increase the total XP.

Overall Level now gives equal weight to five domains:
ML, Research, English, Life, and Purse.

Save schema version: 3.
Older v0.5.x JSON saves remain importable; Purse starts at zero when absent.
Service worker cache: `rissa-garden-pwa-v0.6.0`.


## v0.6.1 — Expense Breakdown

Purse → Total Expense is now clickable.

The nested Expense Breakdown page shows cumulative AUD totals for:
- Transport
- Food
- Housing
- Other

No save-schema change is required. These category totals were already stored
in the v0.6.0 Purse data model, so existing Purse entries appear immediately.

Navigation:
Experience → Purse → Total Expense → Expense Breakdown

Service worker cache: `rissa-garden-pwa-v0.6.1`.
