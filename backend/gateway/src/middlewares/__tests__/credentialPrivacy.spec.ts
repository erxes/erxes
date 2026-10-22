import express from 'express';
import type { Server } from 'http';
import { getPlugin } from 'erxes-api-shared/utils';
import { credentialPrivacy, credentialUrlPrivacy } from '../credentialPrivacy';

jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('erxes-api-shared/utils'),
  getPlugin: jest.fn(),
}));

// Keep this a boundary test: service discovery and the existing auth-header
// enrichment are independent, while real body forwarding/proxying is exercised.
jest.mock('../../proxy/middleware', () => ({
  proxyReq: jest.requireActual<typeof import('http-proxy-middleware')>(
    'http-proxy-middleware',
  ).fixRequestBody,
  proxyRes: jest.fn(),
  proxyError: jest.fn(),
}));

const listen = async (app: express.Express) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('No test listener');
  return { server, address: `http://127.0.0.1:${address.port}` };
};

const close = async (server: Server) => {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
};

describe('credential gateway boundary', () => {
  let upstream: Server;
  let gateway: Server;
  let url: string;

  beforeEach(async () => {
    const core = express();
    core.use(express.json());
    core.use((req, res) => {
      res.set('Cache-Control', 'no-store');
      res.json({
        path: req.path,
        body: req.body,
        authorization: req.headers.authorization,
      });
    });
    const coreListener = await listen(core);
    upstream = coreListener.server;
    jest
      .mocked(getPlugin)
      .mockResolvedValue({
        address: coreListener.address,
        config: { meta: {} },
      });
    const app = express();
    app.use('/graphql', credentialUrlPrivacy, credentialPrivacy);
    app.use('/graphql', (req, res) =>
      res.json({ routedToRouter: true, body: req.body }),
    );
    const gatewayListener = await listen(app);
    gateway = gatewayListener.server;
    url = `${gatewayListener.address}/graphql`;
  });

  afterEach(async () => {
    await Promise.all([close(gateway), close(upstream)]);
    jest.clearAllMocks();
  });

  it('routes sensitive JSON directly to core with body and session authentication intact', async () => {
    const body = {
      query: 'mutation { alias: credentialsCreate }',
      variables: { value: 'synthetic-input' },
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer synthetic-session',
      },
      body: JSON.stringify(body),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      path: '/graphql',
      body,
      authorization: 'Bearer synthetic-session',
    });
  });

  it('preserves ordinary operations for the router', async () => {
    const body = { query: 'mutation { configsEdit }' };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    expect(await response.json()).toEqual({ routedToRouter: true, body });
    expect(getPlugin).not.toHaveBeenCalled();
  });

  it('redacts malformed credential requests without passing parser errors downstream', async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"query":"credentialsCreate", "secret":"synthetic-input"',
    });
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).not.toContain('synthetic-input');
    expect(getPlugin).not.toHaveBeenCalled();
  });

  it('rejects URL-carried operations before authentication and proxy logging', async () => {
    const response = await fetch(`${url}?query=credentialsDetail`);
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(getPlugin).not.toHaveBeenCalled();
  });

  it('fails closed when core discovery is unavailable', async () => {
    jest
      .mocked(getPlugin)
      .mockRejectedValue(new Error('synthetic-private-detail'));
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"query":"mutation { credentialsCreate }"}',
    });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).not.toContain('synthetic-private-detail');
  });
});
