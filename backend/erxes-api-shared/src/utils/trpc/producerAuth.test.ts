import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import * as express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import { createTRPCContext } from '.';
import { sendCoreModuleProducer } from './sendCoreModuleProducer';
import {
  sendAutomationDeferredCompletion,
  sendAutomationRun,
  sendAutomationTrigger,
} from '../../core-modules/automations/sendAutomationMessage';
import { getPlugin, isEnabled } from '../service-discovery';
import { redis } from '../redis';

jest.mock('../service-discovery', () => ({
  getPlugin: jest.fn(),
  isEnabled: jest.fn(),
}));
jest.mock('../redis', () => ({ redis: { get: jest.fn() } }));
jest.mock('../mq-worker', () => ({ sendWorkerQueue: jest.fn() }));
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

const received: Record<string, unknown[]> = {};

const t = initTRPC.context<{ subdomain: string }>().create();
const record = (name: string) =>
  t.procedure
    .input((value: unknown) => value)
    .mutation(({ ctx, input }) => {
      (received[name] ||= []).push({ subdomain: ctx.subdomain, input });

      return { ok: true };
    });

const segmentsRouter = t.router({
  listSegmentMembers: record('listSegmentMembers'),
});
const automationsRouter = t.router({
  automations: t.router({
    trigger: record('trigger'),
    runForTarget: record('runForTarget'),
    completeDeferredAction: record('completeDeferredAction'),
  }),
});

const waitFor = async (name: string) => {
  for (let attempt = 0; attempt < 50 && !received[name]?.length; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  return received[name];
};

describe('signed tRPC calls from the shared senders', () => {
  const ORIGINAL_ENV = { ...process.env };
  let server: http.Server;
  let address: string;

  beforeAll(async () => {
    process.env.JWT_TOKEN_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';

    const app = express();

    app.use(
      '/segments',
      trpcExpress.createExpressMiddleware({
        router: segmentsRouter,
        createContext: createTRPCContext(
          async (_subdomain, context) => context,
        ),
      }),
    );
    app.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        router: automationsRouter,
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
    Object.keys(received).forEach((key) => delete received[key]);
    (isEnabled as jest.Mock).mockResolvedValue(true);
    (getPlugin as jest.Mock).mockResolvedValue({ address });
    (redis.get as jest.Mock).mockResolvedValue(address);
  });

  it('delivers a core module producer call to its mount', async () => {
    await sendCoreModuleProducer({
      subdomain: 'acme',
      moduleName: 'segments',
      producerName: 'listSegmentMembers',
      pluginName: 'sales',
      input: { contentType: 'sales:deal' },
    } as never);

    expect(received.listSegmentMembers).toEqual([
      {
        subdomain: 'acme',
        input: { subdomain: 'acme', data: { contentType: 'sales:deal' } },
      },
    ]);
  });

  it('delivers an automation trigger over tRPC', async () => {
    sendAutomationTrigger(
      'acme',
      { type: 'sales:deal', targets: [{ _id: 'deal-1' }] },
      { transport: 'trpc' },
    );

    expect(await waitFor('trigger')).toHaveLength(1);
  });

  it('delivers an automation run over tRPC', async () => {
    sendAutomationRun(
      'acme',
      { automationId: 'automation-1', target: { _id: 'deal-1' } },
      { transport: 'trpc' },
    );

    expect(await waitFor('runForTarget')).toHaveLength(1);
  });

  it('delivers a deferred completion', async () => {
    await sendAutomationDeferredCompletion('acme', {
      executionId: 'execution-1',
      actionId: 'action-1',
      jobId: 'job-1',
      status: 'success',
    });

    expect(received.completeDeferredAction).toHaveLength(1);
  });
});
