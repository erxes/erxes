const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { runInThisContext } = require('node:vm');
const ts = require('typescript');

const load = (file) => {
  const compiled = ts.transpileModule(
    readFileSync(path.join(__dirname, file), 'utf8'),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    },
  ).outputText;
  const exports = {};
  runInThisContext(`(function(exports) { ${compiled}\n})`)(exports);
  return exports;
};
const { getProductsDataPatches } = load('../productsDataPatches.ts');
const row = {
  _id: 'row',
  productId: 'product',
  product: { _id: 'product', name: 'Coffee' },
  unitPrice: 100,
  quantity: 2,
  amount: 200,
  discountInfos: [{ type: 'voucher', title: 'Voucher', amount: 10 }],
};

test('only the fields a footer edit changed are kept per row id', () => {
  const other = { ...row, _id: 'other' };
  const next = [{ ...row, unitPrice: 90, amount: 180 }, other];

  assert.deepEqual(getProductsDataPatches(next, [row, other]), {
    row: { unitPrice: 90, amount: 180 },
  });
});

test('unchanged rows produce no patches', () => {
  assert.deepEqual(
    getProductsDataPatches([JSON.parse(JSON.stringify(row))], [row]),
    {},
  );
});

test('rows added locally are not patches of a previous row', () => {
  assert.deepEqual(
    getProductsDataPatches([row, { ...row, _id: 'added' }], [row]),
    {},
  );
});

test('the row id and the loaded product object are never patched', () => {
  const next = [{ ...row, product: { _id: 'product', name: 'Renamed' } }];

  assert.deepEqual(getProductsDataPatches(next, [row]), {});
});

test('lists such as discount infos are compared by value', () => {
  const copied = [{ ...row, discountInfos: [{ ...row.discountInfos[0] }] }];
  const changed = [
    {
      ...row,
      discountInfos: [{ type: 'voucher', title: 'Voucher', amount: 20 }],
    },
  ];

  assert.deepEqual(getProductsDataPatches(copied, [row]), {});
  assert.deepEqual(getProductsDataPatches(changed, [row]), {
    row: { discountInfos: [{ type: 'voucher', title: 'Voucher', amount: 20 }] },
  });
});
