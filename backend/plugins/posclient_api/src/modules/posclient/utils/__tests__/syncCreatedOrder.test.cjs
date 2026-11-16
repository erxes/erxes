const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function loadSyncCreatedOrder(sent) {
  const filename = path.resolve(__dirname, '../syncCreatedOrder.ts');
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    module,
    exports: module.exports,
    require: (name) =>
      name === 'erxes-api-shared/utils'
        ? { sendTRPCMessage: async (message) => sent.push(message) }
        : { debugError: () => undefined },
  });
  return module.exports.syncCreatedOrder;
}

test('an automation-created order is sent to sales unpaid, with its items', async () => {
  const sent = [];
  const syncCreatedOrder = loadSyncCreatedOrder(sent);
  const models = {
    OrderItems: {
      find: () => ({ lean: async () => [{ _id: 'i1', productId: 'p1' }] }),
    },
    Orders: { getOrder: async (_id) => ({ _id, number: '1042' }) },
  };

  await syncCreatedOrder({
    subdomain: 'tenant',
    models,
    config: { token: 'pos-token' },
    order: { _id: 'o1' },
  });

  assert.equal(sent.length, 1);
  assert.equal(sent[0].action, 'createOrUpdateOrders');
  assert.deepEqual(sent[0].input.order, { _id: 'o1', number: '1042' });
  assert.equal(sent[0].input.posToken, 'pos-token');
  assert.equal(sent[0].input.items.length, 1);
});

test('a failed sync never fails creating the order', async () => {
  const syncCreatedOrder = loadSyncCreatedOrder([]);

  await syncCreatedOrder({
    subdomain: 'tenant',
    models: {
      OrderItems: {
        find: () => ({
          lean: async () => {
            throw new Error('down');
          },
        }),
      },
      Orders: { getOrder: async () => ({}) },
    },
    config: {},
    order: { _id: 'o2' },
  });
});
