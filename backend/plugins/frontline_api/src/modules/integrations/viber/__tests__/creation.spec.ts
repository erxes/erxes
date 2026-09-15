import { test } from 'node:test';
import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert';
import { Module } from 'node:module';
import type { IViberIntegrationDocument } from '../@types/integration';
import type { ViberHealthStatus } from '../constants';
import { loadViberHelpers, type TestContext } from './helperHarness';

const SUBDOMAIN = 'tenant-test';
const INBOX_ID = 'inbox-test';
const TOKEN = 'test-viber-token';
const BOT_ID = 'bot-test';
const RECEIVE_URL = 'https://tunnel.example/viber/receive';
const RECOVERY_MESSAGE =
  'Integration saved. Use Repair to finish connecting the Viber bot.';
const REGISTRATION_ERROR =
  'Webhook registration could not be confirmed. Check the callback URL and try Repair.';

type SavedConnection = Pick<
  IViberIntegrationDocument,
  '_id' | 'inboxId' | 'botId' | 'token' | 'healthStatus' | 'error'
>;

interface CreationOptions {
  kind?: string;
  duplicateBot?: boolean;
  saveFailure?: 'before' | 'after';
  healthFailure?: ViberHealthStatus;
  recoveryError?: Error;
  rollbackError?: Error;
  callbackUrl?: string;
  accountResponse?: () => Promise<Response>;
  webhookResponse?: () => Promise<Response>;
}

