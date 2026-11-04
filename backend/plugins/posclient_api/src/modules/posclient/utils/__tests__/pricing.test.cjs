const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function load(filename, dependencies = {}) {
  const sourceModule = { exports: {} };
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  vm.runInNewContext(outputText, {
    module: sourceModule,
    exports: sourceModule.exports,
    require: (name) => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return sourceModule.exports;
}

const discountInfos = load(path.resolve(__dirname, '../discountInfos.ts'));

function fixture(pricing) {
  let nextId = 0;
  let request;
  const { checkPricing } = load(path.resolve(__dirname, '../pricing.ts'), {
    nanoid: { nanoid: () => `bonus-${++nextId}` },
    'erxes-api-shared/utils': {
      sendTRPCMessage: async (input) => {
        request = input;
        return pricing;
      },
    },
    './discountInfos': discountInfos,
  });
  return {
    checkPricing,
    run: (items) => checkPricing('tenant-a', { items, totalAmount: 0 }, {}),
    request: () => request,
  };
}

const paidItem = (id = 'paid-a', productId = 'a', count = 2) => ({
  _id: id,
  productId,
  count,
  unitPrice: 100,
});

test('same-product bonus adds a free unit without reducing paid price or count', async () => {
  const f = fixture({ 'paid-a': { value: 0, bonusProducts: ['a'] } });
  const { items } = await f.run([paidItem()]);
  assert.equal(items.length, 2);
  assert.equal(items[0].unitPrice, 100);
  assert.equal(items[0].count, 2);
  assert.equal(items[0].discountAmount, 0);
  assert.equal(items[1].productId, 'a');
  assert.equal(items[1].unitPrice, 0);
  assert.equal(items[1].count, 1);
  assert.equal(items[1].isPackage, true);
  assert.notEqual(items[1]._id, items[0]._id);
  assert.equal(
    items.reduce((sum, i) => sum + i.count * i.unitPrice, 0),
    200,
  );
  assert.equal(f.request().subdomain, 'tenant-a');
  assert.equal(f.request().input.products.length, 1);
});

test('bonus keeps every existing line for that product intact and aggregates rewards', async () => {
  const f = fixture({
    'paid-a': { value: 0, bonusProducts: ['b', 'b'] },
    'paid-b': { value: 0, bonusProducts: ['b'] },
  });
  const { items } = await f.run([
    paidItem(),
    paidItem('paid-b', 'b'),
    paidItem('other-b', 'b', 1),
  ]);
  assert.equal(items.length, 4);
  assert.deepEqual(
    items.slice(0, 3).map((i) => i.unitPrice),
    [100, 100, 100],
  );
  assert.equal(items[3].productId, 'b');
  assert.equal(items[3].count, 3);
  assert.equal(items[3].unitPrice, 0);
});

test('distinct bonus products get distinct generated line IDs', async () => {
  const f = fixture({ 'paid-a': { value: 0, bonusProducts: ['b', 'c'] } });
  const { items } = await f.run([paidItem()]);
  assert.equal(items.length, 3);
  assert.equal(new Set(items.map((i) => i._id)).size, 3);
  assert.ok(items.slice(1).every((i) => i.unitPrice === 0 && i.isPackage));
});

test('ordinary pricing discount and existing manual discount information survive', async () => {
  const f = fixture({ 'paid-a': { value: 10, bonusProducts: ['a'] } });
  const item = paidItem();
  item.discountInfos = [{ type: 'hand', amount: 5, percent: 2.5 }];
  const { items } = await f.run([item]);
  assert.equal(items[0].unitPrice, 90);
  assert.equal(items[0].discountAmount, 25);
  assert.equal(items[0].discountInfos.find((i) => i.type === 'hand').amount, 5);
  assert.equal(items[1].unitPrice, 0);
});

test('no applicable pricing leaves paid lines alone', async () => {
  const { items } = await fixture({}).run([paidItem()]);
  assert.equal(items.length, 1);
  assert.equal(items[0].unitPrice, 100);
});

test('saving again rebuilds bonuses and removes them below the threshold', async () => {
  const { checkPricing } = load(path.resolve(__dirname, '../pricing.ts'), {
    nanoid: { nanoid: () => 'generated-bonus' },
    'erxes-api-shared/utils': {
      sendTRPCMessage: async ({ input }) =>
        Object.fromEntries(
          input.products.map((item) => [
            item.itemId,
            {
              value: 0,
              bonusProducts: Array(Math.floor(item.quantity / 2)).fill('a'),
            },
          ]),
        ),
    },
    './discountInfos': discountInfos,
  });
  const constants = load(
    path.resolve(__dirname, '../../db/definitions/constants.ts'),
  );
  const { prepareOrderDoc } = load(
    path.resolve(__dirname, '../orderUtils.ts'),
    {
      moment: {},
      nanoid: {},
      './directDiscount': { checkDirectDiscount: (doc) => doc },
      './discountInfos': discountInfos,
      './loyalties': { checkLoyalties: async (_, doc) => doc },
      './pricing': { checkPricing },
      './products': {},
      'erxes-api-shared/utils': {},
      '~/modules/posclient/db/definitions/constants': constants,
      '~/modules/posclient/db/models/PutData': {},
      '~/modules/posclient/utils': {},
    },
  );
  const models = {
    Products: {
      find: () => ({
        lean: async () => [{ _id: 'a', prices: { pos: 100 }, type: 'product' }],
      }),
    },
  };
  const config = { token: 'pos' };
  const save = (doc) => prepareOrderDoc('tenant-a', doc, config, models);
  const first = await save({
    items: [paidItem()],
    type: 'eat',
    totalAmount: 200,
  });
  assert.equal(first.items.length, 2);
  const second = await save(first);
  assert.equal(second.items.length, 2);
  assert.equal(second.items[0].unitPrice, 100);
  assert.equal(second.items[0].count, 2);
  assert.equal(second.items[1].unitPrice, 0);
  second.items[0].count = 1;
  const reduced = await save(second);
  assert.equal(reduced.items.length, 1);
  assert.equal(reduced.items[0].unitPrice, 100);
});
