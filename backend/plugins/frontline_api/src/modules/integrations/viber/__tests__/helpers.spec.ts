import { test } from 'node:test';
import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import type { IViberCustomer } from '../@types/customer';
import { loadViberHelpers, type TestContext } from './helperHarness';

type MappingSelector = Pick<IViberCustomer, 'inboxId' | 'userId'>;
type Mapping = IViberCustomer & { _id: string };

interface CustomerModel {
  findOne(selector: MappingSelector): Promise<Mapping | null>;
  create(doc: IViberCustomer): Promise<Mapping>;
}

interface CoreCustomerRequest {
  subdomain: string;
  pluginName: 'core';
  method: 'mutation';
  module: 'customers';
  action: 'createCustomer';
  input: { doc: { integrationId: string; firstName?: string } };
  throwOnError: true;
}

interface HarnessOptions {
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
  const findOneImpl: CustomerModel['findOne'] =
    options.findOne ?? (async () => null);
  const createImpl: CustomerModel['create'] =
    options.create ?? (async (doc) => ({ ...doc, _id: 'new-mapping-test' }));
  const coreImpl: NonNullable<HarnessOptions['sendTRPCMessage']> =
    options.sendTRPCMessage ??
    (async () => ({ _id: 'new-core-customer-test' }));

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
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 0);
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

  strictEqual(contactsId, 'new-core-customer-test');
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
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 0);
});

test('creates a Core customer through the public contract and saves the separate mapping', async (t) => {
  const harness = createCustomerHarness(t);

  const contactsId = await harness.getOrCreateViberCustomer(
    'tenant-one',
    SELECTOR.inboxId,
    SELECTOR.userId,
    '  Mina  ',
  );

  strictEqual(contactsId, 'new-core-customer-test');
  deepStrictEqual(harness.sendTRPCMessage.mock.calls[0].arguments, [
    {
      subdomain: 'tenant-one',
      pluginName: 'core',
      method: 'mutation',
      module: 'customers',
      action: 'createCustomer',
      input: { doc: { integrationId: SELECTOR.inboxId, firstName: 'Mina' } },
      throwOnError: true,
    },
  ]);
  deepStrictEqual(harness.create.mock.calls[0].arguments, [
    { ...SELECTOR, contactsId },
  ]);
  strictEqual(harness.findOne.mock.callCount(), 1);
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 1);
  strictEqual(harness.create.mock.callCount(), 1);
});

test('allows an absent or blank optional display name', async (t) => {
  const harness = createCustomerHarness(t);

  for (const name of [undefined, '', ' \t\n']) {
    await harness.getOrCreateViberCustomer(
      'test',
      SELECTOR.inboxId,
      SELECTOR.userId,
      name,
    );
  }

  for (const call of harness.sendTRPCMessage.mock.calls) {
    strictEqual(call.arguments[0].input.doc.firstName, undefined);
  }
});

test('preserves nonblank opaque identity strings instead of normalizing them', async (t) => {
  const harness = createCustomerHarness(t, {
    sendTRPCMessage: async () => ({ _id: '000core+/=' }),
  });

  strictEqual(
    await harness.getOrCreateViberCustomer('test', '000inbox', '000user+/='),
    '000core+/=',
  );
  deepStrictEqual(harness.create.mock.calls[0].arguments, [
    { inboxId: '000inbox', userId: '000user+/=', contactsId: '000core+/=' },
  ]);
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

test('propagates Core failures without saving a mapping', async (t) => {
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
  strictEqual(harness.create.mock.callCount(), 0);
});

test('rejects malformed Core responses before saving a mapping', async (t) => {
  let coreResponse: unknown;
  const harness = createCustomerHarness(t, {
    sendTRPCMessage: async () => coreResponse,
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

test('does not resolve before the mapping write finishes', async (t) => {
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
});

test('returns the saved winner after a duplicate mapping write', async (t) => {
  let lookupCount = 0;
  const harness = createCustomerHarness(t, {
    findOne: async () => (++lookupCount === 1 ? null : EXISTING_MAPPING),
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
});

test('concurrent first contacts converge on the winning mapping but can create extra Core customers', async (t) => {
  let releaseLookups: () => void = () => {
    throw new Error('Lookup barrier was not initialized');
  };
  const bothLookupsStarted = new Promise<void>((resolve) => {
    releaseLookups = resolve;
  });
  let lookupCount = 0;
  let coreCount = 0;
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
    sendTRPCMessage: async () => ({ _id: `created-core-${++coreCount}` }),
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

  deepStrictEqual(results, ['created-core-1', 'created-core-1']);
  strictEqual(harness.create.mock.callCount(), 2);
  // Characterizes the remaining cross-service race, not an exactly-once claim.
  // Change this expectation when customer creation itself becomes idempotent.
  strictEqual(harness.sendTRPCMessage.mock.callCount(), 2);
});
