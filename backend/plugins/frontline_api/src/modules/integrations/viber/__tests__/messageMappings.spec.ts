import { test } from 'node:test';
import {
  deepStrictEqual,
  notStrictEqual,
  ok,
  rejects,
  strictEqual,
} from 'node:assert';
import type { IViberMessage } from '../@types/message';
import { loadViberHelpers, type TestContext } from './helperHarness';

type MappingSelector = Pick<IViberMessage, 'inboxId' | 'messageToken'>;
type Mapping = IViberMessage & { _id: string };

interface MessageModel {
  findOne(selector: MappingSelector): Promise<Mapping | null>;
  create(doc: IViberMessage): Promise<Mapping>;
}

interface HarnessOptions {
  findOne?: MessageModel['findOne'];
  create?: MessageModel['create'];
  generateModels?: (
    subdomain: string,
  ) => Promise<{ ViberMessages: MessageModel }>;
}

const INPUT = {
  subdomain: 'tenant-test',
  inboxId: 'inbox-test',
  messageToken: '4912661846655238145',
};
const SELECTOR: MappingSelector = {
  inboxId: INPUT.inboxId,
  messageToken: INPUT.messageToken,
};
const MAPPING: Mapping = {
  ...SELECTOR,
  _id: 'viber-message-mapping-test',
  messageId: 'frontline-message-test',
};

const createMessageHarness = (t: TestContext, options: HarnessOptions = {}) => {
  const findOne = t.mock.fn<MessageModel['findOne']>(
    options.findOne ?? (async () => null),
  );
  const create = t.mock.fn<MessageModel['create']>(
    options.create ?? (async (doc) => ({ ...doc, _id: 'new-mapping-test' })),
  );
  const generateModels = t.mock.fn(async (subdomain: string) => {
    if (options.generateModels) {
      return options.generateModels(subdomain);
    }

    return { ViberMessages: { findOne, create } };
  });
  const sendTRPCMessage = t.mock.fn(async () => {
    throw new Error('Message reservation must not contact Core');
  });
  const receiveInboxMessage = t.mock.fn(async () => {
    throw new Error('Message reservation must not modify inbox messages');
  });
  const { getOrCreateViberMessageMapping } = loadViberHelpers(t, {
    connectionResolvers: { generateModels },
    sharedUtils: { sendTRPCMessage },
    inboxReceiver: { receiveInboxMessage },
  });

  t.after(() => {
    strictEqual(sendTRPCMessage.mock.callCount(), 0);
    strictEqual(receiveInboxMessage.mock.callCount(), 0);
  });

  const run = (overrides: Partial<typeof INPUT> = {}) => {
    const input = { ...INPUT, ...overrides };
    return getOrCreateViberMessageMapping(
      input.subdomain,
      input.inboxId,
      input.messageToken,
    );
  };

  return { run, generateModels, findOne, create };
};

