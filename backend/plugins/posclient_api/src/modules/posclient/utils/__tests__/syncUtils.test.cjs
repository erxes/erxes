const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../syncUtils.ts');
const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const sourceModule = { exports: {} };
vm.runInNewContext(outputText, {
  module: sourceModule,
  exports: sourceModule.exports,
  process: { env: {} },
  require: () => ({}),
});
const { importProducts } = sourceModule.exports;

function fixture(products = [], categories = []) {
  let failImport = false;
  const models = {
    Products: {
      bulkWrite: async (operations) => {
        if (failImport) throw new Error('Product import failed');
        for (const { updateOne } of operations) {
          let product = products.find(
            ({ _id }) => _id === updateOne.filter._id,
          );
          if (!product) {
            product = { _id: updateOne.filter._id, tokens: [] };
            products.push(product);
          }
          Object.assign(product, updateOne.update.$set);
          product.tokens = [
            ...new Set([...product.tokens, updateOne.update.$addToSet.tokens]),
          ];
        }
      },
      distinct: async (field, filter) => [
        ...new Set(
          products
            .filter(({ tokens }) => tokens.includes(filter.tokens))
            .map((product) => product[field]),
        ),
      ],
    },
    ProductCategories: {
      find: () => ({
        lean: async () => categories.map(({ _id, order }) => ({ _id, order })),
      }),
      updateOne: async (filter, update) => {
        let category = categories.find(({ _id }) => _id === filter._id);
        if (!category) {
          category = { _id: filter._id, tokens: [] };
          categories.push(category);
        }
        Object.assign(category, update.$set);
        category.tokens = [
          ...new Set([...category.tokens, update.$addToSet.tokens]),
        ];
      },
      updateMany: async (filter, update) => {
        for (const category of categories) {
          if (
            category.tokens.includes(filter.tokens) &&
            !filter._id.$nin.includes(category._id)
          ) {
            category.tokens = category.tokens.filter(
              (token) => token !== update.$pull.tokens,
            );
          }
        }
      },
    },
  };
  return {
    categories,
    run: (groups) => importProducts('tenant', models, 'pos', groups),
    fail: () => {
      failImport = true;
    },
  };
}

test('removes only the current POS token from categories without its products', async () => {
  const { categories, run } = fixture(
    [{ _id: 'other-product', categoryId: 'other-only', tokens: ['other-pos'] }],
    [
      { _id: 'empty', tokens: ['pos', 'other-pos'] },
      { _id: 'other-only', tokens: ['pos', 'other-pos'] },
      { _id: 'unrelated', tokens: ['other-pos'] },
    ],
  );
  await run([]);
  assert.deepEqual(categories, [
    { _id: 'empty', tokens: ['other-pos'] },
    { _id: 'other-only', tokens: ['other-pos'] },
    { _id: 'unrelated', tokens: ['other-pos'] },
  ]);
});

test('checks final product assignments after all groups, including moved products', async () => {
  const { categories, run } = fixture(
    [{ _id: 'moved-product', categoryId: 'old', tokens: ['pos'] }],
    [{ _id: 'old', tokens: ['pos'] }],
  );
  await run([
    {
      categories: [
        { _id: 'new', products: [] },
        { _id: 'empty', products: [] },
      ],
    },
    {
      categories: [
        { _id: 'new', products: [{ _id: 'moved-product', categoryId: 'new' }] },
      ],
    },
  ]);
  assert.deepEqual(
    categories.map(({ _id, tokens }) => ({ _id, tokens })),
    [
      { _id: 'old', tokens: [] },
      { _id: 'new', tokens: ['pos'] },
      { _id: 'empty', tokens: [] },
    ],
  );
});

test('retains category tokens for existing products outside the imported groups', async () => {
  const { categories, run } = fixture(
    [{ _id: 'existing', categoryId: 'used', tokens: ['pos', 'other-pos'] }],
    [{ _id: 'used', tokens: ['pos', 'other-pos'] }],
  );
  await run([]);
  assert.deepEqual(categories[0].tokens, ['pos', 'other-pos']);
});

test('does not prune category tokens when product import fails', async () => {
  const { categories, run, fail } = fixture(
    [],
    [{ _id: 'existing', tokens: ['pos'] }],
  );
  fail();
  await assert.rejects(
    run([
      {
        categories: [
          { _id: 'new', products: [{ _id: 'product', categoryId: 'new' }] },
        ],
      },
    ]),
    /Product import failed/,
  );
  assert.deepEqual(categories[0].tokens, ['pos']);
});

test('retains parents of populated children while pruning empty siblings', async () => {
  const { categories, run } = fixture(
    [
      { _id: 'b-product', categoryId: 'b', tokens: ['pos'] },
      { _id: 'c-product', categoryId: 'c', tokens: ['pos'] },
      { _id: 'd-other-product', categoryId: 'd', tokens: ['other-pos'] },
    ],
    [
      { _id: 'a', order: 'A/', tokens: ['pos'] },
      { _id: 'b', order: 'A/B/', tokens: ['pos'] },
      { _id: 'c', order: 'A/C/', tokens: ['pos'] },
      { _id: 'd', order: 'A/D/', tokens: ['pos', 'other-pos'] },
    ],
  );
  await run([]);
  assert.deepEqual(
    categories.map(({ _id, tokens }) => ({ _id, tokens })),
    [
      { _id: 'a', tokens: ['pos'] },
      { _id: 'b', tokens: ['pos'] },
      { _id: 'c', tokens: ['pos'] },
      { _id: 'd', tokens: ['other-pos'] },
    ],
  );
});

test('retains all ancestor levels and prunes a wholly empty branch', async () => {
  const { categories, run } = fixture(
    [{ _id: 'product', categoryId: 'leaf', tokens: ['pos'] }],
    [
      { _id: 'root', order: '001/', tokens: ['pos'] },
      { _id: 'parent', order: '001/002/', tokens: ['pos'] },
      { _id: 'leaf', order: '001/002/003/', tokens: ['pos'] },
      { _id: 'empty-parent', order: '001/004/', tokens: ['pos'] },
      { _id: 'empty-leaf', order: '001/004/005/', tokens: ['pos'] },
    ],
  );
  await run([]);
  assert.deepEqual(
    categories.map(({ tokens }) => tokens),
    [['pos'], ['pos'], ['pos'], [], []],
  );
});

test('matches whole order prefixes without confusing similar codes or repeated codes', async () => {
  const { categories, run } = fixture(
    [{ _id: 'product', categoryId: 'b', tokens: ['pos'] }],
    [
      { _id: 'a', order: '01/', tokens: ['pos'] },
      { _id: 'b', order: '01/020/', tokens: ['pos'] },
      { _id: 'similar', order: '01/02/', tokens: ['pos'] },
      { _id: 'other-root', order: '020/', tokens: ['pos'] },
    ],
  );
  await run([]);
  assert.deepEqual(
    categories.map(({ tokens }) => tokens),
    [['pos'], ['pos'], [], []],
  );
});
