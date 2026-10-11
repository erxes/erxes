import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import * as express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import {
  createTRPCContext,
  createTRPCRequestHeaders,
  isTRPCRequestAuthentic,
  sendTRPCMessage,
  trpcContextHeaderName,
} from '.';
import { getPlugin, isEnabled } from '../service-discovery';

jest.mock('../service-discovery', () => ({
  getPlugin: jest.fn(),
  isEnabled: jest.fn(),
}));
jest.mock('../utils', () => ({
  generateRequestProcess: jest.fn(() => ({ processId: 'process-1' })),
  getEnv: jest.fn(),
}));
jest.mock(
  '../../core-modules/common/eventHandlers/generateEventHandlers',
  () => ({ createScopedEventHandlers: jest.fn(() => ({})) }),
);
jest.mock('../../core-modules/common/eventHandlers/runtimeContext', () => ({
  setEventHandlerRuntimeContext: jest.fn(),
}));

const t = initTRPC.context<{ subdomain: string }>().create();
const router = t.router({
  deal: t.router({
    find: t.procedure.query(({ ctx }) => ({ subdomain: ctx.subdomain })),
    updateOne: t.procedure.mutation(() => ({ updated: true })),
  }),
});

describe('tRPC request authentication', () => {
  const ORIGINAL_ENV = { ...process.env };
  let server: http.Server;
  let address: string;

  beforeAll(async () => {
    process.env.JWT_TOKEN_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';

    const app = express();

    app.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        router,
        createContext: createTRPCContext(
          async (_subdomain, context) => context,
        ),
      }),
    );

    await new Promise<void>((resolve) => {
      server = app.listen(0, resolve);
    });

    address = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    process.env = { ...ORIGINAL_ENV };
  });

  beforeEach(() => {
    process.env.JWT_TOKEN_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';
    (isEnabled as jest.Mock).mockResolvedValue(true);
    (getPlugin as jest.Mock).mockResolvedValue({ address });
  });

  it('serves a call made through sendTRPCMessage', async () => {
    const result = await sendTRPCMessage({
      subdomain: 'acme',
      pluginName: 'sales',
      module: 'deal',
      action: 'find',
      input: undefined,
      throwOnError: true,
    });

    expect(result).toEqual({ subdomain: 'acme' });
  });

  it('serves a signed mutation', async () => {
    const result = await sendTRPCMessage({
      subdomain: 'acme',
      pluginName: 'sales',
      method: 'mutation',
      module: 'deal',
      action: 'updateOne',
      input: {},
      context: { userId: 'user-1' },
      throwOnError: true,
    });

    expect(result).toEqual({ updated: true });
  });

  it('rejects a request without credentials', async () => {
    const response = await fetch(`${address}/trpc/deal.find`, {
      headers: {
        [trpcContextHeaderName]: createTRPCRequestHeaders(
          'acme',
          'query',
          {},
          'deal.find',
        )[trpcContextHeaderName],
      },
    });

    expect(response.status).toBe(401);
    expect((await fetch(`${address}/trpc/deal.find`)).status).toBe(401);
  });

  it('rejects a credential replayed against another procedure', async () => {
    const response = await fetch(`${address}/trpc/deal.updateOne`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...createTRPCRequestHeaders('acme', 'mutation', {}, 'deal.find'),
      },
      body: '{}',
    });

    expect(response.status).toBe(401);
  });

  it('rejects a context header swapped to another tenant', async () => {
    const signed = createTRPCRequestHeaders('acme', 'query', {}, 'deal.find');
    const forged = createTRPCRequestHeaders('other', 'query', {}, 'deal.find');

    const response = await fetch(`${address}/trpc/deal.find`, {
      headers: {
        ...signed,
        [trpcContextHeaderName]: forged[trpcContextHeaderName],
      },
    });

    expect(response.status).toBe(401);
  });

  it('exposes the signature check for other entry points', () => {
    const headers = createTRPCRequestHeaders('acme', 'query', {}, 'deal.find');

    expect(isTRPCRequestAuthentic(headers, '/deal.find')).toBe(true);
    expect(isTRPCRequestAuthentic(headers, '/deal.updateOne')).toBe(false);
    expect(isTRPCRequestAuthentic(headers, '/deal.find%')).toBe(false);
  });

  it('fails at setup in production when the secret is not configured', () => {
    delete process.env.JWT_TOKEN_SECRET;
    process.env.NODE_ENV = 'production';

    expect(() =>
      createTRPCContext(async (_subdomain, context) => ({ ...context })),
    ).toThrow('JWT_TOKEN_SECRET');
  });
});
