import { test } from 'node:test';
import {
  deepStrictEqual,
  notStrictEqual,
  ok,
  rejects,
  strictEqual,
} from 'node:assert';
import type { IViberConversation } from '../@types/conversation';
import type { IConversation } from '@/inbox/@types/conversations';
import { loadViberHelpers, type TestContext } from './helperHarness';

type MappingSelector = Pick<IViberConversation, 'inboxId' | 'userId'>;
type Mapping = IViberConversation & { _id: string };
type Conversation = Pick<
  IConversation,
  'integrationId' | 'customerId' | 'status'
> & {
  _id: string;
};
type ConversationSelector = Pick<Conversation, '_id'>;
type RetrySelector = Required<
  Pick<Conversation, '_id' | 'integrationId' | 'customerId'>
>;

interface TestModels {
  ViberConversations: {
    findOne(selector: MappingSelector): Promise<Mapping | null>;
    create(doc: IViberConversation): Promise<Mapping>;
  };
  Conversations: {
    findOne(selector: ConversationSelector): Promise<Conversation | null>;
    exists(selector: RetrySelector): Promise<ConversationSelector | null>;
  };
}

interface InboxRequest {
  action: 'create-or-update-conversation';
  payload: string;
}

type InboxResult =
  | { status: 'success'; data?: unknown }
  | { status: 'error'; errorMessage: string };
type InboxReceiver = (
  subdomain: string,
  request: InboxRequest,
) => Promise<InboxResult>;

interface HarnessOptions {
  findMapping?: TestModels['ViberConversations']['findOne'];
  createMapping?: TestModels['ViberConversations']['create'];
  findConversation?: TestModels['Conversations']['findOne'];
  conversationExists?: TestModels['Conversations']['exists'];
  receiveInboxMessage?: InboxReceiver;
  generateModels?: (subdomain: string) => Promise<TestModels>;
}

const INPUT = {
  subdomain: 'tenant-test',
  inboxId: 'inbox-test',
  userId: 'viber-user-test',
  customerId: 'core-customer-test',
  content: '<p>Hello</p>',
};
const SELECTOR: MappingSelector = {
  inboxId: INPUT.inboxId,
  userId: INPUT.userId,
};
const MAPPING: Mapping = {
  ...SELECTOR,
  _id: 'mapping-test',
  conversationId: 'frontline-conversation-test',
};
const CONVERSATION: Conversation = {
  _id: MAPPING.conversationId,
  integrationId: INPUT.inboxId,
  customerId: INPUT.customerId,
  status: 'closed',
};
const RETRY_SELECTOR: RetrySelector = {
  _id: MAPPING.conversationId,
  integrationId: INPUT.inboxId,
  customerId: INPUT.customerId,
};

const requestedConversationId = (request: InboxRequest): string => {
  const payload: unknown = JSON.parse(request.payload);
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('conversationId' in payload) ||
    typeof payload.conversationId !== 'string'
  ) {
    throw new Error('Test received an invalid conversation payload');
  }

  return payload.conversationId;
};

const createConversationHarness = (
  t: TestContext,
  options: HarnessOptions = {},
) => {
  const findMapping = t.mock.fn<TestModels['ViberConversations']['findOne']>(
    options.findMapping ?? (async () => MAPPING),
  );
  const createMapping = t.mock.fn<TestModels['ViberConversations']['create']>(
    options.createMapping ??
      (async (doc) => ({ ...doc, _id: 'new-mapping-test' })),
  );
  const findConversation = t.mock.fn<TestModels['Conversations']['findOne']>(
    options.findConversation ?? (async () => null),
  );
  const conversationExists = t.mock.fn<TestModels['Conversations']['exists']>(
    options.conversationExists ?? (async () => null),
  );
  const receiveInboxMessage = t.mock.fn<InboxReceiver>(
    options.receiveInboxMessage ??
      (async (_subdomain, request) => ({
        status: 'success',
        data: { _id: requestedConversationId(request) },
      })),
  );
  const generateModels = t.mock.fn(async (subdomain: string) => {
    if (options.generateModels) {
      return options.generateModels(subdomain);
    }

    return {
      ViberConversations: { findOne: findMapping, create: createMapping },
      Conversations: { findOne: findConversation, exists: conversationExists },
    };
  });
  const { getOrCreateViberConversation } = loadViberHelpers(t, {
    connectionResolvers: { generateModels },
    inboxReceiver: { receiveInboxMessage },
    sharedUtils: {
      sendTRPCMessage: async () => {
        throw new Error(
          'Conversation resolution must not create Core customers',
        );
      },
    },
  });

  const run = (overrides: Partial<typeof INPUT> = {}) => {
    const input = { ...INPUT, ...overrides };
    return getOrCreateViberConversation(
      input.subdomain,
      input.inboxId,
      input.userId,
      input.customerId,
      input.content,
    );
  };

  return {
    run,
    findMapping,
    createMapping,
    findConversation,
    conversationExists,
    receiveInboxMessage,
    generateModels,
  };
};

