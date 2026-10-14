const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

const load = (file) => {
  const compiled = ts.transpileModule(
    readFileSync(path.join(__dirname, file), 'utf8'),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    },
  ).outputText;
  const exports = {};
  new Function('exports', compiled)(exports);
  return exports;
};
const helpers = load('../productUom.ts');
const patches = load('../isPatchAppliedByServer.ts');
const product = {
  _id: 'product',
  uom: 'pcs',
  unitPrice: 100,
  subUoms: [{ uom: 'box', ratio: 0.1 }],
};
const row = {
  _id: 'row',
  product,
  uom: 'pcs',
  unitPrice: 100,
  quantity: 10,
  amount: 1000,
};
const box = {
  ...row,
  uomInfo: { uom: 'box', ratio: 0.1, unitPrice: 1000, quantity: 1 },
};

test('empty and incomplete entry information uses editable base-unit defaults', () => {
  for (const uomInfo of [undefined, {}, { uom: 'pcs' }]) {
    assert.deepEqual(helpers.normalizeProductUom({ ...row, uomInfo }).uomInfo, {
      uom: 'pcs',
      ratio: 1,
      unitPrice: 100,
      quantity: 10,
    });
  }
});

test('entry price and quantity are the source for base-unit calculations', () => {
  const normalized = helpers.normalizeProductUom({
    ...box,
    uomInfo: { ...box.uomInfo, unitPrice: 2000, quantity: 3 },
  });
  assert.equal(normalized.unitPrice, 200);
  assert.equal(normalized.quantity, 30);
  assert.equal(normalized.uom, 'pcs');
});

test('switching units preserves base values when entry values are rescaled', () => {
  const changed = helpers.normalizeProductUom({ ...row, uomInfo: box.uomInfo });
  assert.equal(changed.unitPrice, row.unitPrice);
  assert.equal(changed.quantity, row.quantity);
  assert.equal(
    changed.quantity * changed.unitPrice,
    box.uomInfo.quantity * box.uomInfo.unitPrice,
  );
});

test('advanced base price and quantity edits update the entry values using the saved ratio', () => {
  const result = helpers.syncProductUomInfo({
    ...box,
    unitPrice: 200,
    quantity: 35,
  });
  assert.deepEqual(result.uomInfo, {
    uom: 'box',
    ratio: 0.1,
    unitPrice: 2000,
    quantity: 3.5,
  });
});

test('saved ratios, selections and cached base units survive catalog changes', () => {
  const result = helpers.normalizeProductUom(box, {
    ...product,
    uom: 'new-base',
    subUoms: [],
  });
  assert.equal(result.uom, 'pcs');
  assert.deepEqual(result.uomInfo, box.uomInfo);
});

test('zero values are preserved and decimal conversion avoids floating-point artifacts', () => {
  const result = helpers.normalizeProductUom({
    ...box,
    uomInfo: { ...box.uomInfo, quantity: 1.2, unitPrice: 0 },
  });
  assert.equal(result.quantity, 12);
  assert.equal(result.unitPrice, 0);
});

test('unknown saved units remain offered while invalid new ratios are disabled', () => {
  assert.ok(helpers.getProductUomCodes(product, 'legacy').includes('legacy'));
  for (const ratio of [0, -1, 'bad', Infinity, null]) {
    assert.equal(
      helpers.getProductUomRatio(
        { ...product, subUoms: [{ uom: 'box', ratio }] },
        'box',
      ),
      undefined,
    );
  }
});

test('server acknowledgements compare the full entry info by value', () => {
  const patch = { uomInfo: box.uomInfo };
  assert.equal(
    patches.isPatchAppliedByServer(JSON.parse(JSON.stringify(box)), patch),
    true,
  );
  assert.equal(
    patches.isPatchAppliedByServer(
      { ...box, uomInfo: { ...box.uomInfo, quantity: 2 } },
      patch,
    ),
    false,
  );
});

test('base-unit saves acknowledge omitted info and remain editable from root fields', () => {
  const info = { uom: 'pcs', ratio: 1, unitPrice: 200, quantity: 3 };
  const saved = { ...row, unitPrice: 200, quantity: 3 };
  assert.equal(patches.isPatchAppliedByServer(saved, { uomInfo: info }), true);
  assert.equal(patches.isPatchAppliedByServer(row, { uomInfo: info }), false);
  assert.deepEqual(helpers.getProductUomInfo(saved), info);
  assert.equal(
    helpers.getProductBaseUom({
      ...saved,
      product: { ...product, uom: 'new-base' },
    }),
    'pcs',
  );
});

test('selection defaults use base values without rounding when returning to base UOM', () => {
  const unitPrice = 1.2345678901234567;
  const quantity = 2.345678901234567;
  const info = helpers.getProductUomInfo({
    ...box,
    unitPrice,
    quantity,
    uomInfo: { uom: 'pcs', ratio: 1 },
  });
  assert.equal(info.unitPrice, unitPrice);
  assert.equal(info.quantity, quantity);
});

test('product replacement clears the previous unit selection and derives new base entry values', () => {
  const result = helpers.syncProductUomInfo({
    ...box,
    product: { ...product, uom: 'kg', unitPrice: 300 },
    uom: 'kg',
    unitPrice: 300,
    uomInfo: undefined,
  });
  assert.deepEqual(result.uomInfo, {
    uom: 'kg',
    ratio: 1,
    unitPrice: 300,
    quantity: 10,
  });
});

test('UOM choices retain a cached base unit and deduplicate saved and catalog selections', () => {
  assert.deepEqual(
    helpers.getProductUomCodes(
      {
        ...product,
        uom: 'new-base',
        subUoms: [
          { uom: 'box', ratio: 0.1 },
          { uom: 'box', ratio: 0.1 },
        ],
      },
      'box',
      'pcs',
    ),
    ['pcs', 'box', 'new-base'],
  );
});