test('rejects blank inbox ids before accessing tenant models', async (t) => {
  const harness = createMessageHarness(t);

  for (const inboxId of ['', ' \t\n']) {
    await rejects(harness.run({ inboxId }), {
      message: 'Inbox integration id is required',
    });
  }

  strictEqual(harness.generateModels.mock.callCount(), 0);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('rejects empty tokens and every non-digit without accessing models', async (t) => {
  const harness = createMessageHarness(t);

  for (const messageToken of [
    '',
    ' ',
    ' 123',
    '123 ',
    '123\n',
    '123\r',
    '123\t',
    '12\n34',
    '+123',
    '-123',
    '1.23',
    '1e3',
    '12a3',
    '\u0661\u0662\u0663',
  ]) {
    await rejects(harness.run({ messageToken }), {
      message: 'Invalid Viber message token',
    });
  }

  strictEqual(harness.generateModels.mock.callCount(), 0);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('rejects non-string tokens when callers bypass TypeScript', async (t) => {
  const harness = createMessageHarness(t);

  for (const messageToken of [
    undefined,
    null,
    123,
    true,
    [],
    {},
    { toString: () => '123' },
  ]) {
    // @ts-expect-error Intentionally exercise the runtime type boundary.
    const result = harness.run({ messageToken });
    await rejects(result, { message: 'Invalid Viber message token' });
  }

  strictEqual(harness.generateModels.mock.callCount(), 0);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('returns the existing pending mapping using the tenant and exact inbox/token pair', async (t) => {
  const mapping = Object.freeze({ ...MAPPING });
  const harness = createMessageHarness(t, { findOne: async () => mapping });

  strictEqual(await harness.run(), mapping);
  strictEqual(mapping.processedAt, undefined);
  deepStrictEqual(harness.generateModels.mock.calls[0].arguments, [
    INPUT.subdomain,
  ]);
  deepStrictEqual(harness.findOne.mock.calls[0].arguments, [SELECTOR]);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('returns a completed mapping without changing its id or timestamp', async (t) => {
  const processedAt = new Date('2026-09-14T08:09:10.000Z');
  const mapping = Object.freeze({ ...MAPPING, processedAt });
  const harness = createMessageHarness(t, { findOne: async () => mapping });
  const result = await harness.run();

  strictEqual(result, mapping);
  strictEqual(result.processedAt, processedAt);
  strictEqual(result.messageId, MAPPING.messageId);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('reserves a fresh Frontline message id without marking the mapping processed', async (t) => {
  const harness = createMessageHarness(t);
  const result = await harness.run();

  ok(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      result.messageId,
    ),
  );
  deepStrictEqual(harness.create.mock.calls[0].arguments, [
    { ...SELECTOR, messageId: result.messageId },
  ]);
  notStrictEqual(result._id, result.messageId);
  strictEqual(result.processedAt, undefined);
  strictEqual('processedAt' in result, false);
});

test('preserves zero, leading zeroes, and neighboring large tokens exactly', async (t) => {
  const harness = createMessageHarness(t);
  const tokens = ['0', '000123', '4912661846655238145', '4912661846655238146'];
  const messageIds: string[] = [];

  for (const messageToken of tokens) {
    const result = await harness.run({ messageToken });
    strictEqual(result.messageToken, messageToken);
    messageIds.push(result.messageId);
  }

  deepStrictEqual(
    harness.findOne.mock.calls.map(({ arguments: [selector] }) => selector),
    tokens.map((messageToken) => ({ inboxId: INPUT.inboxId, messageToken })),
  );
  strictEqual(new Set(messageIds).size, tokens.length);
});

test('does not reuse a token mapping from a different inbox', async (t) => {
  const harness = createMessageHarness(t, {
    findOne: async (selector) =>
      selector.inboxId === SELECTOR.inboxId &&
      selector.messageToken === SELECTOR.messageToken
        ? MAPPING
        : null,
  });
  const result = await harness.run({ inboxId: 'another-inbox' });

  strictEqual(result.inboxId, 'another-inbox');
  notStrictEqual(result.messageId, MAPPING.messageId);
  deepStrictEqual(harness.create.mock.calls[0].arguments, [
    { ...SELECTOR, inboxId: 'another-inbox', messageId: result.messageId },
  ]);
});

test('resolves the same inbox/token pair through each supplied tenant', async (t) => {
  const harness = createMessageHarness(t, {
    generateModels: async (subdomain) => ({
      ViberMessages: {
        findOne: async (selector) => {
          deepStrictEqual(selector, SELECTOR);
          return { ...MAPPING, messageId: `message-${subdomain}` };
        },
        create: async () => {
          throw new Error('Existing mappings must not be recreated');
        },
      },
    }),
  });

  for (const subdomain of ['tenant-one', 'tenant-two']) {
    const result = await harness.run({ subdomain });
    strictEqual(result.messageId, `message-${subdomain}`);
  }

  deepStrictEqual(
    harness.generateModels.mock.calls.map(({ arguments: args }) => args),
    [['tenant-one'], ['tenant-two']],
  );
});

test('preserves a nonblank opaque inbox id instead of trimming its identity', async (t) => {
  const harness = createMessageHarness(t);
  const inboxId = ' inbox-test ';
  const result = await harness.run({ inboxId });

  strictEqual(result.inboxId, inboxId);
  deepStrictEqual(harness.findOne.mock.calls[0].arguments, [
    { ...SELECTOR, inboxId },
  ]);
});

test('propagates a tenant-model loading failure without looking up or saving mappings', async (t) => {
  const failure = new Error('Tenant models unavailable');
  const harness = createMessageHarness(t, {
    generateModels: async () => {
      throw failure;
    },
  });

  await rejects(harness.run(), (error: unknown) => error === failure);
  strictEqual(harness.findOne.mock.callCount(), 0);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('propagates a failed initial lookup instead of assuming a new message', async (t) => {
  const failure = new Error('Mapping lookup failed');
  const harness = createMessageHarness(t, {
    findOne: async () => {
      throw failure;
    },
  });

  await rejects(harness.run(), (error: unknown) => error === failure);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('does not resolve before the reservation write finishes', async (t) => {
  let completeSave: (mapping: Mapping) => void = () => {
    throw new Error('Save promise was not initialized');
  };
  let markSaveStarted: () => void = () => {
    throw new Error('Save-start promise was not initialized');
  };
  const pendingSave = new Promise<Mapping>((resolve) => {
    completeSave = resolve;
  });
  const saveStarted = new Promise<void>((resolve) => {
    markSaveStarted = resolve;
  });
  const harness = createMessageHarness(t, {
    create: async () => {
      markSaveStarted();
      return pendingSave;
    },
  });
  let resolved = false;
  const result = harness.run().then((mapping) => {
    resolved = true;
    return mapping;
  });

  await saveStarted;
  strictEqual(resolved, false);
  completeSave(MAPPING);
  strictEqual(await result, MAPPING);
});

test('propagates non-duplicate save failures without a recovery lookup', async (t) => {
  let failure: unknown;
  const harness = createMessageHarness(t, {
    create: async () => {
      throw failure;
    },
  });

  for (failure of [
    new Error('Save failed'),
    { code: 123 },
    { code: '11000' },
    null,
    undefined,
    'save failed',
  ]) {
    const lookupsBefore = harness.findOne.mock.callCount();
    await rejects(harness.run(), (error: unknown) => error === failure);
    strictEqual(harness.findOne.mock.callCount(), lookupsBefore + 1);
  }
});

for (const processedAt of [undefined, new Date('2026-09-14T08:09:10.000Z')]) {
  test(`recovers the ${
    processedAt ? 'completed' : 'pending'
  } winner after a duplicate save`, async (t) => {
    let lookups = 0;
    const winner = { ...MAPPING, processedAt };
    const harness = createMessageHarness(t, {
      findOne: async () => (++lookups === 1 ? null : winner),
      create: async () => {
        throw { code: 11000 };
      },
    });

    strictEqual(await harness.run(), winner);
    strictEqual(harness.findOne.mock.callCount(), 2);
    strictEqual(harness.create.mock.callCount(), 1);
    deepStrictEqual(harness.findOne.mock.calls[1].arguments, [SELECTOR]);
  });
}

test('rethrows a duplicate error when no mapping exists for the exact pair', async (t) => {
  const failure = { code: 11000 };
  const harness = createMessageHarness(t, {
    create: async () => {
      throw failure;
    },
  });

  await rejects(harness.run(), (error: unknown) => error === failure);
  strictEqual(harness.findOne.mock.callCount(), 2);
  strictEqual(harness.create.mock.callCount(), 1);
});

test('propagates a failed duplicate-recovery lookup', async (t) => {
  let lookups = 0;
  const failure = new Error('Recovery lookup failed');
  const harness = createMessageHarness(t, {
    findOne: async () => {
      if (++lookups === 1) return null;
      throw failure;
    },
    create: async () => {
      throw { code: 11000 };
    },
  });

  await rejects(harness.run(), (error: unknown) => error === failure);
  strictEqual(harness.create.mock.callCount(), 1);
});

test('reuses the saved reservation on retry after a write acknowledgement failure', async (t) => {
  let storedMapping: Mapping | null = null;
  const failure = new Error('Write acknowledgement lost');
  const harness = createMessageHarness(t, {
    findOne: async () => storedMapping,
    create: async (doc) => {
      storedMapping = { ...doc, _id: 'stored-mapping' };
      throw failure;
    },
  });

  await rejects(harness.run(), (error: unknown) => error === failure);
  const result = await harness.run();

  strictEqual(
    result.messageId,
    harness.create.mock.calls[0].arguments[0].messageId,
  );
  strictEqual(result.processedAt, undefined);
  strictEqual(harness.create.mock.callCount(), 1);
  strictEqual(result, storedMapping);
});

test('concurrent first callbacks converge on one unprocessed mapping under mocked uniqueness', async (t) => {
  let releaseReads: () => void = () => {
    throw new Error('Read barrier was not initialized');
  };
  const readsReady = new Promise<void>((resolve) => {
    releaseReads = resolve;
  });
  let lookups = 0;
  let savedCount = 0;
  let storedMapping: Mapping | null = null;
  const harness = createMessageHarness(t, {
    findOne: async () => {
      if (++lookups <= 2) {
        if (lookups === 2) releaseReads();
        await readsReady;
        return null;
      }
      return storedMapping;
    },
    create: async (doc) => {
      if (storedMapping) throw { code: 11000 };
      storedMapping = { ...doc, _id: 'winning-mapping' };
      savedCount++;
      return storedMapping;
    },
  });
  const [first, second] = await Promise.all([harness.run(), harness.run()]);

  strictEqual(first, second);
  strictEqual(first.processedAt, undefined);
  strictEqual(savedCount, 1);
  strictEqual(harness.create.mock.callCount(), 2);
  strictEqual(harness.findOne.mock.callCount(), 3);
  notStrictEqual(
    harness.create.mock.calls[0].arguments[0].messageId,
    harness.create.mock.calls[1].arguments[0].messageId,
  );
  strictEqual(first, storedMapping);
});
