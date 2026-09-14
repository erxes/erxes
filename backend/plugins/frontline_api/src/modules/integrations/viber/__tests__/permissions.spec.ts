import { test } from 'node:test';
import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import { Module } from 'node:module';
import type { TestContext } from './helperHarness';

const SUBDOMAIN = 'tenant-test';
const INBOX_ID = 'inbox-test';
const CHANNEL_ID = 'channel-test';
const USER_ID = 'user-test';

interface PermissionOptions {
  kind?: string;
  channelId?: string;
  loggedOut?: boolean;
  authorize?: (action: string) => Promise<void>;
}

const createPermissionHarness = (
  t: TestContext,
  options: PermissionOptions = {},
) => {
  const kind = options.kind ?? 'viber';
  const events: string[] = [];
  const integration = Object.freeze({ _id: INBOX_ID, kind });
  const forbidden = t.mock.fn(() => {
    throw new Error('Unexpected write or external call');
  });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => forbidden());
  const checkPermission = t.mock.fn(async (action: string) => {
    events.push(`permission:${action}`);
    await options.authorize?.(action);
  });
  const findChannel = t.mock.fn(async (selector: unknown) => {
    deepStrictEqual(selector, { _id: CHANNEL_ID });
    events.push('channel');
    return { _id: CHANNEL_ID, scope: 'team' };
  });
  const createCommon = t.mock.fn(async (_doc: unknown, userId: string) => {
    strictEqual(userId, USER_ID);
    events.push('create-common');
    return integration;
  });
  const readCommon = t.mock.fn(async (selector: unknown) => {
    deepStrictEqual(selector, { _id: INBOX_ID });
    events.push('read-common');
    return integration;
  });
  const removeCommon = t.mock.fn(async (id: string) => {
    strictEqual(id, INBOX_ID);
    events.push('remove-common');
  });
  const providerCreate = t.mock.fn(async (input: unknown) => {
    deepStrictEqual(input, {
      subdomain: SUBDOMAIN,
      data: {
        accountId: undefined,
        kind,
        integrationId: INBOX_ID,
        data: JSON.stringify({ token: 'test-viber-token' }),
      },
    });
    events.push('create-viber');
    return { status: 'success' };
  });
  const providerRemove = t.mock.fn(async (input: unknown) => {
    deepStrictEqual(input, {
      subdomain: SUBDOMAIN,
      data: { integrationId: INBOX_ID },
    });
    events.push('remove-viber');
    return INBOX_ID;
  });
  const siblingCreate = t.mock.fn(async () => ({ status: 'success' }));
  const siblingRemove = t.mock.fn(async () => INBOX_ID);
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

  replaceModule('erxes-api-shared/utils', {
    markResolvers: () => undefined,
    getUniqueValue: forbidden,
    sendTRPCMessage: forbidden,
  });
  replaceModule('@/integrations/viber/messageBroker', {
    viberCreateIntegration: providerCreate,
    viberRemoveIntegration: providerRemove,
  });
  replaceModule('@/channel/utils', {});
  replaceModule('@/integrations/viber/access', {});
  for (const provider of ['facebook', 'instagram', 'discord']) {
    replaceModule(`@/integrations/${provider}/messageBroker`, {
      [`${provider}CreateIntegrations`]: siblingCreate,
      [`${provider}RemoveIntegrations`]: siblingRemove,
    });
  }
  for (const provider of ['call', 'mail', 'callpro']) {
    replaceModule(`@/integrations/${provider}/messageBroker`, {});
  }
  delete require.cache[
    rememberModule('@/inbox/graphql/resolvers/mutations/integrations')
  ];
  const {
    integrationMutations,
  }: typeof import('@/inbox/graphql/resolvers/mutations/integrations') = require('@/inbox/graphql/resolvers/mutations/integrations');
  const context = {
    subdomain: SUBDOMAIN,
    user: options.loggedOut ? undefined : { _id: USER_ID },
    checkPermission,
    models: {
      Channels: { findOne: findChannel, getPersonalChannel: forbidden },
      Integrations: {
        createExternalIntegration: createCommon,
        getIntegration: readCommon,
        removeIntegration: removeCommon,
        deleteOne: forbidden,
      },
    },
  };
  const create = async (): Promise<unknown> =>
    Reflect.apply(
      integrationMutations.integrationsCreateExternalIntegration,
      undefined,
      [
        null,
        {
          name: 'Test inbox',
          kind,
          channelId: options.channelId ?? CHANNEL_ID,
          data: { token: 'test-viber-token' },
        },
        context,
      ],
    );
  const remove = async (): Promise<unknown> =>
    Reflect.apply(integrationMutations.integrationsRemove, undefined, [
      null,
      { _id: INBOX_ID },
      context,
    ]);

  return {
    create,
    remove,
    events,
    integration,
    checkPermission,
    findChannel,
    createCommon,
    removeCommon,
    providerCreate,
    providerRemove,
    siblingCreate,
    siblingRemove,
  };
};

