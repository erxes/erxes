import { test } from 'node:test';
import {
  deepStrictEqual,
  notStrictEqual,
  ok,
  rejects,
  strictEqual,
} from 'node:assert';
import type { IViberCustomer } from '../@types/customer';
import { loadViberHelpers, type TestContext } from './helperHarness';

type MappingSelector = Pick<IViberCustomer, 'inboxId' | 'userId'>;
type Mapping = IViberCustomer & { _id: string };

interface CustomerModel {
  findOne(selector: MappingSelector): Promise<Mapping | null>;
  create(doc: IViberCustomer): Promise<Mapping>;
}

interface CoreCustomer {
  _id: string;
  integrationId: string;
  firstName?: string;
}

type CoreCustomerRequest = {
  subdomain: string;
  pluginName: 'core';
  module: 'customers';
  throwOnError: true;
} & (
  | {
      method: 'query';
      action: 'findOne';
      input: { _id: string };
      defaultValue: null;
    }
  | {
      method: 'mutation';
      action: 'createCustomer';
      input: { doc: CoreCustomer };
    }
);

interface HarnessOptions {
  coreCustomers?: readonly CoreCustomer[];
  findOne?: CustomerModel['findOne'];
  create?: CustomerModel['create'];
  sendTRPCMessage?: (request: CoreCustomerRequest) => Promise<unknown>;
  generateModels?: (
    subdomain: string,
  ) => Promise<{ ViberCustomers: CustomerModel }>;
}

const SELECTOR: MappingSelector = {
  inboxId: 'inbox-test',
  userId: 'viber-user-test',
};
const EXISTING_MAPPING: Mapping = {
  ...SELECTOR,
  _id: 'mapping-test',
  contactsId: 'core-customer-test',
};

const createCustomerHarness = (
  t: TestContext,
  options: HarnessOptions = {},
) => {
  const mappings = new Map<string, Mapping>();
  const coreCustomers = new Map(
    (options.coreCustomers ?? []).map((customer) => [customer._id, customer]),
  );
  const mappingKey = ({ inboxId, userId }: MappingSelector): string =>
    JSON.stringify([inboxId, userId]);
  const findOneImpl: CustomerModel['findOne'] =
    options.findOne ??
    (async (selector) => mappings.get(mappingKey(selector)) ?? null);
  const createImpl: CustomerModel['create'] =
    options.create ??
    (async (doc) => {
      const key = mappingKey(doc);
      if (mappings.has(key)) throw { code: 11000 };
      const mapping = { ...doc, _id: `mapping-${mappings.size + 1}` };
      mappings.set(key, mapping);
      return mapping;
    });
  const coreImpl: NonNullable<HarnessOptions['sendTRPCMessage']> =
    options.sendTRPCMessage ??
    (async (request) => {
      if (request.method === 'query') {
        return coreCustomers.get(request.input._id) ?? null;
      }

      const { doc } = request.input;
      if (coreCustomers.has(doc._id)) throw { code: 11000 };
      coreCustomers.set(doc._id, doc);
      return doc;
    });

  const findOne = t.mock.fn(findOneImpl);
  const create = t.mock.fn(createImpl);
  const sendTRPCMessage = t.mock.fn(coreImpl);
  const generateModels = t.mock.fn(async (subdomain: string) => {
    if (options.generateModels) {
      return options.generateModels(subdomain);
    }

    return { ViberCustomers: { findOne, create } };
  });

  const { getOrCreateViberCustomer } = loadViberHelpers(t, {
    sharedUtils: { sendTRPCMessage },
    connectionResolvers: { generateModels },
    inboxReceiver: {
      receiveInboxMessage: async () => {
        throw new Error('Customer resolution must not modify conversations');
      },
    },
  });

  return {
    mappings,
    coreCustomers,
    getOrCreateViberCustomer,
    generateModels,
    findOne,
    create,
    sendTRPCMessage,
  };
};

