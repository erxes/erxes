import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '#/config.ts';
import { createApp } from '#/server.ts';

let base = '';
let server: ReturnType<ReturnType<typeof createApp>['listen']>;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = createApp().listen(0, () => resolve());
  });

  const address = server.address();

  if (!address || typeof address === 'string') throw new Error('not listening on a port');

  base = `http://127.0.0.1:${address.port}`;
});

afterAll(() => {
  server.close();
});

describe('server', () => {
  it('answers health checks', async () => {
    expect((await fetch(`${base}/health`)).status).toBe(200);
  });

  it('refuses procedures without a valid session token', async () => {
    const url = `${base}/api/rpc/items/list`;

    expect((await fetch(url, { method: 'POST' })).status).toBe(401);
    expect(
      (await fetch(url, { method: 'POST', headers: { authorization: 'Bearer forged' } })).status,
    ).toBe(401);
  });

  it('lets core-ui call it from the browser', async () => {
    const response = await fetch(`${base}/api/rpc/items/list`, {
      method: 'OPTIONS',
      headers: {
        origin: config.coreUiOrigin,
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'authorization,content-type',
      },
    });

    expect(response.headers.get('access-control-allow-origin')).toBe(config.coreUiOrigin);
    expect(response.headers.get('access-control-allow-headers')).toContain('authorization');
  });
});