test('denied Viber creation stops before channel lookup, personal-channel allocation, or writes', async (t) => {
  for (const channelId of [CHANNEL_ID, '']) {
    await t.test(channelId || 'personal-channel', async (subtest) => {
      const failure = new Error('Permission required');
      const harness = createPermissionHarness(subtest, {
        channelId,
        authorize: async () => {
          throw failure;
        },
      });

      await rejects(harness.create(), (error: unknown) => error === failure);
      deepStrictEqual(harness.events, ['permission:integrationsAdd']);
    });
  }
});

test('a rejected login check propagates before the creation resolver dereferences the user', async (t) => {
  const failure = new Error('Login required');
  const harness = createPermissionHarness(t, {
    loggedOut: true,
    authorize: async () => {
      throw failure;
    },
  });

  await rejects(harness.create(), (error: unknown) => error === failure);
  deepStrictEqual(harness.events, ['permission:integrationsAdd']);
});

test('denied Viber removal reads the stored kind but never calls cleanup', async (t) => {
  const failure = new Error('Permission required');
  const harness = createPermissionHarness(t, {
    kind: 'viber-bot',
    authorize: async () => {
      throw failure;
    },
  });

  await rejects(harness.remove(), (error: unknown) => error === failure);
  deepStrictEqual(harness.events, [
    'read-common',
    'permission:integrationsRemove',
  ]);
});

test('authorized Viber kinds keep the existing create and removal flow after the matching permission', async (t) => {
  for (const kind of ['viber', 'viber-bot']) {
    await t.test(kind, async (subtest) => {
      const harness = createPermissionHarness(subtest, { kind });

      strictEqual(await harness.create(), harness.integration);
      strictEqual(await harness.remove(), undefined);
      deepStrictEqual(harness.events, [
        'permission:integrationsAdd',
        'channel',
        'create-common',
        'create-viber',
        'read-common',
        'permission:integrationsRemove',
        'remove-viber',
        'remove-common',
      ]);
    });
  }
});

test('both mutations await permission before starting side effects', async (t) => {
  for (const operation of ['create', 'remove'] as const) {
    await t.test(operation, async (subtest) => {
      let grant: () => void = () => {
        throw new Error('Permission promise not initialized');
      };
      let markStarted: () => void = () => {
        throw new Error('Start promise not initialized');
      };
      const permission = new Promise<void>((resolve) => {
        grant = resolve;
      });
      const started = new Promise<void>((resolve) => {
        markStarted = resolve;
      });
      const harness = createPermissionHarness(subtest, {
        authorize: async () => {
          markStarted();
          await permission;
        },
      });
      const result = harness[operation]();

      await started;
      strictEqual(harness.findChannel.mock.callCount(), 0);
      strictEqual(harness.createCommon.mock.callCount(), 0);
      strictEqual(harness.removeCommon.mock.callCount(), 0);
      strictEqual(harness.providerCreate.mock.callCount(), 0);
      strictEqual(harness.providerRemove.mock.callCount(), 0);
      grant();
      await result;
      strictEqual(harness.checkPermission.mock.callCount(), 1);
      strictEqual(
        operation === 'create'
          ? harness.providerCreate.mock.callCount()
          : harness.providerRemove.mock.callCount(),
        1,
      );
    });
  }
});

test('existing sibling branches do not acquire Viber permission checks', async (t) => {
  for (const kind of ['facebook-messenger', 'discord']) {
    await t.test(kind, async (subtest) => {
      const harness = createPermissionHarness(subtest, {
        kind,
        authorize: async () => {
          throw new Error('Unexpected permission check');
        },
      });

      strictEqual(await harness.create(), harness.integration);
      await harness.remove();
      strictEqual(harness.checkPermission.mock.callCount(), 0);
      strictEqual(harness.providerCreate.mock.callCount(), 0);
      strictEqual(harness.providerRemove.mock.callCount(), 0);
      strictEqual(harness.siblingCreate.mock.callCount(), 1);
      strictEqual(harness.siblingRemove.mock.callCount(), 1);
    });
  }
});
