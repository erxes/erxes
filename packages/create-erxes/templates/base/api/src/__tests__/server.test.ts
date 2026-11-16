import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
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

  it("refuses a job without core's token", async () => {
    const job = { jobId: 'j1', orgId: 'o1', name: 'items.count', attempt: 1, payload: {} };

    const response = await fetch(`${base}/api/jobs/items.count`, {
      method: 'POST',
      body: JSON.stringify(job),
    });

    expect(response.status).toBe(401);
  });

  it('lets web call it from any organisation address', async () => {
    const response = await fetch(`${base}/api/rpc/items/list`, {
      method: 'OPTIONS',
      headers: {
        origin: 'https://acme.app.erxes.io',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'authorization,content-type',
      },
    });

    expect(response.headers.get('access-control-allow-origin')).toBe('https://acme.app.erxes.io');
    expect(response.headers.get('access-control-allow-credentials')).toBeNull();
    expect(response.headers.get('access-control-allow-headers')).toContain('authorization');
  });
});