for (const [field, message] of [
  ['inboxId', 'Inbox integration id is required'],
  ['userId', 'Viber user id is required'],
  ['customerId', 'Core customer id is required'],
] as const) {
  test(`rejects blank ${field} before accessing models`, async (t) => {
    const harness = createConversationHarness(t);

    for (const value of ['', ' \t\n']) {
      await rejects(harness.run({ [field]: value }), { message });
    }

    strictEqual(harness.generateModels.mock.callCount(), 0);
    strictEqual(harness.receiveInboxMessage.mock.callCount(), 0);
  });
}

test('reuses the mapped id and delegates a closed conversation to the common action', async (t) => {
  const harness = createConversationHarness(t, {
    findConversation: async () => CONVERSATION,
  });

  strictEqual(await harness.run(), MAPPING.conversationId);
  deepStrictEqual(harness.generateModels.mock.calls[0].arguments, [
    INPUT.subdomain,
  ]);
  deepStrictEqual(harness.findMapping.mock.calls[0].arguments, [SELECTOR]);
  deepStrictEqual(harness.findConversation.mock.calls[0].arguments, [
    { _id: MAPPING.conversationId },
  ]);
  const [subdomain, request] =
    harness.receiveInboxMessage.mock.calls[0].arguments;
  strictEqual(subdomain, INPUT.subdomain);
  strictEqual(request.action, 'create-or-update-conversation');
  const payload: unknown = JSON.parse(request.payload);
  deepStrictEqual(payload, {
    conversationId: MAPPING.conversationId,
    integrationId: INPUT.inboxId,
    customerId: INPUT.customerId,
    content: INPUT.content,
  });
  strictEqual(harness.createMapping.mock.callCount(), 0);
});

test('reserves a distinct conversation id before asking Frontline to create the thread', async (t) => {
  const order: string[] = [];
  const harness = createConversationHarness(t, {
    findMapping: async () => null,
    createMapping: async (doc) => {
      order.push('mapping');
      return { ...doc, _id: 'new-mapping-test' };
    },
    findConversation: async () => {
      order.push('conversation lookup');
      return null;
    },
    receiveInboxMessage: async (_subdomain, request) => {
      order.push('sync');
      return {
        status: 'success',
        data: { _id: requestedConversationId(request) },
      };
    },
  });

  const conversationId = await harness.run();
  ok(conversationId.trim());
  notStrictEqual(conversationId, 'new-mapping-test');
  deepStrictEqual(harness.createMapping.mock.calls[0].arguments, [
    { ...SELECTOR, conversationId },
  ]);
  deepStrictEqual(order, ['mapping', 'conversation lookup', 'sync']);
});

test('does not reuse the same sender mapping from a different inbox', async (t) => {
  const harness = createConversationHarness(t, {
    findMapping: async (selector) =>
      selector.inboxId === INPUT.inboxId ? MAPPING : null,
  });

  const conversationId = await harness.run({ inboxId: 'another-inbox' });
  notStrictEqual(conversationId, MAPPING.conversationId);
  deepStrictEqual(harness.createMapping.mock.calls[0].arguments, [
    { inboxId: 'another-inbox', userId: INPUT.userId, conversationId },
  ]);
});

