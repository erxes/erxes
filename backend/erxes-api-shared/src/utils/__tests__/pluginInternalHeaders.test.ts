import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Router } from 'express';
import { parse } from 'graphql';
import http from 'http';
import { AddressInfo } from 'net';

// Service discovery and plugin registration run against an in-memory store.
jest.mock('../redis', () => {
  const store = new Map<string, string>();

  return {
    redis: {
      get: async (key: string) => store.get(key) ?? null,
      set: async (key: string, value: string) => {
        store.set(key, value);
        return 'OK';
      },
      del: async (key: string) => (store.delete(key) ? 1 : 0),
    },
  };
});

import { TAfterProcessProducers } from '../../core-modules/logs/types';
import { setUserHeader, signIdentityHeaders } from '../headers';
import { redis } from '../redis';
import { clearServiceDiscoveryCache } from '../service-discovery';
import { startPlugin } from '../start-plugin';
import {
  createTRPCContext,
  getTRPCContextHeaders,
  sendTRPCMessage,
} from '../trpc';
import { sendCoreModuleProducer } from '../trpc/sendCoreModuleProducer';
import { sendAutomationDeferredCompletion } from '../../core-modules/automations/sendAutomationMessage';

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value), 'utf8').toString('base64');

type CallContext = { subdomain: string; userId?: string };

const t = initTRPC.context<CallContext>().create();

const appRouter = t.router({
  identity: t.router({
    whoCalls: t.procedure.query(({ ctx }) => ({
      subdomain: ctx.subdomain,
      userId: ctx.userId ?? null,
    })),
  }),
  automations: t.router({
    completeDeferredAction: t.procedure.mutation(({ ctx }) => ({
      completedFor: ctx.subdomain,
    })),
  }),
});

const afterProcessRouter = t.router({
  [TAfterProcessProducers.AFTER_MUTATION]: t.procedure.mutation(({ ctx }) => ({
    handledFor: ctx.subdomain,
  })),
});

// A plugin route that, like several existing ones, trusts the raw header.
const expressRouter = Router();
expressRouter.get('/raw-userid', (req, res) => {
  res.json({ userid: req.headers.userid ?? null });
});

const whoAmI = Object.assign(
  (_root: unknown, _args: unknown, context: { user?: { _id: string } }) =>
    context.user?._id ?? null,
  { wrapperConfig: { skipPermission: true } },
);

const freePort = async () => {
  const probe = http.createServer();
  await new Promise<void>((resolve) => probe.listen(0, '127.0.0.1', resolve));
  const { port } = probe.address() as AddressInfo;
  await new Promise((resolve) => probe.close(resolve));
  return port;
};

