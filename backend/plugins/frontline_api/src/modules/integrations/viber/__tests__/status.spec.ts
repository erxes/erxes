import { test } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { Module } from 'node:module';
import type { ViberHealthStatus } from '../constants';
import { loadViberHelpers, type TestContext } from './helperHarness';

const SUBDOMAIN = 'tenant-test';
const INBOX_ID = 'inbox-test';
const READ_ERROR = 'Unable to read Viber connection status. Try again.';
const MISSING_ERROR = 'Viber connection not found. Reconnect the integration.';

interface StatusOptions {
  subdomain?: string;
  integrationId?: string;
  healthStatus?: ViberHealthStatus;
  error?: string;
  missing?: boolean;
  failAt?: 'models' | 'findOne' | 'select';
}

const createStatusHarness = (t: TestContext, options: StatusOptions = {}) => {
  const subdomain = options.subdomain ?? SUBDOMAIN;
  const integrationId = options.integrationId ?? INBOX_ID;
  const record = Object.freeze({
    _id: 'viber-test',
    inboxId: integrationId,
    botId: 'bot-test',
    token: 'test-token-not-for-status-responses',
    healthStatus: options.healthStatus,
    error: options.error,
  });
  const failure = new Error('Database failure with private connection details');
  const forbidden = t.mock.fn(() => {
    throw new Error(
      'Status reads must not write data or contact other services',
    );
  });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => forbidden());
  const select = t.mock.fn(async (projection: string) => {
    strictEqual(projection, 'healthStatus error');
    if (options.failAt === 'select') throw failure;
    // Include extra fields to check the response whitelist independently of Mongo.
    return options.missing ? null : record;
  });
  const findOne = t.mock.fn((selector: unknown) => {
    deepStrictEqual(selector, { inboxId: integrationId });
    if (options.failAt === 'findOne') throw failure;
    return { select };
  });
  const generateModels = t.mock.fn(async (tenant: string) => {
    strictEqual(tenant, subdomain);
    if (options.failAt === 'models') throw failure;
    const writes = {
      create: forbidden,
      updateOne: forbidden,
      deleteOne: forbidden,
    };
    return {
      Integrations: writes,
      ViberIntegrations: { findOne, ...writes },
    };
  });

  loadViberHelpers(t, {
    sharedUtils: {
      getEnv: forbidden,
      sendTRPCMessage: forbidden,
      uploadFileToStorage: forbidden,
    },
    connectionResolvers: { generateModels },
    inboxReceiver: {},
  });

  const originals = new Map<string, NodeModule | undefined>();
  const rememberModule = (specifier: string): string => {
    const filename = require.resolve(specifier);
    originals.set(filename, require.cache[filename]);
    return filename;
  };
  const replaceModule = (
    specifier: string,
    exports: Record<string, unknown>,
  ): void => {
    const filename = rememberModule(specifier);
    const replacement = new Module(filename);
    replacement.filename = filename;
    replacement.loaded = true;
    replacement.exports = exports;
    require.cache[filename] = replacement;
  };
  t.after(() => {
    for (const [filename, original] of originals) {
      if (original) {
        require.cache[filename] = original;
      } else {
        delete require.cache[filename];
      }
    }
    strictEqual(forbidden.mock.callCount(), 0);
    strictEqual(fetchMock.mock.callCount(), 0);
  });

  const siblingStatus = t.mock.fn(async () => ({
    status: 'success',
    data: { status: 'sibling-status', error: 'sibling-error' },
  }));
  for (const provider of ['facebook', 'instagram', 'discord']) {
    replaceModule(`@/integrations/${provider}/messageBroker`, {
      [`${provider}Status`]: siblingStatus,
    });
  }
  for (const provider of ['facebook', 'instagram']) {
    replaceModule(`@/integrations/${provider}/utils`, {
      graphRequest: { get: forbidden },
    });
  }
  replaceModule('@/integrations/mail/messageBroker', {
    mailIntegrationDetails: forbidden,
  });
  replaceModule('~/modules/inbox/utils', { debugError: forbidden });
  delete require.cache[rememberModule('../messageBroker')];
  delete require.cache[
    rememberModule('@/inbox/graphql/resolvers/customResolvers/integration')
  ];

  const broker: typeof import('../messageBroker') = require('../messageBroker');
  const resolvers: typeof import('@/inbox/graphql/resolvers/customResolvers/integration') = require('@/inbox/graphql/resolvers/customResolvers/integration');
  const readHealth = async (kind = 'viber'): Promise<unknown> =>
    Reflect.apply(resolvers.default.healthStatus, undefined, [
      { _id: integrationId, kind },
      null,
      { subdomain },
    ]);

  return {
    viberStatus: broker.viberStatus,
    readHealth,
    generateModels,
    findOne,
    select,
    siblingStatus,
  };
};

