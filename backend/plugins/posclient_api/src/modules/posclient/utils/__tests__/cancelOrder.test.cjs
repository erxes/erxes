const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function loadSource(relativePath, dependencies) {
  const filename = path.resolve(__dirname, relativePath);
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const module = { exports: {} };
  vm.runInNewContext(
    outputText,
    {
      module,
      exports: module.exports,
      Date,
      Object,
      Buffer,
      require: (name) => dependencies[name] || {},
    },
    { filename },
  );
  return module.exports;
}

function cancellationFixture(overrides = {}) {
  const events = [];
  const order = {
    _id: 'order',
    posToken: 'pos',
    totalAmount: 100,
    ...overrides,
  };
  let success = false;
  let pending = false;
  let remoteResult = { cancelled: true };
  const models = {
    Orders: {
      getOrder: async () => order,
      deleteOne: async () => {
        events.push('order-delete');
        return { acknowledged: true, deletedCount: 1 };
      },
    },
    OrderItems: { deleteMany: async () => events.push('items-delete') },
    PutResponses: {
      exists: async (query) => (query.status === 'SUCCESS' ? success : pending),
      deleteMany: async (query) => {
        assert.equal(query.status.$ne, 'SUCCESS');
        events.push('receipts-delete');
      },
    },
    OrderChangeLogs: {
      createLog: async (doc) => {
        events.push('audit');
        assert.equal(doc.userId, 'actor');
        assert.equal(doc.action, 'cancel');
        assert.equal(doc.changes[1].oldValue.length, 2);
      },
    },
  };
  const { cancelPosOrder } = loadSource('../cancelOrder.ts', {
    'erxes-api-shared/utils': {
      sendTRPCMessage: async (request) => {
        events.push('remote');
        assert.equal(request.throwOnError, true);
        assert.equal(request.action, 'cancelOrder');
        if (remoteResult instanceof Error) throw remoteResult;
        return remoteResult;
      },
    },
    './orderChangeLogs': {
      getOrderChangeSnapshot: async () => ({
        items: [{ _id: 'one' }, { _id: 'two' }],
      }),
    },
  });
  return {
    events,
    run: (token = 'pos') =>
      cancelPosOrder(models, 'order', 'tenant', token, 'actor'),
    receipts: (successful, unresolved = false) => {
      success = successful;
      pending = unresolved;
    },
    remote: (result) => {
      remoteResult = result;
    },
  };
}

test('unpaid, unsynced order without successful receipt can be cancelled', async () => {
  const fixture = cancellationFixture();
  await fixture.run();
  assert.deepEqual(fixture.events, [
    'audit',
    'receipts-delete',
    'items-delete',
    'order-delete',
  ]);
});
for (const synced of [false, true]) {
  for (const billType of ['1', '9']) {
    test(`paid order without eBarimt cannot be cancelled: synced=${synced}, billType=${billType}`, async () => {
      const fixture = cancellationFixture({
        paidDate: new Date(),
        synced,
        billType,
      });
      await assert.rejects(fixture.run(), /Paid orders cannot be cancelled/);
      assert.deepEqual(fixture.events, []);
    });
  }
}
test('unpaid draft with internal receipt type can still be cancelled', async () => {
  const fixture = cancellationFixture({ billType: '9', paidDate: null });
  await fixture.run();
  assert.equal(fixture.events.includes('order-delete'), true);
});
test('synced order requires remote acknowledgement before local cleanup', async () => {
  const fixture = cancellationFixture({ synced: true });
  await fixture.run();
  assert.deepEqual(fixture.events, [
    'remote',
    'audit',
    'receipts-delete',
    'items-delete',
    'order-delete',
  ]);
});
for (const result of [
  undefined,
  { cancelled: false },
  new Error('sales unavailable'),
]) {
  test(`remote failure retains local order: ${String(result)}`, async () => {
    const fixture = cancellationFixture({ synced: true });
    fixture.remote(result);
    await assert.rejects(fixture.run());
    assert.deepEqual(fixture.events, ['remote']);
  });
}
for (const state of ['active', 'inactive']) {
  test(`successful ${state} receipt prevents deletion`, async () => {
    const fixture = cancellationFixture({ synced: true });
    fixture.receipts(true);
    await assert.rejects(fixture.run(), /Successful eBarimt/);
    assert.deepEqual(fixture.events, []);
  });
}
test('unresolved receipt prevents deletion', async () => {
  const fixture = cancellationFixture();
  fixture.receipts(false, true);
  await assert.rejects(fixture.run(), /unresolved/);
  assert.deepEqual(fixture.events, []);
});
for (const order of [
  { status: 'return' },
  { returnInfo: { returnAt: new Date() } },
  { mobileAmount: 100 },
  { isPre: true, cashAmount: 100 },
]) {
  test(`retains returned or externally paid orders: ${JSON.stringify(
    order,
  )}`, async () => {
    const fixture = cancellationFixture(order);
    await assert.rejects(fixture.run());
    assert.deepEqual(fixture.events, []);
  });
}
test('cross-POS cancellation is rejected', async () => {
  const fixture = cancellationFixture();
  await assert.rejects(fixture.run('other-pos'), /does not belong/);
  assert.deepEqual(fixture.events, []);
});