test('rejects blank inbox ids before accessing models or Core', async (t) => {
  const harness = createCustomerHarness(t);

  for (const inboxId of ['', ' \t\n']) {
    await rejects(
      harness.getOrCreateViberCustomer('test', inboxId, SELECTOR.userId),
      { message: 'Inbox integration id is required' },
    );
  }

  strictEqual(harness.generateModels.mock.callCount(), 0);
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 0);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('rejects blank Viber user ids before accessing models or Core', async (t) => {
  const harness = createCustomerHarness(t);

  for (const userId of ['', ' \t\n']) {
    await rejects(
      harness.getOrCreateViberCustomer('test', SELECTOR.inboxId, userId),
      { message: 'Viber user id is required' },
    );
  }

  strictEqual(harness.generateModels.mock.callCount(), 0);
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 0);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('returns the mapped Core id using the request tenant and both identity fields', async (t) => {
  const harness = createCustomerHarness(t, {
    findOne: async () => EXISTING_MAPPING,
    coreCustomers: [
      { _id: EXISTING_MAPPING.contactsId, integrationId: SELECTOR.inboxId },
    ],
  });

  strictEqual(
    await harness.getOrCreateViberCustomer(
      'tenant-one',
      SELECTOR.inboxId,
      SELECTOR.userId,
    ),
    EXISTING_MAPPING.contactsId,
  );
  deepStrictEqual(harness.generateModels.mock.calls[0].arguments, [
    'tenant-one',
  ]);
  deepStrictEqual(harness.findOne.mock.calls[0].arguments, [SELECTOR]);
  deepStrictEqual(harness.sendTRPCMessage.mock.calls[0].arguments, [
    {
      subdomain: 'tenant-one',
      pluginName: 'core',
      module: 'customers',
      method: 'query',
      action: 'findOne',
      input: { _id: EXISTING_MAPPING.contactsId },
      defaultValue: null,
      throwOnError: true,
    },
  ]);
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 1);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('does not reuse a sender mapping from another inbox', async (t) => {
  const harness = createCustomerHarness(t, {
    findOne: async (selector) => {
      if (
        selector.inboxId === SELECTOR.inboxId &&
        selector.userId === SELECTOR.userId
      ) {
        return EXISTING_MAPPING;
      }

      return null;
    },
  });

  const contactsId = await harness.getOrCreateViberCustomer(
    'test',
    'another-inbox',
    SELECTOR.userId,
  );

  notStrictEqual(contactsId, EXISTING_MAPPING.contactsId);
  strictEqual(
    harness.coreCustomers.get(contactsId)?.integrationId,
    'another-inbox',
  );
  deepStrictEqual(harness.create.mock.calls[0].arguments, [
    {
      inboxId: 'another-inbox',
      userId: SELECTOR.userId,
      contactsId,
    },
  ]);
});

test('uses each tenant model container even for identical inbox and sender ids', async (t) => {
  const harness = createCustomerHarness(t, {
    sendTRPCMessage: async (request) => {
      strictEqual(request.method, 'query');
      deepStrictEqual(request.input, { _id: `core-${request.subdomain}` });
      return {
        _id: `core-${request.subdomain}`,
        integrationId: SELECTOR.inboxId,
      };
    },
    generateModels: async (subdomain) => ({
      ViberCustomers: {
        findOne: async (selector) => ({
          ...selector,
          _id: `mapping-${subdomain}`,
          contactsId: `core-${subdomain}`,
        }),
        create: async () => {
          throw new Error('An existing tenant mapping must not be recreated');
        },
      },
    }),
  });

  for (const subdomain of ['tenant-one', 'tenant-two']) {
    strictEqual(
      await harness.getOrCreateViberCustomer(
        subdomain,
        SELECTOR.inboxId,
        SELECTOR.userId,
      ),
      `core-${subdomain}`,
    );
  }

  strictEqual(harness.generateModels.mock.callCount(), 2);
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 2);
});

test('reserves the Core id before creating its customer through the public contract', async (t) => {
  const harness = createCustomerHarness(t);

  const contactsId = await harness.getOrCreateViberCustomer(
    'tenant-one',
    SELECTOR.inboxId,
    SELECTOR.userId,
    '  Mina  ',
  );

  ok(contactsId.trim());
  notStrictEqual(contactsId, [...harness.mappings.values()][0]._id);
  deepStrictEqual(harness.sendTRPCMessage.mock.calls[0].arguments, [
    {
      subdomain: 'tenant-one',
      pluginName: 'core',
      module: 'customers',
      method: 'query',
      action: 'findOne',
      input: { _id: contactsId },
      defaultValue: null,
      throwOnError: true,
    },
  ]);
  deepStrictEqual(harness.sendTRPCMessage.mock.calls[1].arguments, [
    {
      subdomain: 'tenant-one',
      pluginName: 'core',
      method: 'mutation',
      module: 'customers',
      action: 'createCustomer',
      input: {
        doc: {
          _id: contactsId,
          integrationId: SELECTOR.inboxId,
          firstName: 'Mina',
        },
      },
      throwOnError: true,
    },
  ]);
  deepStrictEqual(harness.create.mock.calls[0].arguments, [
    { ...SELECTOR, contactsId },
  ]);
  strictEqual(harness.findOne.mock.callCount(), 1);
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 2);
  strictEqual(harness.create.mock.callCount(), 1);
  strictEqual(harness.coreCustomers.size, 1);
});

test('allows an absent or blank optional display name', async (t) => {
  const harness = createCustomerHarness(t);

  for (const [index, name] of [undefined, '', ' \t\n'].entries()) {
    await harness.getOrCreateViberCustomer(
      'test',
      SELECTOR.inboxId,
      `${SELECTOR.userId}-${index}`,
      name,
    );
  }

  for (const call of harness.sendTRPCMessage.mock.calls) {
    const request = call.arguments[0];
    if (request.method === 'mutation') {
      strictEqual(request.input.doc.firstName, undefined);
    }
  }
  strictEqual(harness.coreCustomers.size, 3);
});

test('preserves nonblank opaque identity strings instead of normalizing them', async (t) => {
  const harness = createCustomerHarness(t, {
    findOne: async () => ({ ...EXISTING_MAPPING, contactsId: '000core+/=' }),
    coreCustomers: [{ _id: '000core+/=', integrationId: '000inbox' }],
  });

  strictEqual(
    await harness.getOrCreateViberCustomer('test', '000inbox', '000user+/='),
    '000core+/=',
  );
  deepStrictEqual(harness.findOne.mock.calls[0].arguments, [
    { inboxId: '000inbox', userId: '000user+/=' },
  ]);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('propagates model-loader failures without contacting Core', async (t) => {
  const failure = new Error('Tenant database unavailable');
  const harness = createCustomerHarness(t, {
    generateModels: async () => {
      throw failure;
    },
  });

  await rejects(
    harness.getOrCreateViberCustomer('test', SELECTOR.inboxId, SELECTOR.userId),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 0);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('does not treat a failed mapping lookup as a new sender', async (t) => {
  const failure = new Error('Mapping query failed');
  const harness = createCustomerHarness(t, {
    findOne: async () => {
      throw failure;
    },
  });

  await rejects(
    harness.getOrCreateViberCustomer('test', SELECTOR.inboxId, SELECTOR.userId),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 0);
  strictEqual(harness.create.mock.callCount(), 0);
});

test('retains the reserved id when the Core lookup fails instead of attempting creation', async (t) => {
  const failure = new Error('Core unavailable');
  const harness = createCustomerHarness(t, {
    sendTRPCMessage: async () => {
      throw failure;
    },
  });

  await rejects(
    harness.getOrCreateViberCustomer('test', SELECTOR.inboxId, SELECTOR.userId),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.create.mock.callCount(), 1);
  strictEqual(harness.mappings.size, 1);
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 1);
  strictEqual(
    harness.sendTRPCMessage.mock.calls[0].arguments[0].method,
    'query',
  );
});

test('rejects malformed create responses when a reread cannot prove that the customer exists', async (t) => {
  let coreResponse: unknown;
  const harness = createCustomerHarness(t, {
    findOne: async () => EXISTING_MAPPING,
    sendTRPCMessage: async (request) =>
      request.method === 'query' ? null : coreResponse,
  });

  for (coreResponse of [
    undefined,
    null,
    [],
    'customer-id',
    42,
    {},
    { _id: undefined },
    { _id: null },
    { _id: 42 },
    { _id: '' },
    { _id: ' \t\n' },
    { _id: EXISTING_MAPPING.contactsId, integrationId: 'another-inbox' },
    { _id: 'another-customer', integrationId: SELECTOR.inboxId },
    { status: 'error', errorMessage: 'Core failed' },
  ]) {
    await rejects(
      harness.getOrCreateViberCustomer(
        'test',
        SELECTOR.inboxId,
        SELECTOR.userId,
      ),
      { message: 'Failed to resolve a Core customer for Viber' },
    );
  }

  strictEqual(harness.create.mock.callCount(), 0);
});

test('does not contact Core or resolve before the mapping reservation finishes', async (t) => {
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
  const harness = createCustomerHarness(t, {
    create: async () => {
      markSaveStarted();
      return pendingSave;
    },
  });
  let resolved = false;
  const result = harness
    .getOrCreateViberCustomer('test', SELECTOR.inboxId, SELECTOR.userId)
    .then((contactsId) => {
      resolved = true;
      return contactsId;
    });

  await saveStarted;
  strictEqual(resolved, false);
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 0);
  completeSave({ ...EXISTING_MAPPING, contactsId: 'new-core-customer-test' });
  strictEqual(await result, 'new-core-customer-test');
});

test('propagates non-duplicate mapping failures without querying a fallback', async (t) => {
  let failure: unknown;
  const harness = createCustomerHarness(t, {
    create: async () => {
      throw failure;
    },
  });

  for (failure of [
    new Error('Write failed'),
    { code: 123 },
    { code: '11000' },
    null,
    undefined,
    'write failed',
  ]) {
    const lookupsBefore = harness.findOne.mock.callCount();
    await rejects(
      harness.getOrCreateViberCustomer(
        'test',
        SELECTOR.inboxId,
        SELECTOR.userId,
      ),
      (error: unknown) => error === failure,
    );
    strictEqual(harness.findOne.mock.callCount(), lookupsBefore + 1);
  }
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 0);
});

test('returns the saved winner after a duplicate mapping write', async (t) => {
  let lookupCount = 0;
  const harness = createCustomerHarness(t, {
    findOne: async () => (++lookupCount === 1 ? null : EXISTING_MAPPING),
    coreCustomers: [
      { _id: EXISTING_MAPPING.contactsId, integrationId: SELECTOR.inboxId },
    ],
    create: async () => {
      throw { code: 11000 };
    },
  });

  strictEqual(
    await harness.getOrCreateViberCustomer(
      'test',
      SELECTOR.inboxId,
      SELECTOR.userId,
    ),
    EXISTING_MAPPING.contactsId,
  );
  deepStrictEqual(harness.findOne.mock.calls[1].arguments, [SELECTOR]);
  strictEqual(harness.create.mock.callCount(), 1);
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 1);
  deepStrictEqual(harness.sendTRPCMessage.mock.calls[0].arguments[0].input, {
    _id: EXISTING_MAPPING.contactsId,
  });
});

test('rethrows a duplicate error when there is no matching saved mapping', async (t) => {
  const failure = { code: 11000 };
  const harness = createCustomerHarness(t, {
    create: async () => {
      throw failure;
    },
  });

  await rejects(
    harness.getOrCreateViberCustomer('test', SELECTOR.inboxId, SELECTOR.userId),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.findOne.mock.callCount(), 2);
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 0);
});

