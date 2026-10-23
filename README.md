# Louis Lukoma Kasirye — Portfolio

Personal portfolio site. Plain HTML, CSS and JavaScript in a single `index.html`, with animation from [Motion](https://motion.dev) (the vanilla version of Framer Motion). No build step.

## Project files

| File | What it is |
| --- | --- |
| `index.html` | The whole site: styles, content, images, CV and the editor |
| `favicon.svg` | Browser tab icon |
| `netlify.toml` | Tells Netlify there is no build step and to publish this folder |
| `netlify/functions/admin.mjs` | Editor sign-in and **Publish** on the live site |
| `.gitignore` | Keeps system files out of Git |

All content (text, photo, CV, project covers and screenshots) lives inside `index.html`, in the `<script id="content">` block. You don't need to edit that by hand; use the editor.

## Preview locally

1. Open this folder in VS Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**.

## Edit content on the live site

1. Open the site and add `#admin` to the address, e.g. `https://louislukoma.netlify.app/#admin` (or click **Admin** in the footer).
2. Sign in with the editor password. You stay signed in for 8 hours on that browser.
3. Edit any section. Changes show on the page as you type, and drafts are kept in your browser.
4. Click **Publish**. The editor saves the change to `index.html` on GitHub, and Netlify redeploys in about a minute.

Formatting in text fields: `**bold**`, `*blue accent*`, `[[highlight]]`; a new line becomes a line break.

Each Publish is a commit on GitHub, so run `git pull` before you change files on your computer.

Visitors without the password only see the sign-in form. Publishing checks the password on the server, so no one else can change the site.

### One-time setup

1. **GitHub token.** On GitHub, go to Settings → Developer settings → Fine-grained tokens → Generate new token. Under *Repository access*, pick only `Louis-Lukoma-Portfolio`. Under *Permissions → Contents*, choose **Read and write**. Copy the token.
2. **Netlify variables.** In Netlify, go to Site configuration → Environment variables and add:
   - `ADMIN_PASSWORD`: a long password only you know (it's the only thing protecting the editor)
   - `GITHUB_TOKEN`: the token from step 1
   - optional: `GITHUB_REPO` (default `louiskasirye2021/Louis-Lukoma-Portfolio`) and `GITHUB_BRANCH` (default `main`)
3. Trigger a redeploy (Deploys → Trigger deploy) so the function picks up the variables.

Changing `ADMIN_PASSWORD` signs out every open session. If the token expires, make a new one and replace `GITHUB_TOKEN`.

### Editing locally

Sign-in needs the Netlify function, so it doesn't run under Live Server. There, the editor opens in offline mode: edit, click **Download site file**, replace `index.html`, then commit and push. To test sign-in locally, run `netlify dev` with the same variables set.

## Push changes

```bash
git add .
git commit -m "Update portfolio content"
git push
```