function returnFixture(responseStatuses = [200], histories) {
  const rows = histories || [
    { _id: 'original', id: 'receipt', date: '2026-10-04', status: 'SUCCESS' },
  ];
  const requests = [];
  let ReturnClass;
  const models = {
    PutResponses: {
      putHistories: async () =>
        rows.filter(
          (row) =>
            row.id && row.state !== 'inactive' && row.status === 'SUCCESS',
        ),
      exists: async () =>
        rows.some(
          (row) => row.inactiveId && !row.id && row.status === 'SUCCESS',
        ),
      createPutResponse: async (doc) => {
        const row = { _id: `return-${rows.length}`, ...doc };
        rows.push(row);
        return row;
      },
      updateOne: async (query, update) =>
        Object.assign(
          rows.find((row) => row._id === query._id),
          update.$set,
        ),
      find: () => ({ sort: () => ({ lean: async () => rows }) }),
    },
  };
  const { loadPutResponseClass } = loadSource(
    '../../db/models/PutResponses.ts',
    {
      '../definitions/putResponses': {
        ebarimtSchema: {
          loadClass: (value) => {
            ReturnClass = value;
          },
        },
      },
      'node-fetch': async (_url, request) => {
        requests.push(request);
        const status = responseStatuses.shift();
        if (status instanceof Error) throw status;
        return { status, json: async () => ({ message: 'rejected' }) };
      },
    },
  );
  loadPutResponseClass(models);
  return {
    rows,
    requests,
    run: () =>
      ReturnClass.returnBill(
        { contentType: 'pos', contentId: 'order', number: '001' },
        { ebarimtUrl: 'mock' },
        { _id: 'actor' },
      ),
  };
}
test('successful receipt return preserves originals and return rows', async () => {
  const fixture = returnFixture();
  const result = await fixture.run();
  assert.equal(result.length, 2);
  assert.equal(fixture.rows[0].state, 'inactive');
  assert.equal(fixture.rows[1].status, 'SUCCESS');
  assert.equal(fixture.rows[1].inactiveId, 'receipt');
  assert.equal(fixture.rows[1].userId, 'actor');
  assert.equal(fixture.requests[0].timeout, 10000);
});
for (const response of [500, new Error('network failure')]) {
  test(`failed receipt return keeps original active: ${String(
    response,
  )}`, async () => {
    const fixture = returnFixture([response]);
    const result = await fixture.run();
    assert.ok(result.error);
    assert.equal(fixture.rows[0].state, undefined);
    assert.equal(fixture.rows[1].status, 'ERROR');
  });
}
test('retry after partial receipt return keeps all original and return records', async () => {
  const fixture = returnFixture(
    [200, 500, 200],
    [
      { _id: 'a', id: 'receipt-a', date: '2026-10-04', status: 'SUCCESS' },
      { _id: 'b', id: 'receipt-b', date: '2026-10-04', status: 'SUCCESS' },
    ],
  );
  assert.ok((await fixture.run()).error);
  const result = await fixture.run();
  assert.equal(result.length, 5);
  assert.equal(fixture.rows[0].state, 'inactive');
  assert.equal(fixture.rows[1].state, 'inactive');
});
test('receipt return retry after order write failure does not resend DELETE', async () => {
  const fixture = returnFixture();
  await fixture.run();
  assert.equal((await fixture.run()).length, 2);
  assert.equal(fixture.requests.length, 1);
});
test('receipt missing its date cannot be marked returned', async () => {
  const fixture = returnFixture(
    [],
    [{ _id: 'original', id: 'receipt', status: 'SUCCESS' }],
  );
  assert.ok((await fixture.run()).error);
  assert.equal(fixture.requests.length, 0);
});

