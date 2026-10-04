const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function fixture({
  order = { _id: 'order', posToken: 'pos', posId: 'config' },
  receipts = [],
  failure,
  enabled = true,
} = {}) {
  const events = [];
  const models = {
    Pos: { findOne: () => ({ lean: async () => ({ _id: 'config' }) }) },
    PosOrders: {
      findOne: () => ({ lean: async () => order }),
      deleteOne: async (query) => {
        assert.equal(query.posToken, 'pos');
        events.push('delete');
      },
    },
  };
  const filename = path.resolve(__dirname, '../cancelOrder.ts');
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const module = { exports: {} };
  vm.runInNewContext(
    outputText,
    {
      module,
      exports: module.exports,
      require: () => ({
        isEnabled: async () => enabled,
        sendTRPCMessage: async (request) => {
          assert.equal(request.subdomain, 'tenant');
          assert.equal(request.throwOnError, true);
          events.push(request.action);
          if (request.action === failure)
            throw new Error('service unavailable');
          return request.action === 'find' ? receipts : null;
        },
      }),
    },
    { filename },
  );
  return {
    events,
    run: () =>
      module.exports.cancelSyncedPosOrder(models, 'tenant', {
        _id: 'order',
        posToken: 'pos',
      }),
  };
}

test('synced order without successful receipts is refunded and deleted', async () => {
  const state = fixture();
  assert.equal((await state.run()).cancelled, true);
  assert.deepEqual(state.events, ['find', 'refund', 'delete']);
});
test('missing order is an idempotent successful cancellation', async () => {
  const state = fixture({ order: null });
  assert.equal((await state.run()).cancelled, true);
  assert.deepEqual(state.events, ['find']);
});
for (const billType of ['1', '9']) {
  test(`paid sales order without eBarimt cannot be cancelled: billType=${billType}`, async () => {
    const state = fixture({
      order: {
        _id: 'order',
        posToken: 'pos',
        posId: 'config',
        paidDate: new Date(),
        billType,
      },
    });
    await assert.rejects(state.run(), /Paid orders cannot be cancelled/);
    assert.deepEqual(state.events, []);
  });
}
test('successful or unresolved receipt preserves sales order', async () => {
  const state = fixture({ receipts: [{ _id: 'receipt' }] });
  await assert.rejects(state.run(), /eBarimt/);
  assert.deepEqual(state.events, ['find']);
});
for (const failure of ['find', 'refund']) {
  test(`${failure} failure prevents sales deletion`, async () => {
    const state = fixture({ failure });
    await assert.rejects(state.run(), /unavailable/);
    assert.equal(state.events.includes('delete'), false);
  });
}
test('unconfirmed receipt query prevents deletion', async () => {
  const state = fixture({ receipts: null });
  await assert.rejects(state.run(), /Unable to verify/);
  assert.equal(state.events.includes('delete'), false);
});
for (const order of [
  { posId: 'other', posToken: 'pos' },
  { posId: 'config', posToken: 'other' },
  { posId: 'config', posToken: 'pos', status: 'return' },
]) {
  test(`cross-POS and returned orders are retained: ${JSON.stringify(
    order,
  )}`, async () => {
    const state = fixture({ order });
    await assert.rejects(state.run());
    assert.deepEqual(state.events, []);
  });
}
test('optional Mongolian plugin is not required for non-fiscal cancellation', async () => {
  const state = fixture({ enabled: false });
  await state.run();
  assert.deepEqual(state.events, ['refund', 'delete']);
});
