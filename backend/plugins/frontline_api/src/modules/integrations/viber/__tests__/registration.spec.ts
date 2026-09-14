import { test } from 'node:test';
import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import { Module } from 'node:module';
import { loadViberHelpers, type TestContext } from './helperHarness';
import type { ViberHealthStatus } from '../constants';

const SUBDOMAIN = 'tenant-test';
const INBOX_ID = 'inbox-test';
const TOKEN = 'test-viber-token';
const RECEIVE_URL = 'https://tunnel.example/viber/receive';
const REGISTRATION_ERROR =
  'Webhook registration could not be confirmed. Check the callback URL and try Repair.';

interface RegistrationOptions {
  receiveUrl?: string;
  inboxMissing?: boolean;
  integrationMissing?: boolean;
  modelError?: Error;
  inboxError?: Error;
  lookupError?: Error;
  permissionError?: Error;
  request?: () => Promise<Response>;
  healthStatus?: ViberHealthStatus;
  error?: string;
  update?: (healthStatus: ViberHealthStatus) => Promise<number>;
}

const createRegistrationHarness = (
  t: TestContext,
  options: RegistrationOptions = {},
) => {
  const events: string[] = [];
  const originalRecord = { _id: 'viber-test', inboxId: INBOX_ID, token: TOKEN };
  const record: typeof originalRecord & {
    healthStatus?: ViberHealthStatus;
    error?: string;
  } = {
    ...originalRecord,
    healthStatus: options.healthStatus,
    error: options.error,
  };
  const getEnv = t.mock.fn(
    ({ name, subdomain }: { name: string; subdomain: string }): string => {
      strictEqual(subdomain, SUBDOMAIN);
      return name === 'VIBER_RECEIVE_URL'
        ? options.receiveUrl ?? RECEIVE_URL
        : '';
    },
  );
  const exists = t.mock.fn(async (selector: unknown) => {
    events.push('inbox');
    deepStrictEqual(selector, { _id: INBOX_ID });
    if (options.inboxError) throw options.inboxError;
    return options.inboxMissing ? null : { _id: INBOX_ID };
  });
  const select = t.mock.fn(async (projection: string) => {
    events.push('token');
    strictEqual(projection, '+token');
    if (options.lookupError) throw options.lookupError;
    return options.integrationMissing ? null : record;
  });
  const findOne = t.mock.fn((selector: unknown) => {
    deepStrictEqual(selector, { inboxId: INBOX_ID });
    return { select };
  });
  const write = t.mock.fn(() => {
    throw new Error(
      'Registration must not create/delete records or change the common inbox',
    );
  });
  const writes = { create: write, updateOne: write, deleteOne: write };
  const updateOne = t.mock.fn(
    async (
      selector: unknown,
      update: { $set: { healthStatus: ViberHealthStatus; error: string } },
      config: unknown,
    ) => {
      deepStrictEqual(selector, { _id: originalRecord._id, inboxId: INBOX_ID });
      deepStrictEqual(config, { runValidators: true });
      deepStrictEqual(Object.keys(update), ['$set']);
      deepStrictEqual(Object.keys(update.$set).sort(), [
        'error',
        'healthStatus',
      ]);
      const { healthStatus, error } = update.$set;
      events.push(`health:${healthStatus}`);
      const matchedCount = options.update
        ? await options.update(healthStatus)
        : 1;
      if (matchedCount !== 1) return { matchedCount, modifiedCount: 0 };
      const modifiedCount = Number(
        record.healthStatus !== healthStatus || record.error !== error,
      );
      Object.assign(record, { healthStatus, error });
      return { matchedCount, modifiedCount };
    },
  );
  const generateModels = t.mock.fn(async (subdomain: string) => {
    events.push('models');
    strictEqual(subdomain, SUBDOMAIN);
    if (options.modelError) throw options.modelError;
    return {
      Integrations: { exists, ...writes },
      ViberIntegrations: { findOne, ...writes, updateOne },
    };
  });
  const checkPermission = t.mock.fn(async (action: string) => {
    events.push('permission');
    strictEqual(action, 'integrationsEdit');
    if (options.permissionError) throw options.permissionError;
  });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    events.push('provider');
    return options.request ? options.request() : new Response('{"status":0}');
  });
  const helpers = loadViberHelpers(t, {
    sharedUtils: { getEnv, markResolvers: () => undefined },
    connectionResolvers: { generateModels },
    inboxReceiver: {},
  });

  const originals = new Map<string, NodeModule | undefined>();
  const rememberModule = (specifier: string): string => {
    const filename = require.resolve(specifier);
    originals.set(filename, require.cache[filename]);
    return filename;
  };
  t.after(() => {
    for (const [filename, original] of originals) {
      if (original) {
        require.cache[filename] = original;
      } else {
        delete require.cache[filename];
      }
    }
    strictEqual(write.mock.callCount(), 0);
    const { _id, inboxId, token } = record;
    deepStrictEqual({ _id, inboxId, token }, originalRecord);
  });

  // Load the real Viber adapter and common dispatcher without sibling services.
  const siblingRepair = t.mock.fn(async () => 'sibling-repair');
  for (const integration of [
    'call',
    'mail',
    'facebook',
    'instagram',
    'discord',
    'callpro',
  ]) {
    const filename = rememberModule(
      `@/integrations/${integration}/messageBroker`,
    );
    const replacement = new Module(filename);
    replacement.filename = filename;
    replacement.loaded = true;
    replacement.exports = {
      [`${integration}RepairIntegrations`]: siblingRepair,
    };
    require.cache[filename] = replacement;
  }
  delete require.cache[rememberModule('../messageBroker')];
  delete require.cache[
    rememberModule('@/inbox/graphql/resolvers/mutations/integrations')
  ];
  const broker: typeof import('../messageBroker') = require('../messageBroker');
  const dispatcher: typeof import('@/inbox/graphql/resolvers/mutations/integrations') = require('@/inbox/graphql/resolvers/mutations/integrations');

  // Supply just the context dependencies consumed by this real resolver.
  const repair = async (kind = 'viber'): Promise<unknown> =>
    Reflect.apply(
      dispatcher.integrationMutations.integrationsRepair,
      undefined,
      [
        null,
        { _id: INBOX_ID, kind },
        { subdomain: SUBDOMAIN, checkPermission },
      ],
    );

  return {
    ...helpers,
    ...broker,
    ...dispatcher,
    repair,
    events,
    getEnv,
    generateModels,
    exists,
    findOne,
    select,
    fetchMock,
    checkPermission,
    siblingRepair,
    record,
    updateOne,
  };
};