function mutationFixture(receiptResult, hasReceipt = true, overrides = {}) {
  const events = [];
  const order = {
    _id: 'order',
    posToken: 'pos',
    totalAmount: 100,
    cashAmount: 100,
    paidDate: new Date(),
    ...overrides,
  };
  const models = {
    Orders: {
      getOrder: async () => order,
      updateOne: async (_query, update) => {
        events.push('write');
        Object.assign(order, update.$set);
      },
      findOne: async () => order,
    },
    PutResponses: {
      exists: async (query) => query.status === 'SUCCESS' && hasReceipt,
      returnBill: async () => receiptResult,
    },
    OrderItems: { find: () => ({ lean: async () => [{ _id: 'item' }] }) },
  };
  const dependencies = {
    'erxes-api-shared/utils': {
      markResolvers: () => {},
      graphqlPubsub: { publish: async () => events.push('publish') },
      sendTRPCMessage: async (request) => {
        assert.equal(request.input.items.length, 1);
        events.push('sync');
      },
    },
    '~/modules/posclient/utils/assertPosUser': { assertPosUser: () => {} },
    '~/modules/posclient/utils/orderChangeLogs': {
      getOrderChangeSnapshot: async () => ({}),
      saveOrderChangeSnapshot: async (...args) => {
        assert.equal(args[5], 'return');
        events.push('audit');
      },
    },
    '@/posclient/db/definitions/constants': {
      ORDER_STATUSES: { RETURN: 'return' },
    },
  };
  const mutations = loadSource(
    '../../graphql/resolvers/mutations/orders.ts',
    dependencies,
  ).default;
  return {
    order,
    events,
    run: () =>
      mutations.ordersReturn(
        null,
        { _id: 'order', cashAmount: 100 },
        {
          models,
          subdomain: 'tenant',
          posUser: { _id: 'actor' },
          config: {
            token: 'pos',
            adminIds: ['actor'],
            ebarimtConfig: hasReceipt ? {} : undefined,
          },
        },
      ),
  };
}
test('failed fiscal return does not update or publish returned order', async () => {
  const fixture = mutationFixture({ error: 'receipt return rejected' });
  await assert.rejects(fixture.run(), {
    name: 'TypeError',
    message: 'receipt return rejected',
  });
  assert.deepEqual(fixture.events, []);
  assert.equal(fixture.order.returnInfo, undefined);
});
test('successful fiscal return retains order with return status and actor', async () => {
  const fixture = mutationFixture([{ _id: 'return' }]);
  await fixture.run();
  assert.equal(fixture.order.status, 'return');
  assert.equal(fixture.order.returnInfo.returnBy, 'actor');
  assert.deepEqual(fixture.events, ['write', 'audit', 'publish', 'sync']);
});
test('non-fiscal payment return does not require eBarimt config', async () => {
  const fixture = mutationFixture([], false);
  await fixture.run();
  assert.equal(fixture.order.status, 'return');
});
test('closed internal receipt order without eBarimt can be returned and retained', async () => {
  const fixture = mutationFixture([], false, { billType: '9' });
  await fixture.run();
  assert.equal(fixture.order._id, 'order');
  assert.equal(fixture.order.status, 'return');
  assert.equal(fixture.order.returnInfo.returnBy, 'actor');
  assert.equal(fixture.order.synced, false);
  assert.deepEqual(fixture.events, ['write', 'audit', 'publish', 'sync']);
});