test('propagates a failed duplicate-recovery lookup instead of claiming success', async (t) => {
  const failure = new Error('Recovery lookup failed');
  let lookupCount = 0;
  const harness = createCustomerHarness(t, {
    findOne: async () => {
      if (++lookupCount === 1) {
        return null;
      }

      throw failure;
    },
    create: async () => {
      throw { code: 11000 };
    },
  });

  await rejects(
    harness.getOrCreateViberCustomer('test', SELECTOR.inboxId, SELECTOR.userId),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 0);
});

test('rejects malformed or differently owned lookup results without creating a customer', async (t) => {
  let result: unknown;
  const harness = createCustomerHarness(t, {
    findOne: async () => EXISTING_MAPPING,
    sendTRPCMessage: async (request) => {
      strictEqual(request.method, 'query');
      return result;
    },
  });

  for (result of [
    undefined,
    [],
    '',
    false,
    0,
    {},
    { _id: EXISTING_MAPPING.contactsId },
    { _id: EXISTING_MAPPING.contactsId, integrationId: 'another-inbox' },
    { _id: 'another-customer', integrationId: SELECTOR.inboxId },
  ]) {
    await rejects(
      harness.getOrCreateViberCustomer(
        'test',
        SELECTOR.inboxId,
        SELECTOR.userId,
      ),
      { message: 'Viber customer mapping does not match its owner' },
    );
  }
  strictEqual(harness.create.mock.callCount(), 0);
});