test('resolves identical inbox and sender ids through each supplied tenant model container', async (t) => {
  const harness = createConversationHarness(t, {
    generateModels: async (subdomain) => ({
      ViberConversations: {
        findOne: async () => ({
          ...MAPPING,
          conversationId: `${subdomain}-thread`,
        }),
        create: async () => {
          throw new Error('A mapped sender must not create another mapping');
        },
      },
      Conversations: { findOne: async () => null, exists: async () => null },
    }),
  });

  strictEqual(
    await harness.run({ subdomain: 'tenant-one' }),
    'tenant-one-thread',
  );
  strictEqual(
    await harness.run({ subdomain: 'tenant-two' }),
    'tenant-two-thread',
  );
  deepStrictEqual(
    harness.receiveInboxMessage.mock.calls.map(
      ({ arguments: args }) => args[0],
    ),
    ['tenant-one', 'tenant-two'],
  );
});

test('propagates tenant-model and mapping lookup failures without creating a mapping', async (t) => {
  const failure = new Error('Database unavailable');
  for (const [name, options] of [
    [
      'tenant model loading',
      {
        generateModels: async () => {
          throw failure;
        },
      },
    ],
    [
      'mapping lookup',
      {
        findMapping: async () => {
          throw failure;
        },
      },
    ],
  ] as const) {
    await t.test(name, async (child) => {
      const harness = createConversationHarness(child, options);
      await rejects(harness.run(), (error: unknown) => error === failure);
      strictEqual(harness.createMapping.mock.callCount(), 0);
      strictEqual(harness.receiveInboxMessage.mock.callCount(), 0);
    });
  }
});

test('propagates non-duplicate mapping failures instead of treating them as races', async (t) => {
  let failure: unknown;
  const harness = createConversationHarness(t, {
    findMapping: async () => null,
    createMapping: async () => {
      throw failure;
    },
  });

  for (failure of [
    new Error('Write failed'),
    { code: 123 },
    { code: '11000' },
    null,
    undefined,
    'failed',
  ]) {
    const count = harness.findMapping.mock.callCount();
    await rejects(harness.run(), (error: unknown) => error === failure);
    strictEqual(harness.findMapping.mock.callCount(), count + 1);
  }
  strictEqual(harness.receiveInboxMessage.mock.callCount(), 0);
});

test('uses the winning mapping after a duplicate mapping write', async (t) => {
  let lookups = 0;
  const harness = createConversationHarness(t, {
    findMapping: async () => (++lookups === 1 ? null : MAPPING),
    createMapping: async () => {
      throw { code: 11000 };
    },
  });

  strictEqual(await harness.run(), MAPPING.conversationId);
  deepStrictEqual(harness.findMapping.mock.calls[1].arguments, [SELECTOR]);
  strictEqual(
    requestedConversationId(
      harness.receiveInboxMessage.mock.calls[0].arguments[1],
    ),
    MAPPING.conversationId,
  );
});

test('rethrows a duplicate mapping error when no winner can be found', async (t) => {
  const failure = { code: 11000 };
  const harness = createConversationHarness(t, {
    findMapping: async () => null,
    createMapping: async () => {
      throw failure;
    },
  });

  await rejects(harness.run(), (error: unknown) => error === failure);
  strictEqual(harness.findMapping.mock.callCount(), 2);
  strictEqual(harness.receiveInboxMessage.mock.callCount(), 0);
});

test('propagates a failed mapping recovery lookup', async (t) => {
  const failure = new Error('Recovery lookup failed');
  let lookups = 0;
  const harness = createConversationHarness(t, {
    findMapping: async () => {
      if (++lookups === 1) return null;
      throw failure;
    },
    createMapping: async () => {
      throw { code: 11000 };
    },
  });

  await rejects(harness.run(), (error: unknown) => error === failure);
  strictEqual(harness.receiveInboxMessage.mock.callCount(), 0);
});

test('rejects mismatched inbox or customer ownership before invoking the common action', async (t) => {
  for (const [name, conversation] of [
    ['another inbox', { ...CONVERSATION, integrationId: 'another-inbox' }],
    ['another customer', { ...CONVERSATION, customerId: 'another-customer' }],
    ['missing customer', { ...CONVERSATION, customerId: undefined }],
  ] as const) {
    await t.test(name, async (child) => {
      const harness = createConversationHarness(child, {
        findConversation: async () => conversation,
      });
      await rejects(harness.run(), {
        message: 'Viber conversation mapping does not match its owner',
      });
      strictEqual(harness.receiveInboxMessage.mock.callCount(), 0);
    });
  }
});