const createCreationHarness = (
  t: TestContext,
  options: CreationOptions = {},
) => {
  const kind = options.kind ?? 'viber';
  const events: string[] = [];
  const inbox = { _id: INBOX_ID, kind };
  const inboxes = new Map<string, typeof inbox>();
  const connections = new Map<string, SavedConnection>();
  if (options.duplicateBot) {
    inboxes.set('existing-inbox', { _id: 'existing-inbox', kind: 'viber' });
    connections.set('existing-inbox', {
      _id: 'existing-viber',
      inboxId: 'existing-inbox',
      botId: BOT_ID,
      token: 'existing-token',
      healthStatus: 'healthy',
      error: '',
    });
  }
  const forbidden = t.mock.fn(() => {
    throw new Error(
      'Creation must not delete provider records or call unrelated services',
    );
  });
  const checkPermission = t.mock.fn(async (action: string) => {
    ok(['integrationsAdd', 'integrationsEdit'].includes(action));
    events.push(`permission:${action}`);
  });
  const createInbox = t.mock.fn(async (_doc: unknown, userId: string) => {
    strictEqual(userId, 'user-test');
    events.push('save-inbox');
    inboxes.set(INBOX_ID, inbox);
    return inbox;
  });
  const deleteInbox = t.mock.fn(async (selector: unknown) => {
    deepStrictEqual(selector, { _id: INBOX_ID });
    events.push('rollback-inbox');
    if (options.rollbackError) throw options.rollbackError;
    return { deletedCount: Number(inboxes.delete(INBOX_ID)) };
  });
  const inboxExists = t.mock.fn(async (selector: unknown) => {
    deepStrictEqual(selector, { _id: INBOX_ID });
    return inboxes.has(INBOX_ID) ? { _id: INBOX_ID } : null;
  });
  const connectionExists = t.mock.fn(
    async (
      selector:
        | { inboxId: string }
        | { $or: ({ inboxId: string } | { botId: string })[] },
    ) => {
      if ('inboxId' in selector) {
        deepStrictEqual(selector, { inboxId: INBOX_ID });
        events.push('recovery-lookup');
        if (options.recoveryError) throw options.recoveryError;
        const saved = connections.get(INBOX_ID);
        return saved ? { _id: saved._id } : null;
      }
      deepStrictEqual(selector, {
        $or: [{ inboxId: INBOX_ID }, { botId: BOT_ID }],
      });
      const saved = [...connections.values()].find(
        (record) => record.inboxId === INBOX_ID || record.botId === BOT_ID,
      );
      return saved ? { _id: saved._id } : null;
    },
  );
  const createConnection = t.mock.fn(async (doc: unknown) => {
    deepStrictEqual(doc, {
      inboxId: INBOX_ID,
      botId: BOT_ID,
      name: 'Test bot',
      token: TOKEN,
    });
    if (options.saveFailure === 'before')
      throw new Error('Connection write failed');
    events.push('save-viber');
    // Schema defaults are covered separately with real Mongoose.
    const record: SavedConnection = {
      _id: 'viber-test',
      inboxId: INBOX_ID,
      botId: BOT_ID,
      token: TOKEN,
      healthStatus: 'pending',
      error: '',
    };
    connections.set(INBOX_ID, record);
    if (options.saveFailure === 'after')
      throw new Error('Connection write acknowledgement lost');
    return record;
  });
  const select = t.mock.fn(async (projection: string) => {
    strictEqual(projection, '+token');
    return connections.get(INBOX_ID) ?? null;
  });
  const findConnection = t.mock.fn((selector: unknown) => {
    deepStrictEqual(selector, { inboxId: INBOX_ID });
    return { select };
  });
  const updateHealth = t.mock.fn(
    async (
      selector: unknown,
      update: { $set: { healthStatus: ViberHealthStatus; error: string } },
      config: unknown,
    ) => {
      deepStrictEqual(selector, { _id: 'viber-test', inboxId: INBOX_ID });
      deepStrictEqual(config, { runValidators: true });
      const record = connections.get(INBOX_ID);
      ok(record);
      events.push(`health:${update.$set.healthStatus}`);
      if (options.healthFailure === update.$set.healthStatus)
        throw new Error('Health write failed');
      Object.assign(record, update.$set);
      return { matchedCount: 1 };
    },
  );
  const models = {
    Integrations: {
      exists: inboxExists,
      createExternalIntegration: createInbox,
      deleteOne: deleteInbox,
    },
    ViberIntegrations: {
      exists: connectionExists,
      create: createConnection,
      findOne: findConnection,
      updateOne: updateHealth,
      deleteOne: forbidden,
    },
    Channels: {
      findOne: async (selector: unknown) => {
        deepStrictEqual(selector, { _id: 'channel-test' });
        return { _id: 'channel-test', scope: 'team' };
      },
    },
  };
  const generateModels = t.mock.fn(async (subdomain: string) => {
    strictEqual(subdomain, SUBDOMAIN);
    return models;
  });
  const getEnv = t.mock.fn(
    ({ name, subdomain }: { name: string; subdomain: string }) => {
      strictEqual(subdomain, SUBDOMAIN);
      return name === 'VIBER_RECEIVE_URL'
        ? options.callbackUrl ?? RECEIVE_URL
        : '';
    },
  );
  const accountRequest = t.mock.fn(async () => {
    events.push('account-request');
    return options.accountResponse
      ? options.accountResponse()
      : new Response(
          JSON.stringify({ status: 0, id: BOT_ID, name: 'Test bot' }),
        );
  });
  const webhookRequest = t.mock.fn(async () => {
    events.push('webhook-request');
    ok(inboxes.has(INBOX_ID));
    const saved = connections.get(INBOX_ID);
    ok(saved);
    strictEqual(saved.token, TOKEN);
    strictEqual(saved.healthStatus, 'pending');
    return options.webhookResponse
      ? options.webhookResponse()
      : new Response('{"status":0}');
  });
  t.mock.method(
    globalThis,
    'fetch',
    async (url: unknown, init?: RequestInit) => {
      ok(init);
      strictEqual(new Headers(init.headers).get('X-Viber-Auth-Token'), TOKEN);
      strictEqual(init.method, 'POST');
      if (url === 'https://chatapi.viber.com/pa/get_account_info') {
        strictEqual(init.body, '{}');
        return accountRequest();
      }
      strictEqual(url, 'https://chatapi.viber.com/pa/set_webhook');
      strictEqual(init.redirect, 'error');
      deepStrictEqual(JSON.parse(String(init.body)), {
        url: `${RECEIVE_URL}/${INBOX_ID}`,
        send_name: true,
        send_photo: false,
      });
      return webhookRequest();
    },
  );
  loadViberHelpers(t, {
    sharedUtils: {
      getEnv,
      markResolvers: () => undefined,
      sendTRPCMessage: forbidden,
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
  t.after(() => {
    for (const [filename, original] of originals) {
      if (original) require.cache[filename] = original;
      else delete require.cache[filename];
    }
    strictEqual(forbidden.mock.callCount(), 0);
  });
  const siblingCreate = t.mock.fn(async () => ({
    status: 'error',
    errorMessage: 'Sibling setup failed',
  }));
  for (const provider of [
    'call',
    'mail',
    'facebook',
    'instagram',
    'discord',
    'callpro',
  ]) {
    const filename = rememberModule(`@/integrations/${provider}/messageBroker`);
    const replacement = new Module(filename);
    replacement.filename = filename;
    replacement.loaded = true;
    replacement.exports = { [`${provider}CreateIntegrations`]: siblingCreate };
    require.cache[filename] = replacement;
  }
  delete require.cache[rememberModule('../messageBroker')];
  delete require.cache[
    rememberModule('@/inbox/graphql/resolvers/mutations/integrations')
  ];
  const {
    integrationMutations,
  }: typeof import('@/inbox/graphql/resolvers/mutations/integrations') = require('@/inbox/graphql/resolvers/mutations/integrations');
  const context = {
    models,
    subdomain: SUBDOMAIN,
    user: { _id: 'user-test' },
    checkPermission,
  };
  const create = async (
    data: Record<string, unknown> = { token: TOKEN },
  ): Promise<unknown> =>
    Reflect.apply(
      integrationMutations.integrationsCreateExternalIntegration,
      undefined,
      [
        null,
        { name: 'Test inbox', kind, channelId: 'channel-test', data },
        context,
      ],
    );
  const repair = async (): Promise<unknown> =>
    Reflect.apply(integrationMutations.integrationsRepair, undefined, [
      null,
      { _id: INBOX_ID, kind },
      context,
    ]);
  return {
    create,
    repair,
    inbox,
    inboxes,
    connections,
    events,
    createInbox,
    deleteInbox,
    connectionExists,
    createConnection,
    accountRequest,
    webhookRequest,
    updateHealth,
    siblingCreate,
  };
};

test('creation saves both records before registration and waits for acknowledgement and healthy state', async (t) => {
  let finish: (response: Response) => void = () => {
    throw new Error('Response promise not initialized');
  };
  let markStarted: () => void = () => {
    throw new Error('Start promise not initialized');
  };
  const response = new Promise<Response>((resolve) => {
    finish = resolve;
  });
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  const harness = createCreationHarness(t, {
    webhookResponse: async () => {
      markStarted();
      return response;
    },
  });
  let finished = false;
  const result = harness.create().then((value) => {
    finished = true;
    return value;
  });

  await started;
  strictEqual(finished, false);
  strictEqual(harness.connections.get(INBOX_ID)?.healthStatus, 'pending');
  finish(new Response('{"status":0}'));
  strictEqual(await result, harness.inbox);
  deepStrictEqual(harness.events, [
    'permission:integrationsAdd',
    'save-inbox',
    'account-request',
    'save-viber',
    'health:pending',
    'webhook-request',
    'health:healthy',
  ]);
  strictEqual(harness.connections.get(INBOX_ID)?.healthStatus, 'healthy');
  strictEqual(harness.deleteInbox.mock.callCount(), 0);
});

test('invalid settings or a rejected token roll back only the new common inbox', async (t) => {
  await t.test('blank token', async (subtest) => {
    const harness = createCreationHarness(subtest);
    await rejects(harness.create({ token: '   ' }), {
      message: 'Viber bot token is required',
    });
    strictEqual(harness.accountRequest.mock.callCount(), 0);
    strictEqual(harness.inboxes.has(INBOX_ID), false);
    strictEqual(harness.connections.size, 0);
    strictEqual(harness.deleteInbox.mock.callCount(), 1);
  });
  await t.test('provider rejects token', async (subtest) => {
    const harness = createCreationHarness(subtest, {
      accountResponse: async () => new Response('', { status: 401 }),
    });
    await rejects(harness.create(), {
      message: 'Viber account info request failed (HTTP 401)',
    });
    strictEqual(harness.inboxes.has(INBOX_ID), false);
    strictEqual(harness.connections.size, 0);
    strictEqual(harness.webhookRequest.mock.callCount(), 0);
    strictEqual(harness.deleteInbox.mock.callCount(), 1);
  });
});

test('a duplicate bot rolls back the new inbox without retaining it for another connection', async (t) => {
  const harness = createCreationHarness(t, { duplicateBot: true });
  const existing = { ...harness.connections.get('existing-inbox') };

  await rejects(harness.create(), {
    message: 'Viber integration already exists',
  });
  strictEqual(harness.inboxes.has(INBOX_ID), false);
  strictEqual(harness.inboxes.has('existing-inbox'), true);
  strictEqual(harness.connections.size, 1);
  deepStrictEqual(harness.connections.get('existing-inbox'), existing);
  strictEqual(harness.webhookRequest.mock.callCount(), 0);
});

test('a failed connection write before persistence permits common-inbox rollback', async (t) => {
  const harness = createCreationHarness(t, { saveFailure: 'before' });

  await rejects(harness.create(), { message: 'Connection write failed' });
  strictEqual(harness.inboxes.size, 0);
  strictEqual(harness.connections.size, 0);
  strictEqual(harness.webhookRequest.mock.callCount(), 0);
  strictEqual(harness.deleteInbox.mock.callCount(), 1);
});

test('a lost connection-write acknowledgement retains both records and Repair completes setup', async (t) => {
  const harness = createCreationHarness(t, { saveFailure: 'after' });

  await rejects(harness.create(), {
    message: RECOVERY_MESSAGE,
    extensions: { code: 'VIBER_SETUP_INCOMPLETE', integrationId: INBOX_ID },
  });
  const saved = harness.connections.get(INBOX_ID);
  ok(saved);
  strictEqual(saved.healthStatus, 'pending');
  strictEqual(harness.webhookRequest.mock.callCount(), 0);
  strictEqual(harness.deleteInbox.mock.callCount(), 0);
  strictEqual(harness.inboxes.has(INBOX_ID), true);

  strictEqual(await harness.repair(), true);
  strictEqual(harness.connections.get(INBOX_ID), saved);
  strictEqual(saved.healthStatus, 'healthy');
  strictEqual(harness.createInbox.mock.callCount(), 1);
  strictEqual(harness.createConnection.mock.callCount(), 1);
  strictEqual(harness.accountRequest.mock.callCount(), 1);
});

test('failed or ambiguous webhook registration retains the connection for Repair', async (t) => {
  for (const failure of ['provider refusal', 'response lost']) {
    await t.test(failure, async (subtest) => {
      let failRequest = true;
      const harness = createCreationHarness(subtest, {
        webhookResponse: async () => {
          if (!failRequest) return new Response('{"status":0}');
          if (failure === 'response lost')
            throw new Error(`Lost response with private details: ${TOKEN}`);
          return new Response('{"status":1}');
        },
      });

      await rejects(harness.create(), { message: RECOVERY_MESSAGE });
      const saved = harness.connections.get(INBOX_ID);
      ok(saved);
      strictEqual(harness.inboxes.has(INBOX_ID), true);
      strictEqual(saved.healthStatus, 'unHealthy');
      strictEqual(saved.error, REGISTRATION_ERROR);
      strictEqual(harness.deleteInbox.mock.callCount(), 0);
      failRequest = false;

      strictEqual(await harness.repair(), true);
      strictEqual(harness.connections.get(INBOX_ID), saved);
      strictEqual(saved.token, TOKEN);
      strictEqual(saved.healthStatus, 'healthy');
      strictEqual(saved.error, '');
      strictEqual(harness.createInbox.mock.callCount(), 1);
      strictEqual(harness.createConnection.mock.callCount(), 1);
      strictEqual(harness.accountRequest.mock.callCount(), 1);
      strictEqual(harness.webhookRequest.mock.callCount(), 2);
    });
  }
});

test('invalid callback configuration preserves the saved connection without a registration request', async (t) => {
  const harness = createCreationHarness(t, {
    callbackUrl: 'http://invalid.example/viber/receive',
  });

  await rejects(harness.create(), { message: RECOVERY_MESSAGE });
  strictEqual(harness.inboxes.has(INBOX_ID), true);
  strictEqual(harness.connections.get(INBOX_ID)?.healthStatus, 'pending');
  strictEqual(harness.webhookRequest.mock.callCount(), 0);
  strictEqual(harness.deleteInbox.mock.callCount(), 0);
});

test('failure to save final health does not roll back an acknowledged provider registration', async (t) => {
  const harness = createCreationHarness(t, { healthFailure: 'healthy' });

  await rejects(harness.create(), { message: RECOVERY_MESSAGE });
  strictEqual(harness.inboxes.has(INBOX_ID), true);
  strictEqual(harness.connections.get(INBOX_ID)?.healthStatus, 'pending');
  strictEqual(harness.webhookRequest.mock.callCount(), 1);
  strictEqual(harness.deleteInbox.mock.callCount(), 0);
});

test('a failed recovery lookup prevents speculative rollback', async (t) => {
  const failure = new Error('Recovery lookup failed');
  const harness = createCreationHarness(t, { recoveryError: failure });

  await rejects(
    harness.create({ token: '' }),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.inboxes.has(INBOX_ID), true);
  strictEqual(harness.deleteInbox.mock.callCount(), 0);
  strictEqual(harness.accountRequest.mock.callCount(), 0);
});

test('a rollback failure propagates instead of pretending the common inbox was removed', async (t) => {
  const failure = new Error('Rollback failed');
  const harness = createCreationHarness(t, { rollbackError: failure });

  await rejects(
    harness.create({ token: '' }),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.inboxes.has(INBOX_ID), true);
  strictEqual(harness.connections.size, 0);
  strictEqual(harness.deleteInbox.mock.callCount(), 1);
});

test('a sibling creation failure keeps its existing rollback without Viber recovery lookups', async (t) => {
  const harness = createCreationHarness(t, { kind: 'facebook-messenger' });

  await rejects(harness.create(), { message: 'Sibling setup failed' });
  strictEqual(harness.inboxes.size, 0);
  strictEqual(harness.siblingCreate.mock.callCount(), 1);
  strictEqual(harness.connectionExists.mock.callCount(), 0);
  strictEqual(harness.accountRequest.mock.callCount(), 0);
  strictEqual(harness.deleteInbox.mock.callCount(), 1);
});