test('registers the saved tenant connection with its hidden token and callback URL', async (t) => {
  const harness = createRegistrationHarness(t);

  strictEqual(
    await harness.registerViberWebhook(SUBDOMAIN, INBOX_ID),
    undefined,
  );

  deepStrictEqual(harness.events, [
    'models',
    'inbox',
    'token',
    'health:pending',
    'provider',
    'health:healthy',
  ]);
  strictEqual(harness.record.healthStatus, 'healthy');
  strictEqual(harness.record.error, '');
  strictEqual(harness.fetchMock.mock.callCount(), 1);
  const [url, options] = harness.fetchMock.mock.calls[0].arguments;
  if (!options) throw new Error('Expected fetch options');
  strictEqual(url, 'https://chatapi.viber.com/pa/set_webhook');
  strictEqual(options.method, 'POST');
  strictEqual(new Headers(options.headers).get('X-Viber-Auth-Token'), TOKEN);
  deepStrictEqual(JSON.parse(String(options.body)), {
    url: `${RECEIVE_URL}/${INBOX_ID}`,
    send_name: true,
    send_photo: false,
  });
  strictEqual(harness.select.mock.callCount(), 1);
});

test('rejects invalid callback configuration before model loading or network calls', async (t) => {
  const harness = createRegistrationHarness(t, {
    receiveUrl: 'http://localhost',
  });

  await rejects(harness.registerViberWebhook(SUBDOMAIN, INBOX_ID), {
    message: 'Invalid Viber receive URL',
  });
  strictEqual(harness.generateModels.mock.callCount(), 0);
  strictEqual(harness.fetchMock.mock.callCount(), 0);
  strictEqual(harness.updateOne.mock.callCount(), 0);
});