test('a retry reuses a saved reservation after its write acknowledgement was lost', async (t) => {
  const failure = new Error('Mapping write acknowledgement lost');
  let storedMapping: Mapping | null = null;
  const harness = createCustomerHarness(t, {
    findOne: async () => storedMapping,
    create: async (doc) => {
      storedMapping = { ...doc, _id: 'reserved-mapping' };
      throw failure;
    },
  });

  await rejects(
    harness.getOrCreateViberCustomer('test', SELECTOR.inboxId, SELECTOR.userId),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 0);
  const reservedId = harness.create.mock.calls[0].arguments[0].contactsId;

  strictEqual(
    await harness.getOrCreateViberCustomer(
      'test',
      SELECTOR.inboxId,
      SELECTOR.userId,
    ),
    reservedId,
  );
  strictEqual(harness.create.mock.callCount(), 1);
  strictEqual(harness.coreCustomers.size, 1);
  strictEqual(harness.coreCustomers.get(reservedId)?._id, reservedId);
});

test('a failed Core creation keeps its reservation and a retry uses the same customer id', async (t) => {
  const failure = new Error('Core create unavailable');
  let failCreation = true;
  let savedCustomer: CoreCustomer | null = null;
  const harness = createCustomerHarness(t, {
    sendTRPCMessage: async (request) => {
      if (request.method === 'query') return savedCustomer;
      if (failCreation) throw failure;
      savedCustomer = request.input.doc;
      return savedCustomer;
    },
  });

  await rejects(
    harness.getOrCreateViberCustomer('test', SELECTOR.inboxId, SELECTOR.userId),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.mappings.size, 1);
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 3);
  const reservedId = harness.create.mock.calls[0].arguments[0].contactsId;

  failCreation = false;
  strictEqual(
    await harness.getOrCreateViberCustomer(
      'test',
      SELECTOR.inboxId,
      SELECTOR.userId,
    ),
    reservedId,
  );
  strictEqual(harness.create.mock.callCount(), 1);
  const attempts = harness.sendTRPCMessage.mock.calls
    .map((call) => call.arguments[0])
    .filter((request) => request.method === 'mutation');
  strictEqual(attempts.length, 2);
  for (const request of attempts)
    strictEqual(request.input.doc._id, reservedId);
});

