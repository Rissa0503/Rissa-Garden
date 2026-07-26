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
https://YOUR-USERNAME.github.io/rissas-garden/
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
