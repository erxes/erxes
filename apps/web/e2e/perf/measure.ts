// Measures web on a production build: interaction latency and component renders on contacts,
// the lead board and the automation editor, plus per-route load (LCP, last long task, JS bytes,
// script time). Opt-in, never in CI. Seed the org with seed.ts, serve `rsbuild preview`, then:
//   UI_URL=http://localhost:3500 EMAIL=owner@acme.test PASSWORD=… CHROME=/path/to/chrome \
//     pnpm --silent --filter @erxes/web perf > before.json
// Each interaction is a scripted event timed to the next frame. "renders" counts the components
// that ran, read from React's devtools hook. Medians over RUNS runs (default 3).
import { CORE_API_PREFIX, coreContract } from '@erxes/core-contract';
import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { env, stdout } from 'node:process';
import { chromium, type BrowserContextOptions } from 'playwright-core';
import { board, contactsSearchAndPanel, contactsTable, editor, median, settle } from './flows';
import { installProbes } from './probes';

const UI = env.UI_URL ?? 'http://localhost:3500';
const { EMAIL, PASSWORD, CHROME } = env;
const RUNS = Number(env.RUNS ?? 3);

if (!EMAIL || !PASSWORD || !CHROME) throw new Error('EMAIL, PASSWORD and CHROME are required');

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });

const newContext = async (storageState?: BrowserContextOptions['storageState']) => {
  const context = await browser.newContext({
    baseURL: UI,
    viewport: { width: 1440, height: 900 },
    storageState,
  });

  // tsx keeps function names by wrapping them in esbuild's `__name` helper, and the page that
  // receives installProbes' source has no such helper.
  await context.addInitScript({ content: 'globalThis.__name = (fn) => fn;' });
  await context.addInitScript(installProbes);

  return context;
};

const signIn = async () => {
  const context = await newContext();
  const page = await context.newPage();

  await page.goto('/');
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByPlaceholder('Enter your password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Sign-in stays on `/`, so wait for its form to go.
  await page.getByLabel('Email').waitFor({ state: 'detached' });
  await page.evaluate(() => localStorage.setItem('erxes:leads:view', JSON.stringify('table')));

  const state = await context.storageState();

  await context.close();

  return state;
};

/** A fresh, cache-less load of `path`: LCP, the end of the last long task, JS and script time. */
const load = async (storageState: BrowserContextOptions['storageState'], path: string) => {
  const context = await newContext(storageState);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  await cdp.send('Performance.enable');
  await page.goto(path);
  await settle(page);

  const { metrics } = await cdp.send('Performance.getMetrics');
  const script = metrics.find((metric) => metric.name === 'ScriptDuration')?.value ?? 0;

  const result = await page.evaluate(() => {
    const js = performance
      .getEntriesByType('resource')
      .filter((entry) => entry instanceof PerformanceResourceTiming)
      .filter((entry) => entry.name.endsWith('.js'));

    return {
      lcp: Math.round(window.perf.lcp),
      lastLongTask: Math.round(window.perf.lastLongTaskEnd),
      jsFiles: js.length,
      jsTransferredKb: Math.round(js.reduce((sum, entry) => sum + entry.transferSize, 0) / 1024),
      jsDecodedKb: Math.round(js.reduce((sum, entry) => sum + entry.decodedBodySize, 0) / 1024),
    };
  });

  await context.close();

  return { ...result, scriptMs: Math.round(script * 1000) };
};

const storageState = await signIn();
const session = storageState.cookies.find((cookie) => cookie.name === 'erxes_session')?.value;

if (!session) throw new Error('sign-in set no session cookie');

const core: ContractRouterClient<typeof coreContract> = createORPCClient(
  new OpenAPILink(coreContract, {
    url: `${UI}${CORE_API_PREFIX}`,
    headers: { authorization: `Bearer ${session}` },
  }),
);

const automationId = (await core.automations.list({})).data[0]?.id;

if (!automationId) throw new Error('no automation to open; run seed.ts first');

const runs: Record<string, Record<string, number>>[] = [];

for (let run = 0; run < RUNS; run++) {
  const context = await newContext(storageState);
  const page = await context.newPage();

  const result: Record<string, Record<string, number>> = {
    ...(await contactsTable(page)),
    ...(await contactsSearchAndPanel(page)),
    ...(await board(page)),
    ...(await editor(page, automationId)),
  };

  await context.close();

  for (const [name, path] of [
    ['home', '/'],
    ['contacts', '/contacts/customers'],
    ['automation editor', `/automations/${automationId}`],
  ] as const) {
    result[`load: ${name}`] = await load(storageState, path);
  }

  runs.push(result);
}

await browser.close();

const out = Object.fromEntries(
  Object.entries(runs[0] ?? {}).map(([name, metrics]) => [
    name,
    Object.fromEntries(
      Object.keys(metrics).map((key) => [key, median(runs.map((run) => run[name]?.[key] ?? 0))]),
    ),
  ]),
);

stdout.write(`${JSON.stringify(out, null, 2)}\n`);
