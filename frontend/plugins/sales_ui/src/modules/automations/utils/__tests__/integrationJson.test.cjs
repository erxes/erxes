const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { runInThisContext } = require('node:vm');
const ts = require('typescript');

const MODULES = path.resolve(__dirname, '../../..');

const load = (file) => {
  const compiled = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  const resolve = (name) =>
    name.startsWith('@/')
      ? load(path.join(MODULES, `${name.slice(2)}.ts`))
      : require(name);
  runInThisContext(`(function(exports, require) { ${compiled}\n})`)(
    exports,
    resolve,
  );
  return exports;
};

const { toSourceTriggers } = load(
  path.join(MODULES, 'automations/utils/sourceTriggers.ts'),
);
const { toDealPosPaidAmounts, sumPaidTransactionsByKind } = load(
  path.join(MODULES, '../widgets/relation/utils/posOrderPaidAmounts.ts'),
);

test('source triggers keep matching types and only object configs', () => {
  const triggers = [
    null,
    { id: 'a', type: 'sales:pos', config: { posId: 'pos', custom: 1 } },
    { id: 'b', type: 'sales:pos', config: 'legacy' },
    { id: 'c', type: 'sales:pos', config: ['posId'] },
    { id: 'd', type: 'sales:deal', config: { pipelineId: 'p' } },
    { id: 'e', type: null, config: {} },
  ];
  assert.deepEqual(toSourceTriggers(triggers, ['sales:pos']), [
    { type: 'sales:pos', config: { posId: 'pos', custom: 1 } },
    { type: 'sales:pos', config: undefined },
    { type: 'sales:pos', config: undefined },
  ]);
  assert.deepEqual(toSourceTriggers(null, ['sales:pos']), []);
});

test('deal POS paid amounts list array entries as before and skip non-objects', () => {
  assert.deepEqual(
    toDealPosPaidAmounts([
      { type: 'qpay', amount: 500, title: 'QPay', extra: true },
      { type: 'card', amount: '250' },
      { type: 'golomt', amount: 'n/a' },
      null,
      'cash',
    ]),
    [
      { type: 'qpay', title: 'QPay', amount: 500 },
      { type: 'card', title: '', amount: 250 },
      { type: 'golomt', title: '', amount: 0 },
    ],
  );
  assert.deepEqual(toDealPosPaidAmounts({ qpay: 500 }), []);
  assert.deepEqual(toDealPosPaidAmounts(null), []);
});

test('deal POS paid transactions total by kind and skip unpaid or null rows', () => {
  assert.deepEqual(
    sumPaidTransactionsByKind([
      null,
      { _id: 'a', transactions: null },
      {
        _id: 'b',
        transactions: [
          { _id: '1', paymentKind: 'qpay', amount: 300, status: 'paid' },
          { _id: '2', paymentKind: 'qpay', amount: 200, status: 'paid' },
          { _id: '3', paymentKind: null, amount: 50, status: 'paid' },
          { _id: '4', paymentKind: 'qpay', amount: 999, status: 'pending' },
          null,
        ],
      },
    ]),
    { qpay: 500, mobile: 50 },
  );
  assert.deepEqual(sumPaidTransactionsByKind(undefined), {});
});
