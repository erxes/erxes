import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { chat, resultsOf, userMessage } from './assistantChat';
import { useTestDatabase } from './db';
import { connectProvider, fakeModel, inSteps } from './fakeModel';
import { useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0031';

const result = (url: string, title: string, snippet: string, ad = false) => `
<div class="result results_links results_links_deep web-result ${ad ? 'result--ad' : ''}">
  <div class="links_main links_deep result__body">
    <h2 class="result__title">
      <a rel="nofollow" class="result__a" href="//duckduckgo.com/l/?uddg=${encodeURIComponent(url)}&amp;rut=abc">${title}</a>
    </h2>
    <a class="result__snippet" href="//duckduckgo.com/l/?uddg=${encodeURIComponent(url)}">${snippet}</a>
  </div>
</div>`;

const ARTICLE = `<!doctype html><html><head><title>Naadam 2026 | Visit Mongolia</title></head><body>
<nav><a href="/">Home</a> <a href="/hotels">Hotels</a> <a href="/login">Sign in</a></nav>
<article>
  <h1>Naadam 2026</h1>
  <p>The national Naadam festival runs from <strong>11 to 13 July 2026</strong> at the Central Stadium in Ulaanbaatar.</p>
  <p>It opens with a parade and holds wrestling, horse racing and archery, the three games of men. Tickets go on sale in June at the stadium and online.</p>
  <p>Read the <a href="https://visit.example/schedule">full schedule</a> for every event and its start time.</p>
</article>
<footer>© Visit Mongolia. Cookies help us deliver our services.</footer>
</body></html>`;

describe('web search and pages', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;
  let web: Server;
  let base = '';
  let searches = 0;
  let busyFirst = false;

  beforeAll(async () => {
    web = createServer((req, res) => {
      const url = new URL(req.url ?? '/', 'http://localhost');

      if (url.pathname === '/html/') {
        searches += 1;

        if (busyFirst && searches === 1) {
          res.writeHead(202, { 'content-type': 'text/html' });
          res.end('<form id="challenge-form"></form>');

          return;
        }

        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(
          `<div class="results">${result('https://ads.example/buy', 'Buy now', 'An ad', true)}${result(`${base}/old-naadam`, 'Naadam 2026 | <b>Visit</b> Mongolia', `Dates for ${url.searchParams.get('q')}`)}${result('https://wiki.example/Naadam', 'Naadam - Wiki', 'A festival')}</div>`,
        );

        return;
      }

      if (url.pathname === '/old-naadam') {
        res.writeHead(301, { location: '/naadam' });
        res.end();

        return;
      }

      if (url.pathname === '/naadam') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(ARTICLE);

        return;
      }

      res.writeHead(404, { 'content-type': 'text/html' });
      res.end('<h1>Not found</h1>');
    }).listen(0);
    await once(web, 'listening');

    const address = web.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    base = `http://127.0.0.1:${address.port}`;
    Object.assign(config.web, { searchUrl: `${base}/html/` });

    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await connectProvider(t.owner(), KEY);
  });

  afterAll(async () => {
    await model.close();
    await new Promise<void>((resolve) => web.close(() => resolve()));
  });

  const ask = (text: string) => chat(t.owner(), { message: userMessage(text), model: 'kimi-k3' });

  it('searches DuckDuckGo, retrying once when it is busy, and reads the page a result links to as Markdown', async () => {
    busyFirst = true;
    searches = 0;
    model.script(
      inSteps(
        { tool: 'webSearch', input: { query: 'naadam 2026 dates' } },
        { tool: 'readWebPage', input: { url: `${base}/old-naadam` } },
      ),
    );

    const { view } = await ask('When is Naadam this year?');

    expect(searches).toBe(2);
    expect(resultsOf(view, 'webSearch')).toEqual([
      {
        ok: true,
        results: [
          {
            title: 'Naadam 2026 | Visit Mongolia',
            url: `${base}/old-naadam`,
            snippet: 'Dates for naadam 2026 dates',
          },
          { title: 'Naadam - Wiki', url: 'https://wiki.example/Naadam', snippet: 'A festival' },
        ],
      },
    ]);

    const [page] = resultsOf(view, 'readWebPage');

    expect(page).toMatchObject({ ok: true, url: `${base}/naadam`, truncated: false });
    expect(page).toHaveProperty(
      'content',
      expect.stringContaining('**11 to 13 July 2026** at the Central Stadium'),
    );
    expect(page).toHaveProperty(
      'content',
      expect.stringContaining('[full schedule](https://visit.example/schedule)'),
    );
    expect(page).toHaveProperty('content', expect.not.stringContaining('Sign in'));
    busyFirst = false;
  });

  it('refuses a private address in production and says why a page could not be read', async () => {
    model.script(inSteps({ tool: 'readWebPage', input: { url: `${base}/missing` } }));

    const allowed = config.outbound.allowPrivate;
    const { view } = await ask('Read this page');

    expect(resultsOf(view, 'readWebPage')[0]).toEqual({
      ok: false,
      code: 'READ_FAILED',
      message: 'The page answered 404',
    });

    Object.assign(config.outbound, { allowPrivate: false });
    model.script(inSteps({ tool: 'readWebPage', input: { url: `${base}/naadam` } }));

    const blocked = await ask('Read the local page').finally(() =>
      Object.assign(config.outbound, { allowPrivate: allowed }),
    );

    expect(resultsOf(blocked.view, 'readWebPage')).toEqual([
      { ok: false, code: 'READ_FAILED', message: 'Use an https address' },
    ]);
  });

  it('gives a made agent the web tools only when its Web switch is on', async () => {
    const owner = t.owner();
    const toolNames: string[][] = [];

    model.script((request) => {
      toolNames.push((request.tools ?? []).map((tool) => tool.function.name));

      return { text: 'Hello!' };
    });

    const { id } = await owner.agents.create({
      name: 'Shop bot',
      instructions: 'Answer shoppers.',
      access: { areas: {} },
    });

    await owner.agents.try({ id, text: 'Hi', restart: true });
    await owner.agents.update({ id, web: true });
    await owner.agents.try({ id, text: 'Hi', restart: true });

    expect(await owner.agents.get({ id })).toMatchObject({ web: true });
    expect(toolNames[0]).not.toContain('webSearch');
    expect(toolNames[1]).toEqual(expect.arrayContaining(['webSearch', 'readWebPage']));
  });
});
