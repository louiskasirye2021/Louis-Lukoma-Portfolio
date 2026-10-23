# Louis Lukoma Kasirye — Portfolio

Personal portfolio site. Plain HTML, CSS and JavaScript in a single `index.html`, with animation from [Motion](https://motion.dev) (the vanilla version of Framer Motion). No build step.

## Project files

| File | What it is |
| --- | --- |
| `index.html` | The whole site: styles, content, images, CV and the editor |
| `favicon.svg` | Browser tab icon |
| `netlify.toml` | Tells Netlify there is no build step and to publish this folder |
| `.gitignore` | Keeps system files out of Git |

All content (text, photo, CV, project covers and screenshots) lives inside `index.html`, in the `<script id="content">` block. You don't need to edit that by hand; use the editor.

## Preview locally

1. Open this folder in VS Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**.

## Edit content

1. Open the site and add `#admin` to the address, e.g. `https://louislukoma.netlify.app/#admin` (or click **Admin** in the footer).
2. Edit any section. Changes show on the page as you type, and drafts are kept in your browser.
3. Click **Download site file**. You get a new `index.html`.
4. Replace `index.html` in this folder with the downloaded one.
5. Commit and push (see below). Netlify redeploys automatically in about a minute.

Formatting in text fields: `**bold**`, `*blue accent*`, `[[highlight]]`; a new line becomes a line break.

The editor on the live site can't change the live site by itself. Anyone who opens `#admin` only gets a local copy to download, so your published site stays safe.

## Push changes

```bash
git add .
git commit -m "Update portfolio content"
git push
```