test('propagates conversation lookup failures without requesting an update', async (t) => {
  const failure = new Error('Conversation lookup failed');
  const harness = createConversationHarness(t, {
    findConversation: async () => {
      throw failure;
    },
  });

  await rejects(harness.run(), (error: unknown) => error === failure);
  strictEqual(harness.receiveInboxMessage.mock.callCount(), 0);
});

test('turns an unsuccessful common response into a rejected operation', async (t) => {
  const harness = createConversationHarness(t, {
    receiveInboxMessage: async () => ({
      status: 'error',
      errorMessage: 'Cannot save thread',
    }),
  });

  await rejects(harness.run(), { message: 'Cannot save thread' });
  strictEqual(harness.receiveInboxMessage.mock.callCount(), 1);
  strictEqual(harness.conversationExists.mock.callCount(), 0);
});

test('rejects malformed or mismatched successful response ids', async (t) => {
  let data: unknown;
  const harness = createConversationHarness(t, {
    receiveInboxMessage: async () => ({ status: 'success', data }),
  });

  for (data of [
    undefined,
    null,
    [],
    'thread',
    {},
    { _id: 42 },
    { _id: '' },
    { _id: MAPPING._id },
    { _id: 'another-thread' },
  ]) {
    await rejects(harness.run(), {
      message: 'Failed to resolve a Frontline conversation for Viber',
    });
  }
  strictEqual(harness.conversationExists.mock.callCount(), 0);
});

test('does not retry common failures that are not numeric duplicate-key errors', async (t) => {
  let failure: unknown;
  const harness = createConversationHarness(t, {
    receiveInboxMessage: async () => {
      throw failure;
    },
  });

  for (failure of [
    new Error('Sync failed'),
    { code: 123 },
    { code: '11000' },
    null,
    undefined,
  ]) {
    const count = harness.receiveInboxMessage.mock.callCount();
    await rejects(harness.run(), (error: unknown) => error === failure);
    strictEqual(harness.receiveInboxMessage.mock.callCount(), count + 1);
  }
  strictEqual(harness.conversationExists.mock.callCount(), 0);
});

test('retries a duplicate thread creation once using the same id and ownership', async (t) => {
  let calls = 0;
  const harness = createConversationHarness(t, {
    conversationExists: async () => ({ _id: MAPPING.conversationId }),
    receiveInboxMessage: async (_subdomain, request) => {
      if (++calls === 1) throw { code: 11000 };
      return {
        status: 'success',
        data: { _id: requestedConversationId(request) },
      };
    },
  });

  strictEqual(await harness.run(), MAPPING.conversationId);
  deepStrictEqual(harness.conversationExists.mock.calls[0].arguments, [
    RETRY_SELECTOR,
  ]);
  deepStrictEqual(
    harness.receiveInboxMessage.mock.calls[0].arguments,
    harness.receiveInboxMessage.mock.calls[1].arguments,
  );
  strictEqual(harness.findConversation.mock.callCount(), 2);
});

test('does not retry a duplicate thread error without an exact matching conversation', async (t) => {
  const failure = { code: 11000 };
  const harness = createConversationHarness(t, {
    receiveInboxMessage: async () => {
      throw failure;
    },
  });

  await rejects(harness.run(), (error: unknown) => error === failure);
  deepStrictEqual(harness.conversationExists.mock.calls[0].arguments, [
    RETRY_SELECTOR,
  ]);
  strictEqual(harness.receiveInboxMessage.mock.callCount(), 1);
});

test('propagates a failed retry eligibility lookup', async (t) => {
  const failure = new Error('Retry check failed');
  const harness = createConversationHarness(t, {
    receiveInboxMessage: async () => {
      throw { code: 11000 };
    },
    conversationExists: async () => {
      throw failure;
    },
  });

  await rejects(harness.run(), (error: unknown) => error === failure);
  strictEqual(harness.receiveInboxMessage.mock.callCount(), 1);
});

