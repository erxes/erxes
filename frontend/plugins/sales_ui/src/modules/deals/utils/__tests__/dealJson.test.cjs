const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');
const { runInThisContext } = require('node:vm');

const load = (file) => {
  const compiled = ts.transpileModule(
    readFileSync(path.join(__dirname, file), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const exports = {};
  runInThisContext(`(function(exports, require) { ${compiled}\n})`)(
    exports,
    require,
  );
  return exports;
};
const json = load('../dealJson.ts');
const { toDealSubscriptionFilter } = load('../dealSubscriptionFilter.ts');
const { resolveDealDetail } = load('../resolveDealDetail.ts');
const uom = load('../../cards/components/detail/product/utils/productUom.ts');
const discounts = load(
  '../../cards/components/detail/product/utils/discountInfos.ts',
);

const row = {
  _id: 'row',
  productId: 'product',
  quantity: 1.5,
  unitPrice: 100,
  amount: 140,
  discountInfos: [{ type: 'voucher', amount: 10, campaignId: 'campaign' }],
  information: { reservationId: 'reservation' },
};

test('product validation preserves fractional amounts and extension fields on a save round trip', () => {
  const [parsed] = json.parseDealProducts([row]);
  assert.deepEqual(parsed, row);
  const edited = discounts.applyRowDiscount(parsed, 25);
  assert.deepEqual(edited.information, row.information);
  assert.equal(edited.discountInfos[0].campaignId, 'campaign');
  assert.equal(edited.discountInfos[1].amount, 15);
  assert.equal(edited.amount, 125);
});

test('nullable and incomplete legacy product rows keep existing UOM fallbacks', () => {
  const [parsed] = json.parseDealProducts([
    {
      _id: 'legacy',
      productId: 'product',
      unitPrice: null,
      quantity: null,
      uomInfo: null,
      discountInfos: [{ type: null, amount: null, title: null }],
    },
  ]);
  assert.equal(parsed.unitPrice, null);
  assert.deepEqual(uom.getProductUomInfo(parsed), {
    uom: '',
    ratio: 1,
    unitPrice: 0,
    quantity: 0,
  });
  assert.equal(discounts.nonHandDiscountAmount(parsed), 0);
  assert.deepEqual(json.parseDealProducts(null), []);
});

test('legacy rows without identifiers remain readable and unchanged on round trips', () => {
  const legacy = {
    productId: 'product',
    quantity: 1.5,
    unitPrice: 100,
    amount: 150,
    information: { booking: 'legacy-booking' },
  };
  const parsed = json.toDealDetail({
    _id: 'deal',
    productsData: [legacy, { ...legacy, _id: null }],
  });
  assert.deepEqual(parsed.productsData, [legacy, { ...legacy, _id: null }]);
  assert.equal(Object.hasOwn(parsed.productsData[0], '_id'), false);
  assert.deepEqual(
    json.parseDealProductMutation({ productsData: parsed.productsData }),
    parsed.productsData,
  );
});

test('malformed editable products and money fail instead of becoming an empty save', () => {
  for (const value of [
    {},
    '[]',
    [null],
    [{ ...row, amount: '140' }],
    [{ ...row, quantity: Infinity }],
  ]) {
    assert.throws(() => json.parseDealProducts(value));
  }
  assert.throws(() =>
    json.paymentsDataSchema.parse({ cash: { amount: '100' } }),
  );
  assert.throws(() => json.paymentsDataSchema.parse({ cash: null }));
});

test('a product mutation must contain a valid complete row list, including an explicit empty list', () => {
  assert.deepEqual(json.parseDealProductMutation({ productsData: [] }), []);
  assert.deepEqual(json.parseDealProductMutation({ productsData: [row] }), [
    row,
  ]);
  for (const value of [
    undefined,
    null,
    {},
    { productsData: null },
    { productsData: [null] },
  ]) {
    assert.throws(() => json.parseDealProductMutation(value));
  }
});

test('payment data retains provider metadata and zero amounts', () => {
  const payment = {
    cash: {
      amount: 0,
      currency: 'MNT',
      info: { receipt: 'receipt' },
      provider: 'provider',
    },
  };
  assert.deepEqual(json.paymentsDataSchema.parse(payment), payment);
  const [type] = json.paymentTypesSchema.parse([
    {
      type: 'cash',
      icon: null,
      config: { notSplit: true },
      extra: 'preserved',
    },
  ]);
  assert.equal(type.title, '');
  assert.equal(type.icon, '');
  assert.equal(type.config, '{"notSplit":true}');
  assert.equal(type.extra, 'preserved');
  assert.throws(() => json.paymentTypesSchema.parse([{ type: 42 }]));
});

test('detail parsing retains extras and accepts nullable GraphQL product list members', () => {
  const deal = json.toDealDetail({
    _id: 'deal',
    productsData: [row],
    products: [
      null,
      {
        _id: 'product',
        subUoms: [null, { uom: 'box', ratio: 0.1 }],
        tagIds: [null, 'tag'],
      },
    ],
    propertiesData: { custom: ['value'] },
    paymentsData: null,
    mobileAmounts: null,
    extraData: { voucherId: null, custom: { enabled: true } },
    pipeline: { _id: 'pipeline', paymentTypes: null },
  });
  assert.equal(deal.products.length, 1);
  assert.deepEqual(deal.products[0].subUoms, [{ uom: 'box', ratio: 0.1 }]);
  assert.deepEqual(deal.products[0].tagIds, ['tag']);
  assert.deepEqual(deal.extraData.custom, { enabled: true });
  assert.deepEqual(deal.propertiesData.custom, ['value']);
  assert.deepEqual(deal.pipeline.paymentTypes, []);
  assert.throws(() =>
    json.toDealDetail({ ...deal, productsData: [{ quantity: 'invalid' }] }),
  );
});

test('subscription filters preserve clearing and normalize GraphQL singleton list coercion', () => {
  const result = toDealSubscriptionFilter({
    stageId: 'stage',
    _ids: 'deal',
    tagIds: [],
    assignedUserIds: ['user'],
    companyIds: null,
    search: 'literal.*',
    limit: 20,
  });
  assert.deepEqual(result._ids, ['deal']);
  assert.deepEqual(result.tagIds, []);
  assert.deepEqual(result.assignedUserIds, ['user']);
  assert.equal(result.companyIds, null);
  assert.equal(result.stageId, 'stage');
  assert.equal(result.search, 'literal.*');
  assert.equal(toDealSubscriptionFilter(undefined), undefined);
});

test('incomplete subscription metadata cannot roll back an archive or cleared field', () => {
  const previous = {
    _id: 'deal',
    status: 'active',
    pipeline: { _id: 'pipeline', paymentTypes: [] },
    products: [{ _id: 'product', name: 'Product' }],
    startDate: '2026-10-15',
    tagIds: ['tag'],
  };
  const current = {
    ...previous,
    status: 'archived',
    pipeline: null,
    products: null,
    startDate: null,
    tagIds: [],
  };
  const result = resolveDealDetail(current, previous, 'deal');
  assert.equal(result.status, 'archived');
  assert.equal(result.startDate, null);
  assert.deepEqual(result.tagIds, []);
  assert.deepEqual(result.pipeline, previous.pipeline);
  assert.deepEqual(result.products, previous.products);
  assert.equal(resolveDealDetail(current, previous, 'another-deal'), undefined);
  assert.equal(resolveDealDetail(current, undefined, 'deal'), undefined);
  assert.equal(resolveDealDetail(previous, current, 'deal'), previous);
});

test('legacy numeric payment totals allow detail parsing and survive payment edits', () => {
  for (const totalAmount of [0, 150.5]) {
    const payments = {
      totalAmount,
      cash: { amount: 100, currency: 'MNT', provider: 'legacy' },
    };
    const deal = json.toDealDetail({ _id: 'deal', paymentsData: payments });
    assert.deepEqual(deal.paymentsData, payments);
    assert.equal(
      json.readDealPayment(deal.paymentsData, 'totalAmount'),
      undefined,
    );
    assert.equal(json.readDealPayment(deal.paymentsData, 'missing'), undefined);
    const edited = {
      ...deal.paymentsData,
      cash: { ...json.readDealPayment(deal.paymentsData, 'cash'), amount: 120 },
    };
    assert.deepEqual(json.paymentsDataSchema.parse(edited), {
      totalAmount,
      cash: { amount: 120, currency: 'MNT', provider: 'legacy' },
    });
  }
  for (const payments of [
    { cash: 100 },
    { totalAmount: '100' },
    { totalAmount: Infinity },
    { totalAmount: 100, cash: { amount: '100' } },
  ]) {
    assert.throws(() =>
      json.toDealDetail({ _id: 'deal', paymentsData: payments }),
    );
  }
});