function snapshotFixture() {
  const logs = [];
  const order = { status: 'new', totalAmount: 100 };
  const items = [
    { _id: 'item', productId: 'product', count: 1, unitPrice: 100 },
  ];
  const models = {
    Orders: { getOrder: async () => order },
    OrderItems: { find: () => ({ sort: () => ({ lean: async () => items }) }) },
    OrderChangeLogs: { createLog: async (doc) => logs.push(doc) },
  };
  const helpers = loadSource('../orderChangeLogs.ts', {});
  return { models, logs, order, items, ...helpers };
}
test('creation captures order and all items in one create log', async () => {
  const state = snapshotFixture();
  await state.saveOrderChangeSnapshot(
    state.models,
    'order',
    'pos',
    'actor',
    {},
    'create',
  );
  assert.equal(state.logs.length, 1);
  assert.equal(state.logs[0].action, 'create');
  assert.equal(state.logs[0].userId, 'actor');
  assert.equal(
    state.logs[0].changes.find((entry) => entry.field === 'items').newValue
      .length,
    1,
  );
});
for (const action of ['update', 'return']) {
  test(`changed snapshot records explicit ${action} action`, async () => {
    const state = snapshotFixture();
    const before = await state.getOrderChangeSnapshot(state.models, 'order');
    state.order.status = action === 'return' ? 'return' : 'done';
    await state.saveOrderChangeSnapshot(
      state.models,
      'order',
      'pos',
      'actor',
      before,
      action,
    );
    assert.equal(state.logs.length, 1);
    assert.equal(state.logs[0].action, action);
  });
}
test('unchanged snapshot still creates no log', async () => {
  const state = snapshotFixture();
  const before = await state.getOrderChangeSnapshot(state.models, 'order');
  await state.saveOrderChangeSnapshot(
    state.models,
    'order',
    'pos',
    'actor',
    before,
  );
  assert.equal(state.logs.length, 0);
});
test('backend log creation defaults source to order without changing action', async () => {
  let LogClass;
  const logs = [];
  const models = {
    OrderChangeLogs: {
      create: async (doc) => {
        logs.push(doc);
        return doc;
      },
    },
  };
  loadSource('../../db/models/OrderChangeLogs.ts', {
    '../definitions/orderChangeLogs': {
      orderChangeLogSchema: {
        loadClass: (value) => {
          LogClass = value;
        },
      },
    },
  }).loadOrderChangeLogClass(models);
  const log = await LogClass.createLog({
    action: 'cancel',
    posToken: 'pos',
    changes: [],
  });
  assert.equal(log.source, 'order');
  assert.equal(log.action, 'cancel');
  assert.ok(log.occurredAt);
});
for (const afterCount of [0, 1]) {
  test(`cart removal/reduction is an update action: remaining=${afterCount}`, async () => {
    let LogClass;
    const models = {
      OrderChangeLogs: {
        findOneAndUpdate: (_query, update) => ({
          orFail: async () => update.$setOnInsert,
        }),
      },
    };
    loadSource('../../db/models/OrderChangeLogs.ts', {
      '../definitions/orderChangeLogs': {
        orderChangeLogSchema: {
          loadClass: (value) => {
            LogClass = value;
          },
        },
      },
    }).loadOrderChangeLogClass(models);
    const item = {
      _id: 'item',
      productId: 'product',
      count: 2,
      unitPrice: 100,
    };
    const result = await LogClass.recordCartChange(
      {
        actorId: 'actor',
        cartId: 'cart',
        eventId: 'event',
        occurredAt: new Date(),
        beforeItems: [item],
        afterItems: afterCount ? [{ ...item, count: afterCount }] : [],
      },
      'pos',
      'actor',
    );
    assert.equal(result.source, 'cart');
    assert.equal(result.action, 'update');
    assert.equal(
      result.changes[1].newValue[0].action,
      afterCount ? 'decreased' : 'removed',
    );
  });
}