for (const acknowledgement of ['lost', 'malformed'] as const) {
  test(`recovers a saved Core customer after a ${acknowledgement} create acknowledgement`, async (t) => {
    let savedCustomer: CoreCustomer | null = null;
    const harness = createCustomerHarness(t, {
      sendTRPCMessage: async (request) => {
        if (request.method === 'query') return savedCustomer;
        savedCustomer = request.input.doc;
        if (acknowledgement === 'lost') throw new Error('Gateway timeout');
        return undefined;
      },
    });

    const contactsId = await harness.getOrCreateViberCustomer(
      'test',
      SELECTOR.inboxId,
      SELECTOR.userId,
    );
    strictEqual(
      contactsId,
      harness.create.mock.calls[0].arguments[0].contactsId,
    );
    deepStrictEqual(
      harness.sendTRPCMessage.mock.calls.map(
        (call) => call.arguments[0].method,
      ),
      ['query', 'mutation', 'query'],
    );

    strictEqual(
      await harness.getOrCreateViberCustomer(
        'test',
        SELECTOR.inboxId,
        SELECTOR.userId,
      ),
      contactsId,
    );
    strictEqual(harness.create.mock.callCount(), 1);
    strictEqual(harness.sendTRPCMessage.mock.callCount(), 4);
    strictEqual(
      harness.sendTRPCMessage.mock.calls[3].arguments[0].method,
      'query',
    );
  });
}

