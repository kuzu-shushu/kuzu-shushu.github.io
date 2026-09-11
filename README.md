# kuzu-shushu.github.io

A responsive personal page with a local visual editor. No dependencies, analytics, cookies, remote fonts, or browser storage. All supplied/generated profile content is provisional.

## Preview and edit

Requires Node.js 20 or newer. From this repository:

```sh
npm run dev
```

Open **http://127.0.0.1:4173/edit**. Edit text, add or remove education/research/skill entries, choose an accent, and switch between desktop and mobile previews. **Save changes** updates `content/profile.json` and regenerates both `index.html` and `docs/index.html`. Unsaved edits live only in the open page and disappear when you leave. Use **Open page** for the full-width page; refresh that separate page after saving.

The editor server binds only to loopback and validates the request origin and a per-run token before accepting writes. It only serves an explicit list of preview assets. The editor requires this local server; it cannot write files from GitHub Pages.

## Edit in code

Change `content/profile.json`, then run:

```sh
npm run build
```

Layout and colors: `docs/style.css`. HTML template: `scripts/render.mjs`. The generated HTML has real content and needs no JavaScript or build system on GitHub Pages. Empty contact fields are hidden. Clear `note` when sample details have been replaced.

## Publish with GitHub Pages

For the exact address `https://kuzu-shushu.github.io`, the GitHub owner must be `kuzu-shushu` and the remote repository must be named **kuzu-shushu.github.io**. The local folder can remain `kuzu-shushu`.

1. Create an empty repository named `kuzu-shushu.github.io` under that account. Use public visibility for GitHub Free.
2. Build, commit, and push this local repository:

```sh
npm run build
git add .
git commit -m "Create personal GitHub Pages site"
git remote add origin https://github.com/kuzu-shushu/kuzu-shushu.github.io.git
git push -u origin main
```

3. On GitHub, open **Settings → Pages → Build and deployment**, select **Deploy from a branch**, then **main** and **/ (root)**, and save. Publishing from **/docs** also works; the build generates both entrypoints.
4. Wait for GitHub Pages deployment to finish. After future edits, save/build and commit/push the updated profile and generated page.

Saving in the editor updates the local repository; publish subsequent changes by committing and pushing. Official instructions: [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