test('propagates a failed retry without starting an unbounded retry loop', async (t) => {
  const failure = { code: 11000 };
  const harness = createConversationHarness(t, {
    receiveInboxMessage: async () => {
      throw failure;
    },
    conversationExists: async () => ({ _id: MAPPING.conversationId }),
  });

  await rejects(harness.run(), (error: unknown) => error === failure);
  strictEqual(harness.receiveInboxMessage.mock.callCount(), 2);
  strictEqual(harness.conversationExists.mock.callCount(), 1);
});

test('rechecks ownership before retrying a thread update', async (t) => {
  let lookups = 0;
  const harness = createConversationHarness(t, {
    findConversation: async () =>
      ++lookups === 1
        ? null
        : { ...CONVERSATION, customerId: 'another-customer' },
    receiveInboxMessage: async () => {
      throw { code: 11000 };
    },
    conversationExists: async () => ({ _id: MAPPING.conversationId }),
  });

  await rejects(harness.run(), {
    message: 'Viber conversation mapping does not match its owner',
  });
  strictEqual(harness.receiveInboxMessage.mock.callCount(), 1);
});

test('keeps the reserved mapping id for a later attempt after thread creation fails', async (t) => {
  let storedMapping: Mapping | null = null;
  let calls = 0;
  const failure = new Error('Temporary thread failure');
  const harness = createConversationHarness(t, {
    findMapping: async () => storedMapping,
    createMapping: async (doc) => {
      storedMapping = { ...doc, _id: 'stored-mapping' };
      return storedMapping;
    },
    receiveInboxMessage: async (_subdomain, request) => {
      if (++calls === 1) throw failure;
      return {
        status: 'success',
        data: { _id: requestedConversationId(request) },
      };
    },
  });

  await rejects(harness.run(), (error: unknown) => error === failure);
  const conversationId = await harness.run();
  strictEqual(harness.createMapping.mock.callCount(), 1);
  strictEqual(
    harness.createMapping.mock.calls[0].arguments[0].conversationId,
    conversationId,
  );
  deepStrictEqual(
    harness.receiveInboxMessage.mock.calls[0].arguments,
    harness.receiveInboxMessage.mock.calls[1].arguments,
  );
});

test('concurrent first messages converge under mocked mapping and thread uniqueness', async (t) => {
  let releaseMappings: () => void = () => {
    throw new Error('Mapping barrier not initialized');
  };
  let releaseThreads: () => void = () => {
    throw new Error('Thread barrier not initialized');
  };
  const mappingsReady = new Promise<void>((resolve) => {
    releaseMappings = resolve;
  });
  const threadsReady = new Promise<void>((resolve) => {
    releaseThreads = resolve;
  });
  let mappingLookups = 0;
  let syncCalls = 0;
  let threadCreates = 0;
  let storedMapping: Mapping | null = null;
  let storedConversation: Conversation | null = null;
  const harness = createConversationHarness(t, {
    findMapping: async () => {
      if (++mappingLookups <= 2) {
        if (mappingLookups === 2) releaseMappings();
        await mappingsReady;
        return null;
      }
      return storedMapping;
    },
    createMapping: async (doc) => {
      if (storedMapping) throw { code: 11000 };
      storedMapping = { ...doc, _id: 'winning-mapping' };
      return storedMapping;
    },
    findConversation: async () => storedConversation,
    conversationExists: async (selector) => {
      if (
        storedConversation?._id === selector._id &&
        storedConversation.integrationId === selector.integrationId &&
        storedConversation.customerId === selector.customerId
      ) {
        return { _id: storedConversation._id };
      }
      return null;
    },
    receiveInboxMessage: async (_subdomain, request) => {
      const conversationId = requestedConversationId(request);
      if (++syncCalls <= 2) {
        if (syncCalls === 2) releaseThreads();
        await threadsReady;
        if (storedConversation) throw { code: 11000 };
        storedConversation = { ...CONVERSATION, _id: conversationId };
        threadCreates++;
      }
      return { status: 'success', data: { _id: conversationId } };
    },
  });

  const results = await Promise.all([harness.run(), harness.run()]);
  strictEqual(results[0], results[1]);
  strictEqual(harness.createMapping.mock.callCount(), 2);
  strictEqual(threadCreates, 1);
  strictEqual(harness.receiveInboxMessage.mock.callCount(), 3);
});
