import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { pluginFetch, setPluginRuntime, type PluginSession } from './plugin-runtime';

const MINUTE = 60_000;

/** A token shaped like core's: its claims say it lasts 5 minutes on core's clock. */
const tokenNumber = (number: number) => {
  const iat = 1_000_000 + number;
  const claims = btoa(JSON.stringify({ iat, exp: iat + 300 })).replaceAll('=', '');

  return `header.${claims}.signature-${number}`;
};

/**
 * Core hands out tokens 1, 2, …; the plugin's API refuses the ones listed in
 * `refused` and echoes the body of every call it takes.
 */
const fakeCore = (options: { refused?: string[]; expiresAt?: () => string } = {}) => {
  let issued = 0;
  const bodies: string[] = [];

  setPluginRuntime({
    session: (): Promise<PluginSession> => {
      issued += 1;

      return Promise.resolve({
        token: tokenNumber(issued),
        expiresAt: options.expiresAt?.() ?? new Date(Date.now() + 5 * MINUTE).toISOString(),
        apiUrl: 'https://hr.example',
      });
    },
    subscribe: () => () => undefined,
  });

  vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
    const token = new Headers(init.headers).get('Authorization')?.slice('Bearer '.length) ?? '';

    if (options.refused?.includes(token)) return new Response(null, { status: 401 });

    bodies.push(await new Response(init.body).text());

    return new Response(token);
  });

  return { issued: () => issued, bodies };
};

describe('pluginFetch', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['Date'] }));

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setPluginRuntime(null);
  });

  it('asks core once for parallel calls, and once more when the plugin refuses that token', async () => {
    const core = fakeCore({ refused: [tokenNumber(1)] });

    const answers = await Promise.all(
      ['a', 'b', 'c', 'd', 'e'].map((body) =>
        pluginFetch('hr', '/leaves', { method: 'POST', body }).then((response) => response.text()),
      ),
    );

    expect(answers).toEqual(Array.from({ length: 5 }, () => tokenNumber(2)));
    expect(core.issued()).toBe(2);
    expect(new Set(core.bodies)).toEqual(new Set(['a', 'b', 'c', 'd', 'e']));
  });

  it("renews on the token's own lifetime, whatever the browser's clock says", async () => {
    // The browser's clock is 10 minutes behind core's: expiresAt looks 15 minutes away.
    const core = fakeCore({ expiresAt: () => new Date(Date.now() + 15 * MINUTE).toISOString() });

    await pluginFetch('hr', '/leaves');
    vi.setSystemTime(Date.now() + 4 * MINUTE);
    await pluginFetch('hr', '/leaves');
    expect(core.issued()).toBe(1);

    // 30 seconds before the 5 minutes are up, it is renewed before the call.
    vi.setSystemTime(Date.now() + 0.6 * MINUTE);
    expect(await (await pluginFetch('hr', '/leaves')).text()).toBe(tokenNumber(2));
    expect(core.issued()).toBe(2);
  });
});