describe('plugin service: internal identity and tRPC headers', () => {
  const env = { ...process.env };
  let baseUrl: string;
  let server: http.Server;

  const get = async (path: string, headers: Record<string, string>) =>
    (await fetch(`${baseUrl}${path}`, { headers })).json();

  const whoAmIOverGraphql = async (headers: Record<string, string>) => {
    const res = await fetch(`${baseUrl}/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify({
        operationName: 'pluginIdentityWhoAmI',
        query: 'query pluginIdentityWhoAmI { pluginIdentityWhoAmI }',
      }),
    });
    return (await res.json()).data?.pluginIdentityWhoAmI;
  };

  // Identity headers as the gateway forwards them for staff-1.
  const gatewayHeaders = () => {
    const headers: Record<string, string> = { hostname: 'tenant.example.com' };
    setUserHeader(headers, { _id: 'staff-1', email: 'staff@example.com' });
    headers['x-erxes-identity-signature'] = signIdentityHeaders(
      headers,
    ) as string;
    return headers;
  };

  const unsignedHeaders = () => ({
    hostname: 'tenant.example.com',
    user: encode({ _id: 'spoofed-user' }),
    userid: 'spoofed-user',
  });

  const callTRPC = () =>
    sendTRPCMessage({
      subdomain: 'tenant',
      pluginName: 'core',
      method: 'query',
      module: 'identity',
      action: 'whoCalls',
      input: {},
      context: { userId: 'staff-1' },
      throwOnError: true,
    });

  const unsignedTRPC = () =>
    fetch(`${baseUrl}/trpc/identity.whoCalls`, {
      headers: {
        'x-trpc-context': encode({
          subdomain: 'other-tenant',
          method: 'query',
        }),
      },
    });

  beforeAll(async () => {
    process.env.JWT_TOKEN_SECRET = 'plugin-test-secret';
    delete process.env.PORT;
    const port = await freePort();
    const createServer = jest.spyOn(http, 'createServer');

    await startPlugin({
      name: 'core',
      port,
      expressRouter,
      graphql: async () => ({
        typeDefs: parse('type Query { pluginIdentityWhoAmI: String }'),
        resolvers: { Query: { pluginIdentityWhoAmI: whoAmI } },
      }),
      apolloServerContext: async (_subdomain, context) => context,
      trpcAppRouter: {
        router: appRouter,
        createContext: async (_subdomain, context) => context,
      },
      onServerInit: async (app) => {
        app.use(
          '/afterProcess',
          trpcExpress.createExpressMiddleware({
            router: afterProcessRouter,
            createContext: createTRPCContext(async (_s, context) => context),
          }),
        );
      },
    });

    server = createServer.mock.results[0].value;
    createServer.mockRestore();
    baseUrl = `http://127.0.0.1:${port}`;

    // Registration used the container hostname; point discovery here.
    await redis.set('erxes-service-core', baseUrl);
    await redis.set('erxes-service-automations', baseUrl);
    clearServiceDiscoveryCache();
  });

  afterAll(async () => {
    process.env = env;
    process.stdin.pause();
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(() => {
    process.env.JWT_TOKEN_SECRET = 'plugin-test-secret';
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.INTERNAL_HEADER_SIGNATURE;
  });

  describe('INTERNAL_HEADER_SIGNATURE=enforce', () => {
    beforeEach(() => {
      process.env.INTERNAL_HEADER_SIGNATURE = 'enforce';
    });

    it('drops an unsigned userid before plugin routes read it', async () => {
      expect(await get('/raw-userid', unsignedHeaders())).toEqual({
        userid: null,
      });
    });

    it('keeps a userid signed by the gateway', async () => {
      expect(await get('/raw-userid', gatewayHeaders())).toEqual({
        userid: 'staff-1',
      });
    });

    it('drops a signed userid that was changed afterwards', async () => {
      expect(
        await get('/raw-userid', { ...gatewayHeaders(), userid: 'staff-9' }),
      ).toEqual({ userid: null });
    });

    it('treats unsigned GraphQL identity as signed out', async () => {
      expect(await whoAmIOverGraphql(unsignedHeaders())).toBeNull();
    });

    it('accepts GraphQL identity signed by the gateway', async () => {
      expect(await whoAmIOverGraphql(gatewayHeaders())).toBe('staff-1');
    });

    it('accepts a tRPC call sent by sendTRPCMessage', async () => {
      expect(await callTRPC()).toEqual({
        subdomain: 'tenant',
        userId: 'staff-1',
      });
    });

    it('rejects a tRPC call whose context is not signed', async () => {
      const res = await unsignedTRPC();

      expect(res.ok).toBe(false);
      expect((await res.json()).error.message).toBe('Invalid context');
    });

    it('rejects a tRPC call signed with another secret', async () => {
      process.env.JWT_TOKEN_SECRET = 'other-secret';
      const headers = getTRPCContextHeaders('tenant', 'query', {});
      process.env.JWT_TOKEN_SECRET = 'plugin-test-secret';

      const res = await fetch(`${baseUrl}/trpc/identity.whoCalls`, {
        headers,
      });

      expect(res.ok).toBe(false);
      expect((await res.json()).error.message).toBe('Invalid context');
    });

    it('accepts a producer call sent by sendCoreModuleProducer', async () => {
      expect(
        await sendCoreModuleProducer({
          subdomain: 'tenant',
          pluginName: 'core',
          moduleName: 'afterProcess',
          producerName: TAfterProcessProducers.AFTER_MUTATION,
          input: {},
          defaultValue: 'rejected',
        }),
      ).toEqual({ handledFor: 'tenant' });
    });

    it('accepts a deferred completion sent to the automations service', async () => {
      await expect(
        sendAutomationDeferredCompletion('tenant', {
          executionId: 'execution-1',
          actionId: 'action-1',
          jobId: 'job-1',
          status: 'success',
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('INTERNAL_HEADER_SIGNATURE=report (default)', () => {
    it('keeps an unsigned userid so an older gateway keeps working', async () => {
      expect(await get('/raw-userid', unsignedHeaders())).toEqual({
        userid: 'spoofed-user',
      });
    });

    it('accepts an unsigned tRPC context so older services keep working', async () => {
      const res = await unsignedTRPC();

      expect(res.ok).toBe(true);
      expect((await res.json()).result.data).toEqual({
        subdomain: 'other-tenant',
        userId: null,
      });
    });
  });
});
