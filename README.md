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