test('rejects blank tenant and integration ids before configuration or I/O', async (t) => {
  const harness = createRegistrationHarness(t);

  await rejects(harness.registerViberWebhook(' ', INBOX_ID), {
    message: 'Subdomain is required',
  });
  await rejects(harness.registerViberWebhook(SUBDOMAIN, ' '), {
    message: 'Invalid integration id',
  });
  strictEqual(harness.getEnv.mock.callCount(), 0);
  strictEqual(harness.generateModels.mock.callCount(), 0);
  strictEqual(harness.fetchMock.mock.callCount(), 0);
  strictEqual(harness.updateOne.mock.callCount(), 0);
});

test('rejects a missing common integration without looking up credentials', async (t) => {
  const harness = createRegistrationHarness(t, { inboxMissing: true });

  await rejects(harness.registerViberWebhook(SUBDOMAIN, INBOX_ID), {
    message: 'Inbox integration not found',
  });
  strictEqual(harness.findOne.mock.callCount(), 0);
  strictEqual(harness.fetchMock.mock.callCount(), 0);
  strictEqual(harness.updateOne.mock.callCount(), 0);
});

test('rejects a missing provider record without calling Viber', async (t) => {
  const harness = createRegistrationHarness(t, { integrationMissing: true });

  await rejects(harness.registerViberWebhook(SUBDOMAIN, INBOX_ID), {
    message: 'Viber integration not found',
  });
  strictEqual(harness.fetchMock.mock.callCount(), 0);
  strictEqual(harness.updateOne.mock.callCount(), 0);
});

test('propagates model and lookup failures without contacting Viber', async (t) => {
  for (const stage of ['modelError', 'inboxError', 'lookupError'] as const) {
    await t.test(stage, async (subtest) => {
      const failure = new Error('Database unavailable');
      const harness = createRegistrationHarness(subtest, { [stage]: failure });

      await rejects(
        harness.registerViberWebhook(SUBDOMAIN, INBOX_ID),
        (error: unknown) => error === failure,
      );
      strictEqual(harness.fetchMock.mock.callCount(), 0);
      strictEqual(harness.updateOne.mock.callCount(), 0);
    });
  }
});

test('the Repair adapter returns true only after provider acknowledgement', async (t) => {
  let finishRequest: (response: Response) => void = () => {
    throw new Error('Request promise not initialized');
  };
  let requestStarted: () => void = () => {
    throw new Error('Start promise not initialized');
  };
  const response = new Promise<Response>((resolve) => {
    finishRequest = resolve;
  });
  const started = new Promise<void>((resolve) => {
    requestStarted = resolve;
  });
  const harness = createRegistrationHarness(t, {
    healthStatus: 'healthy',
    error: 'Previous error',
    request: () => {
      requestStarted();
      return response;
    },
  });
  let finished = false;
  const result = harness
    .viberRepairIntegration({
      subdomain: SUBDOMAIN,
      data: { integrationId: INBOX_ID },
    })
    .then((value) => {
      finished = true;
      return value;
    });

  await started;
  strictEqual(finished, false);
  strictEqual(harness.record.healthStatus, 'pending');
  strictEqual(harness.record.error, '');
  finishRequest(new Response('{"status":0}'));
  strictEqual(await result, true);
});

test('the Repair adapter throws provider failures instead of returning error objects', async (t) => {
  const harness = createRegistrationHarness(t, {
    request: async () => new Response('{"status":1}'),
  });

  await rejects(
    harness.viberRepairIntegration({
      subdomain: SUBDOMAIN,
      data: { integrationId: INBOX_ID },
    }),
    { message: 'Viber webhook update failed (status 1)' },
  );
  strictEqual(harness.fetchMock.mock.callCount(), 1);
  strictEqual(harness.record.healthStatus, 'unHealthy');
  strictEqual(harness.record.error, REGISTRATION_ERROR);
});

