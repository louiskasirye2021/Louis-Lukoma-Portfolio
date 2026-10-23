// Sign-in and publishing for the site editor (#admin).
//
// Environment variables (Netlify → Site configuration → Environment variables):
//   ADMIN_PASSWORD  the password you type into the editor
//   GITHUB_TOKEN    fine-grained token with "Contents: read and write" on the repo
//   GITHUB_REPO     optional, defaults to louiskasirye2021/Louis-Lukoma-Portfolio
//   GITHUB_BRANCH   optional, defaults to main
//
// Publishing commits the new content into index.html on GitHub; Netlify then redeploys.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_HOURS = 8;
const REPO = process.env.GITHUB_REPO || 'louiskasirye2021/Louis-Lukoma-Portfolio';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const FILE = 'index.html';

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
});
const sha256 = s => createHash('sha256').update(s).digest();
const sameSecret = (a, b) => timingSafeEqual(sha256(String(a)), sha256(String(b)));
const signingKey = () => process.env.ADMIN_PASSWORD + ':' + process.env.GITHUB_TOKEN;
const sign = exp => createHmac('sha256', signingKey()).update(String(exp)).digest('hex');

function issueToken() {
  const exp = Date.now() + SESSION_HOURS * 3600e3;
  return exp + '.' + sign(exp);
}
function validToken(req) {
  const m = /^Bearer (\d+)\.([0-9a-f]{64})$/.exec(req.headers.get('authorization') || '');
  return !!m && +m[1] > Date.now() && sameSecret(m[2], sign(m[1]));
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* swaps the content block (and the title/description tags built from it) inside index.html */
function spliceContent(html, c) {
  const block = /<script id="content" type="application\/json">[\s\S]*?<\/script>/;
  if (!block.test(html)) throw new Error('content block not found in ' + FILE);
  const data = JSON.stringify(c).replace(/</g, '\\u003c');
  const title = esc(c.site.title || 'Portfolio');
  const desc = esc(String(c.hero.intro || '').replace(/\*|\[\[|\]\]/g, ''));
  return html
    .replace(block, () => '<script id="content" type="application/json">' + data + '</script>')
    .replace(/<title>[\s\S]*?<\/title>/, () => '<title>' + title + '</title>')
    .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + desc + '">')
    .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + title + '">')
    .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + desc + '">');
}

async function github(path, init = {}) {
  return fetch('https://api.github.com/repos/' + REPO + path, {
    ...init,
    headers: {
      authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
      'x-github-api-version': '2022-11-28',
      'user-agent': 'portfolio-editor',
      ...init.headers
    }
  });
}

async function publish(content) {
  const path = '/contents/' + FILE + '?ref=' + encodeURIComponent(BRANCH);
  const cur = await github(path, { headers: { accept: 'application/vnd.github.raw+json' } });
  if (!cur.ok) return json(502, { error: 'Could not read ' + FILE + ' from GitHub (' + cur.status + '). Check GITHUB_TOKEN and GITHUB_REPO.' });
  const buf = Buffer.from(await cur.arrayBuffer());
  // git blob sha of the file we just read, so GitHub rejects the commit if it changed meanwhile
  const sha = createHash('sha1').update('blob ' + buf.length + '\0').update(buf).digest('hex');
  const next = spliceContent(buf.toString('utf8'), content);
  const put = await github('/contents/' + FILE, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message: 'Update content from site editor',
      content: Buffer.from(next, 'utf8').toString('base64'),
      sha, branch: BRANCH
    })
  });
  if (put.status === 409 || put.status === 422) return json(409, { error: 'The site file changed on GitHub while publishing. Try again.' });
  if (!put.ok) return json(502, { error: 'GitHub rejected the update (' + put.status + '). Check the token has Contents: read and write.' });
  const out = await put.json();
  return json(200, { ok: true, commit: out.commit && out.commit.sha });
}

export default async req => {
  if (!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN) {
    return json(500, { error: 'Editor sign-in is not set up yet. Add ADMIN_PASSWORD and GITHUB_TOKEN in Netlify environment variables.' });
  }
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });
  const route = new URL(req.url).pathname.split('/').pop();

  if (route === 'login') {
    let body = {};
    try { body = await req.json() } catch (e) {}
    if (typeof body.password !== 'string' || !sameSecret(body.password, process.env.ADMIN_PASSWORD)) {
      await new Promise(r => setTimeout(r, 800));
      return json(401, { error: 'Wrong password.' });
    }
    return json(200, { token: issueToken(), hours: SESSION_HOURS });
  }

  if (!validToken(req)) return json(401, { error: 'Session expired. Sign in again.' });
  if (route === 'session') return json(200, { ok: true });

  if (route === 'publish') {
    let body;
    try { body = await req.json() } catch (e) { return json(400, { error: 'Invalid request.' }) }
    const c = body && body.content;
    if (!c || typeof c !== 'object' || !c.site || !c.hero || !c.contact) return json(400, { error: 'Invalid content.' });
    try { return await publish(c) } catch (e) { return json(500, { error: 'Publishing failed: ' + e.message }) }
  }
  return json(404, { error: 'Not found' });
};

export const config = {
  path: ['/api/admin/login', '/api/admin/session', '/api/admin/publish'],
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};