test('the real health resolver returns each saved Viber state and only its public fields', async (t) => {
  for (const status of ['pending', 'healthy', 'unHealthy'] as const) {
    await t.test(status, async (subtest) => {
      const error = status === 'unHealthy' ? 'Registration not confirmed' : '';
      const harness = createStatusHarness(subtest, {
        healthStatus: status,
        error,
      });

      deepStrictEqual(await harness.readHealth(), { status, error });
      strictEqual(harness.generateModels.mock.callCount(), 1);
      strictEqual(harness.findOne.mock.callCount(), 1);
      strictEqual(harness.select.mock.callCount(), 1);
      strictEqual(harness.siblingStatus.mock.callCount(), 0);
    });
  }
});

test('a legacy record without health fields is pending, not healthy', async (t) => {
  const harness = createStatusHarness(t);

  deepStrictEqual(await harness.readHealth(), { status: 'pending', error: '' });
});

test('a successful lookup of a missing record reports an unhealthy connection', async (t) => {
  const harness = createStatusHarness(t, { missing: true });
  const data = { status: 'unHealthy', error: MISSING_ERROR };

  deepStrictEqual(
    await harness.viberStatus({
      subdomain: SUBDOMAIN,
      data: { integrationId: INBOX_ID },
    }),
    { status: 'success', data },
  );
  deepStrictEqual(await harness.readHealth(), data);
});

test('model and query failures return a safe unhealthy result through the real resolver', async (t) => {
  for (const failAt of ['models', 'findOne', 'select'] as const) {
    await t.test(failAt, async (subtest) => {
      const harness = createStatusHarness(subtest, { failAt });
      const data = { status: 'unHealthy', error: READ_ERROR };

      deepStrictEqual(
        await harness.viberStatus({
          subdomain: SUBDOMAIN,
          data: { integrationId: INBOX_ID },
        }),
        { status: 'error', data },
      );
      deepStrictEqual(await harness.readHealth(), data);
    });
  }
});

test('blank tenant or inbox ids return an error without loading models', async (t) => {
  const harness = createStatusHarness(t);
  for (const input of [
    { subdomain: '', integrationId: INBOX_ID },
    { subdomain: '   ', integrationId: INBOX_ID },
    { subdomain: SUBDOMAIN, integrationId: '' },
    { subdomain: SUBDOMAIN, integrationId: '   ' },
  ]) {
    deepStrictEqual(
      await harness.viberStatus({
        subdomain: input.subdomain,
        data: { integrationId: input.integrationId },
      }),
      { status: 'error', data: { status: 'unHealthy', error: READ_ERROR } },
    );
    strictEqual(harness.generateModels.mock.callCount(), 0);
  }
});

test('Viber-prefixed kinds pass the actual tenant and common inbox id to the reader', async (t) => {
  const harness = createStatusHarness(t, {
    subdomain: 'another-tenant',
    integrationId: 'another-inbox',
    healthStatus: 'healthy',
  });

  deepStrictEqual(await harness.readHealth('viber-bot'), {
    status: 'healthy',
    error: '',
  });
  strictEqual(harness.generateModels.mock.callCount(), 1);
  strictEqual(harness.findOne.mock.callCount(), 1);
});

test('the status dispatcher preserves sibling and fallback behavior without Viber reads', async (t) => {
  const harness = createStatusHarness(t);

  for (const kind of ['facebook-messenger', 'instagram', 'discord']) {
    deepStrictEqual(await harness.readHealth(kind), {
      status: 'sibling-status',
      error: 'sibling-error',
    });
  }
  strictEqual(harness.siblingStatus.mock.callCount(), 3);
  for (const kind of ['messenger', 'unknown']) {
    deepStrictEqual(await harness.readHealth(kind), { status: 'healthy' });
  }
  strictEqual(harness.generateModels.mock.callCount(), 0);
});