test('an ambiguous network failure can be retried using the same saved connection', async (t) => {
  let loseResponse = true;
  const failure = new Error(`Provider response lost: ${TOKEN} ${RECEIVE_URL}`);
  const harness = createRegistrationHarness(t, {
    request: async () => {
      if (loseResponse) throw failure;
      return new Response('{"status":0}');
    },
  });

  await rejects(
    harness.registerViberWebhook(SUBDOMAIN, INBOX_ID),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.fetchMock.mock.callCount(), 1);
  strictEqual(harness.record.healthStatus, 'unHealthy');
  strictEqual(harness.record.error, REGISTRATION_ERROR);
  loseResponse = false;
  await harness.registerViberWebhook(SUBDOMAIN, INBOX_ID);

  strictEqual(harness.fetchMock.mock.callCount(), 2);
  const [first, second] = harness.fetchMock.mock.calls;
  strictEqual(first.arguments[1]?.body, second.arguments[1]?.body);
  deepStrictEqual(first.arguments[1]?.headers, second.arguments[1]?.headers);
  strictEqual(harness.generateModels.mock.callCount(), 2);
  strictEqual(harness.record.healthStatus, 'healthy');
  strictEqual(harness.record.error, '');
  deepStrictEqual(
    harness.updateOne.mock.calls.map(
      ({ arguments: args }) => args[1].$set.healthStatus,
    ),
    ['pending', 'unHealthy', 'pending', 'healthy'],
  );
});

test('the common Repair dispatcher reaches the real Viber adapter', async (t) => {
  const harness = createRegistrationHarness(t);

  strictEqual(
    await harness.sendRepairIntegration(SUBDOMAIN, 'viber', {
      integrationId: INBOX_ID,
    }),
    true,
  );
  strictEqual(harness.fetchMock.mock.callCount(), 1);
  strictEqual(harness.siblingRepair.mock.callCount(), 0);
});

test('the common Repair dispatcher rejects when the provider request fails', async (t) => {
  const harness = createRegistrationHarness(t, {
    request: async () => new Response('', { status: 503 }),
  });

  await rejects(
    harness.sendRepairIntegration(SUBDOMAIN, 'viber', {
      integrationId: INBOX_ID,
    }),
    /Viber webhook request failed \(HTTP 503\)/,
  );
  strictEqual(harness.fetchMock.mock.callCount(), 1);
});

test('the Viber Repair resolver checks permission before configuration, models, or network', async (t) => {
  const failure = new Error('Permission required');
  const harness = createRegistrationHarness(t, { permissionError: failure });

  await rejects(harness.repair(), (error: unknown) => error === failure);
  deepStrictEqual(harness.events, ['permission']);
  strictEqual(harness.getEnv.mock.callCount(), 0);
  strictEqual(harness.generateModels.mock.callCount(), 0);
  strictEqual(harness.fetchMock.mock.callCount(), 0);
  strictEqual(harness.updateOne.mock.callCount(), 0);
});

test('authorized Viber-prefixed Repair reaches registration after the permission check', async (t) => {
  const harness = createRegistrationHarness(t);

  strictEqual(await harness.repair('viber-bot'), true);
  deepStrictEqual(harness.events, [
    'permission',
    'models',
    'inbox',
    'token',
    'health:pending',
    'provider',
    'health:healthy',
  ]);
  strictEqual(harness.checkPermission.mock.callCount(), 1);
});

test('Viber registration does not change the sibling Repair branch', async (t) => {
  const harness = createRegistrationHarness(t);

  strictEqual(await harness.repair('facebook-messenger'), 'sibling-repair');
  strictEqual(harness.siblingRepair.mock.callCount(), 1);
  strictEqual(harness.checkPermission.mock.callCount(), 0);
  strictEqual(harness.generateModels.mock.callCount(), 0);
  strictEqual(harness.fetchMock.mock.callCount(), 0);
  strictEqual(harness.updateOne.mock.callCount(), 0);
});

test('a failed pending-state write prevents the provider request', async (t) => {
  const failure = new Error('Pending write failed');
  const harness = createRegistrationHarness(t, {
    healthStatus: 'healthy',
    update: async () => {
      throw failure;
    },
  });

  await rejects(
    harness.registerViberWebhook(SUBDOMAIN, INBOX_ID),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.updateOne.mock.callCount(), 1);
  strictEqual(harness.fetchMock.mock.callCount(), 0);
  strictEqual(harness.record.healthStatus, 'healthy');
});

