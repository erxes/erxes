const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../orderChangeLog.ts');
const moduleObject = { exports: {} };
vm.runInNewContext(
  ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: moduleObject.exports, module: moduleObject },
);
const { orderNumber } = moduleObject.exports.default;
const log = { orderId: 'order', posToken: 'pos', changes: [] };

test('resolves the number from a POS-scoped existing order', async () => {
  const context = {
    config: { token: 'pos' },
    models: {
      Orders: {
        findOne: (query) => {
          assert.equal(query._id, 'order');
          assert.equal(query.$or[0].posToken, 'pos');
          assert.equal(query.$or[1].subToken, 'pos');
          return { select: () => ({ lean: async () => ({ number: '001' }) }) };
        },
      },
    },
  };
  assert.equal(await orderNumber(log, {}, context), '001');
});

test('cancellation snapshots supply the number without querying orders', async () => {
  assert.equal(
    await orderNumber(
      { ...log, changes: [{ field: 'order', oldValue: { number: '002' } }] },
      {},
      { config: { token: 'pos' }, models: {} },
    ),
    '002',
  );
});

test('earlier events of deleted orders use the POS-owned cancellation log', async () => {
  const context = {
    config: { token: 'pos' },
    models: {
      Orders: {
        findOne: () => ({ select: () => ({ lean: async () => null }) }),
      },
      OrderChangeLogs: {
        findOne: (query) => {
          assert.equal(query.orderId, 'order');
          assert.equal(query.posToken, 'pos');
          assert.equal(query.action, 'cancel');
          return {
            sort: () => ({
              lean: async () => ({
                changes: [{ field: 'order', oldValue: { number: '003' } }],
              }),
            }),
          };
        },
      },
    },
  };
  assert.equal(await orderNumber(log, {}, context), '003');
});

test('unsaved carts and another POS cannot resolve an order number', async () => {
  const context = { config: { token: 'other' }, models: {} };
  assert.equal(await orderNumber(log, {}, context), null);
  assert.equal(
    await orderNumber({ ...log, orderId: undefined }, {}, context),
    null,
  );
});