test('a failed Core recovery lookup rejects without discarding the reserved id', async (t) => {
  const failure = new Error('Core recovery lookup unavailable');
  let lookupCount = 0;
  const harness = createCustomerHarness(t, {
    sendTRPCMessage: async (request) => {
      if (request.method === 'mutation') throw new Error('Create timed out');
      if (++lookupCount === 1) return null;
      throw failure;
    },
  });

  await rejects(
    harness.getOrCreateViberCustomer('test', SELECTOR.inboxId, SELECTOR.userId),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.mappings.size, 1);
  strictEqual(harness.create.mock.callCount(), 1);
  strictEqual(lookupCount, 2);
});

test('a differently owned customer cannot turn a failed create into a success', async (t) => {
  let savedCustomer: CoreCustomer | null = null;
  const harness = createCustomerHarness(t, {
    sendTRPCMessage: async (request) => {
      if (request.method === 'query') return savedCustomer;
      savedCustomer = { ...request.input.doc, integrationId: 'another-inbox' };
      throw new Error('Core creation failed');
    },
  });

  await rejects(
    harness.getOrCreateViberCustomer('test', SELECTOR.inboxId, SELECTOR.userId),
    { message: 'Viber customer mapping does not match its owner' },
  );
  strictEqual(harness.mappings.size, 1);
  strictEqual(harness.create.mock.callCount(), 1);
});

test('concurrent first contacts reserve one id and recover a duplicate Core create using that id', async (t) => {
  let releaseLookups: () => void = () => {
    throw new Error('Lookup barrier was not initialized');
  };
  const bothLookupsStarted = new Promise<void>((resolve) => {
    releaseLookups = resolve;
  });
  let releaseCoreLookups: () => void = () => {
    throw new Error('Core lookup barrier was not initialized');
  };
  const bothCoreLookupsStarted = new Promise<void>((resolve) => {
    releaseCoreLookups = resolve;
  });
  let lookupCount = 0;
  let coreLookupCount = 0;
  const savedCustomers = new Map<string, CoreCustomer>();
  let storedMapping: Mapping | null = null;
  const harness = createCustomerHarness(t, {
    findOne: async () => {
      if (++lookupCount <= 2) {
        if (lookupCount === 2) {
          releaseLookups();
        }

        await bothLookupsStarted;
        return null;
      }

      return storedMapping;
    },
    sendTRPCMessage: async (request) => {
      if (request.method === 'query') {
        if (++coreLookupCount <= 2) {
          if (coreLookupCount === 2) releaseCoreLookups();
          await bothCoreLookupsStarted;
          return null;
        }
        return savedCustomers.get(request.input._id) ?? null;
      }

      const { doc } = request.input;
      if (savedCustomers.has(doc._id)) throw { code: 11000 };
      savedCustomers.set(doc._id, doc);
      return doc;
    },
    create: async (doc) => {
      if (storedMapping) {
        throw { code: 11000 };
      }

      storedMapping = { ...doc, _id: 'winning-mapping' };
      return storedMapping;
    },
  });

  const results = await Promise.all([
    harness.getOrCreateViberCustomer('test', SELECTOR.inboxId, SELECTOR.userId),
    harness.getOrCreateViberCustomer('test', SELECTOR.inboxId, SELECTOR.userId),
  ]);

  const reservedId = harness.create.mock.calls[0].arguments[0].contactsId;
  deepStrictEqual(results, [reservedId, reservedId]);
  strictEqual(harness.create.mock.callCount(), 2);
  strictEqual(savedCustomers.size, 1);
  const attempts = harness.sendTRPCMessage.mock.calls
    .map((call) => call.arguments[0])
    .filter((request) => request.method === 'mutation');
  strictEqual(attempts.length, 2);
  for (const request of attempts) {
    deepStrictEqual(request.input.doc, {
      _id: reservedId,
      integrationId: SELECTOR.inboxId,
      firstName: undefined,
    });
  }
});