test('every status write must match the existing provider record', async (t) => {
  for (const phase of ['pending', 'healthy', 'unHealthy'] as const) {
    await t.test(phase, async (subtest) => {
      const harness = createRegistrationHarness(subtest, {
        update: async (status) => (status === phase ? 0 : 1),
        request: async () =>
          new Response(
            JSON.stringify({
              status: phase === 'unHealthy' ? 1 : 0,
            }),
          ),
      });

      await rejects(harness.registerViberWebhook(SUBDOMAIN, INBOX_ID), {
        message: 'Viber integration no longer exists',
      });
      strictEqual(
        harness.fetchMock.mock.callCount(),
        phase === 'pending' ? 0 : 1,
      );
      strictEqual(
        harness.updateOne.mock.callCount(),
        phase === 'pending' ? 1 : 2,
      );
    });
  }
});

test('a matched but unchanged pending write is valid', async (t) => {
  const harness = createRegistrationHarness(t, {
    healthStatus: 'pending',
    error: '',
  });

  await harness.registerViberWebhook(SUBDOMAIN, INBOX_ID);

  const firstWrite = await harness.updateOne.mock.calls[0].result;
  deepStrictEqual(firstWrite, { matchedCount: 1, modifiedCount: 0 });
  strictEqual(harness.record.healthStatus, 'healthy');
});

test('the provider request waits for the pending-state write to finish', async (t) => {
  let finishWrite: (matchedCount: number) => void = () => {
    throw new Error('Pending-write promise not initialized');
  };
  let markStarted: () => void = () => {
    throw new Error('Start promise not initialized');
  };
  const pendingWrite = new Promise<number>((resolve) => {
    finishWrite = resolve;
  });
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  const harness = createRegistrationHarness(t, {
    update: async (status) => {
      if (status !== 'pending') return 1;
      markStarted();
      return pendingWrite;
    },
  });
  const result = harness.registerViberWebhook(SUBDOMAIN, INBOX_ID);

  await started;
  strictEqual(harness.fetchMock.mock.callCount(), 0);
  finishWrite(1);
  await result;
  strictEqual(harness.record.healthStatus, 'healthy');
});

test('Repair waits for the final healthy-state write before returning true', async (t) => {
  let finishWrite: (matchedCount: number) => void = () => {
    throw new Error('Final-write promise not initialized');
  };
  let markStarted: () => void = () => {
    throw new Error('Start promise not initialized');
  };
  const finalWrite = new Promise<number>((resolve) => {
    finishWrite = resolve;
  });
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  const harness = createRegistrationHarness(t, {
    update: async (status) => {
      if (status !== 'healthy') return 1;
      markStarted();
      return finalWrite;
    },
  });
  let finished = false;
  const result = harness.repair().then((value) => {
    finished = true;
    return value;
  });

  await started;
  strictEqual(harness.fetchMock.mock.callCount(), 1);
  strictEqual(harness.record.healthStatus, 'pending');
  strictEqual(finished, false);
  finishWrite(1);
  strictEqual(await result, true);
});

test('a failed healthy write rejects without misclassifying provider success and can be retried', async (t) => {
  const failure = new Error('Healthy write failed');
  let failWrite = true;
  const harness = createRegistrationHarness(t, {
    update: async (status) => {
      if (status === 'healthy' && failWrite) throw failure;
      return 1;
    },
  });

  await rejects(
    harness.registerViberWebhook(SUBDOMAIN, INBOX_ID),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.record.healthStatus, 'pending');
  strictEqual(harness.record.error, '');
  deepStrictEqual(harness.events, [
    'models',
    'inbox',
    'token',
    'health:pending',
    'provider',
    'health:healthy',
  ]);
  failWrite = false;
  await harness.registerViberWebhook(SUBDOMAIN, INBOX_ID);
  strictEqual(harness.record.healthStatus, 'healthy');
  strictEqual(harness.fetchMock.mock.callCount(), 2);
});

test('if saving provider failure also fails, the database error propagates and state stays pending', async (t) => {
  const failure = new Error('Failure-state write failed');
  const harness = createRegistrationHarness(t, {
    request: async () => new Response('{"status":1}'),
    update: async (status) => {
      if (status === 'unHealthy') throw failure;
      return 1;
    },
  });

  await rejects(
    harness.registerViberWebhook(SUBDOMAIN, INBOX_ID),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.record.healthStatus, 'pending');
  strictEqual(harness.record.error, '');
  strictEqual(harness.fetchMock.mock.callCount(), 1);
  strictEqual(harness.updateOne.mock.callCount(), 2);
});
