const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { runInThisContext } = require('node:vm');
const ts = require('typescript');
const { InMemoryCache, gql } = require('@apollo/client');

const load = (filename) => {
  const file = path.resolve(__dirname, filename);
  const compiled = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  const resolve = (name) => {
    if (name === 'erxes-ui') return { isDefined: (value) => value != null };
    if (name.startsWith('.'))
      return load(path.resolve(path.dirname(file), `${name}.ts`));
    return require(name);
  };
  runInThisContext(`(function(exports, require) { ${compiled}\n})`)(
    exports,
    resolve,
  );
  return exports;
};
const { toPosDetail, restorePosPaymentConfig, restorePosPaymentText } =
  load('../posJson.ts');
const { cleanData } = load('../cleanData.ts');
const {
  toPosOrderDetail,
  toPosOrderRow,
  toPosItemRow,
  parsePosPaidAmounts,
  preserveUntypedPosPayments,
  readPosData,
  mergePosSummaryPages,
} = load('../posOrderJson.ts');
const { updateCacheAfterRemove } = load('../updatePosCoversCache.ts');
const { getNextPosSelectorPage } = load('../posSelectorPage.ts');

test('settings retain nested extension keys, nullable fields, and legacy numeric timers', () => {
  const input = {
    _id: 'pos',
    uiOptions: {
      logo: null,
      colors: { bodyColor: '#123456', custom: 'keep' },
      custom: { x: true },
    },
    kitchenScreen: { value: 30, contentUrl: null, custom: 'screen' },
    waitingScreen: { value: '10' },
    deliveryConfig: { assignedUserIds: [null, 'user'], custom: { value: 0 } },
    permissionConfig: { cashiers: { seeReport: false, custom: true } },
    paymentTypes: [
      {
        _id: 'payment',
        type: 'custom',
        config: { notSplit: true },
        title: null,
        extra: 0,
      },
    ],
    earnTier: { accountTypeId: null, bands: null, onlyUpgrade: null },
    customerCreateConfig: {
      enabled: true,
      layout: [['primaryEmail', 'property:custom']],
    },
  };
  const parsed = toPosDetail(input);
  for (const key of Object.keys(input))
    assert.deepEqual(parsed[key], input[key]);
  assert.notEqual(parsed.uiOptions, input.uiOptions);
  assert.deepEqual(cleanData(parsed.uiOptions), input.uiOptions);
  assert.deepEqual(
    toPosDetail({ _id: 'empty', paymentTypes: null }).paymentTypes,
    [],
  );
});

test('saving an unchanged structured payment config retains its JSON type', () => {
  for (const original of [
    { notSplit: true, provider: { key: 'value' } },
    [1, 2],
    false,
    12,
  ]) {
    assert.deepEqual(
      restorePosPaymentConfig(JSON.stringify(original), original),
      original,
    );
  }
  assert.equal(
    restorePosPaymentConfig('{"changed":true}', { notSplit: true }),
    '{"changed":true}',
  );
  assert.equal(restorePosPaymentConfig('plain text', 'old'), 'plain text');
  assert.equal(restorePosPaymentConfig(undefined, undefined), undefined);
});

test('configuration cleanup removes Apollo metadata without dropping extension values', () => {
  const input = {
    __typename: 'Config',
    _id: null,
    name: null,
    flag: false,
    zero: 0,
    rows: [
      {
        __typename: 'Row',
        _id: 'keep',
        value: null,
        extra: { __typename: 'Extra', code: 'x' },
      },
      null,
    ],
  };
  assert.deepEqual(cleanData(input), {
    name: null,
    flag: false,
    zero: 0,
    rows: [{ _id: 'keep', value: null, extra: { code: 'x' } }, null],
  });
  assert.equal(input.__typename, 'Config');
});

test('payment amounts support current arrays and legacy maps including numeric strings', () => {
  assert.deepEqual(
    parsePosPaidAmounts([
      { type: 'custom', amount: '125.5', title: null, provider: 'keep' },
      null,
    ]),
    [{ type: 'custom', amount: 125.5, title: null, provider: 'keep' }],
  );
  assert.deepEqual(parsePosPaidAmounts({ cash: '10.5', mobile: 0 }), [
    { type: 'cash', amount: 10.5 },
    { type: 'mobile', amount: 0 },
  ]);
  assert.deepEqual(parsePosPaidAmounts(null), []);
});

test('legacy untyped payments do not prevent loading order lists or details', () => {
  const paidAmounts = [
    { type: null, amount: 100, info: { receipt: 'keep' } },
    { amount: 200 },
    { type: '', amount: 0 },
    { type: 'qpay', amount: 300 },
  ];
  const order = { _id: 'legacy', items: [], paidAmounts };
  for (const read of [toPosOrderRow, toPosItemRow, toPosOrderDetail]) {
    const result = readPosData(() =>
      read === toPosItemRow ? read({ ...order, items: null }) : read(order),
    );
    assert.equal(result.error, undefined);
    assert.deepEqual(result.value.paidAmounts, paidAmounts);
  }
});

test('editing named payments preserves untyped amounts and metadata in the save payload', () => {
  const original = [
    { type: null, amount: 100, info: { receipt: 'keep' } },
    { amount: 200 },
    { type: '', amount: 0 },
    { type: 'qpay', amount: 300 },
  ];
  const edited = [{ type: 'qpay', amount: 400 }];
  const result = preserveUntypedPosPayments(edited, original);
  assert.deepEqual(result, [edited[0], ...original.slice(0, 3)]);
  assert.equal(
    result.reduce((sum, payment) => sum + payment.amount, 0),
    700,
  );
  assert.deepEqual(preserveUntypedPosPayments(edited, undefined), edited);
  assert.equal(original.length, 4);
});

test('summary pagination retains the previous result when either JSON page is malformed', () => {
  const previous = {
    posOrdersGroupSummary: {
      amounts: [{ paidDate: '2026-10-15', totalAmount: 100 }],
      columns: { qpay: 'QPay' },
    },
  };
  for (const posOrdersGroupSummary of [
    { amounts: {} },
    { amounts: [{ totalAmount: {} }] },
    { amounts: [], columns: [] },
    null,
  ]) {
    assert.equal(
      mergePosSummaryPages(previous, { posOrdersGroupSummary }),
      previous,
    );
  }
  const invalidPrevious = { posOrdersGroupSummary: { amounts: {} } };
  assert.equal(
    mergePosSummaryPages(invalidPrevious, previous),
    invalidPrevious,
  );
  assert.equal(mergePosSummaryPages(previous, undefined), previous);
});

test('valid summary pagination appends rows and retains or replaces column labels', () => {
  const previous = {
    posOrdersGroupSummary: {
      amounts: [{ paidDate: '2026-10-15', totalAmount: 100 }],
      columns: { qpay: 'QPay' },
    },
  };
  const next = { posOrdersGroupSummary: { amounts: [{ totalAmount: '200' }] } };
  const result = mergePosSummaryPages(previous, next);
  assert.deepEqual(result.posOrdersGroupSummary, {
    amounts: [
      ...previous.posOrdersGroupSummary.amounts,
      ...next.posOrdersGroupSummary.amounts,
    ],
    columns: previous.posOrdersGroupSummary.columns,
  });
  assert.deepEqual(
    mergePosSummaryPages(previous, {
      posOrdersGroupSummary: { amounts: [], columns: {} },
    }).posOrdersGroupSummary.columns,
    {},
  );
  assert.equal(previous.posOrdersGroupSummary.amounts.length, 1);
});

test('detail items remain an array while the item report keeps its unwound object', () => {
  const item = {
    productName: 'Product',
    count: '1.5',
    unitPrice: 100,
    conditionCode: 'keep',
    product: { barcodes: [null, 'code'] },
  };
  const detail = toPosOrderDetail({
    _id: 'order',
    items: [item],
    paidAmounts: [],
    deal: null,
    putResponses: null,
  });
  assert.deepEqual(detail.items, [item]);
  assert.deepEqual(
    toPosItemRow({ _id: 'order', items: item, paidAmounts: null }).items,
    item,
  );
  assert.deepEqual(detail.putResponses, []);
});

test('malformed editable data produces an error rather than an empty payment form', () => {
  for (const order of [
    { items: {} },
    { items: [], paidAmounts: [{ type: 'cash', amount: {} }] },
  ]) {
    const result = readPosData(() => toPosOrderDetail(order));
    assert.equal(result.value, undefined);
    assert.ok(result.error instanceof Error);
  }
  assert.throws(() => toPosDetail({ paymentTypes: [{ type: 42 }] }));
});

const COVERS = gql`
  query SalesPosCoversCacheRegression($status: String) {
    posCovers(status: $status) {
      _id
      status
    }
  }
`;
const readIds = (cache, variables) =>
  cache
    .readQuery({ query: COVERS, variables })
    .posCovers?.map((row) => row._id);

test('cover deletion updates every cached filter and preserves other rows', () => {
  const cache = new InMemoryCache();
  const first = { __typename: 'PosCover', _id: 'one', status: 'open' };
  const second = { __typename: 'PosCover', _id: 'two', status: 'closed' };
  cache.writeQuery({ query: COVERS, data: { posCovers: [first, second] } });
  cache.writeQuery({
    query: COVERS,
    variables: { status: 'open' },
    data: { posCovers: [first] },
  });
  cache.writeQuery({
    query: COVERS,
    variables: { status: 'closed' },
    data: { posCovers: [second] },
  });
  updateCacheAfterRemove(cache, ['one']);
  assert.deepEqual(readIds(cache), ['two']);
  assert.deepEqual(readIds(cache, { status: 'open' }), []);
  assert.deepEqual(readIds(cache, { status: 'closed' }), ['two']);
  updateCacheAfterRemove(cache, ['two']);
  assert.deepEqual(readIds(cache), []);
});

test('cover deletion tolerates an empty nullable result', () => {
  const cache = new InMemoryCache();
  cache.writeQuery({ query: COVERS, data: { posCovers: null } });
  assert.doesNotThrow(() => updateCacheAfterRemove(cache, ['missing']));
});

test('empty controlled payment inputs retain nullable stored fields until edited', () => {
  assert.equal(restorePosPaymentText('', null), null);
  assert.equal(restorePosPaymentText('', undefined), undefined);
  assert.equal(restorePosPaymentText('changed', null), 'changed');
  assert.equal(restorePosPaymentText('', 'clear me'), '');
  assert.equal(restorePosPaymentText(undefined, null), null);
  assert.equal(restorePosPaymentConfig(undefined, null), null);
});

test('POS selector continues after the loaded rows of the original request', () => {
  const firstPage = { page: 1, perPage: 20 };
  assert.deepEqual(getNextPosSelectorPage(firstPage, 20, 20), {
    page: 2,
    perPage: 20,
  });
  assert.deepEqual(getNextPosSelectorPage(firstPage, 40, 20), {
    page: 3,
    perPage: 20,
  });
  assert.deepEqual(getNextPosSelectorPage(firstPage, 25, 20), {
    page: 3,
    perPage: 20,
  });
  assert.deepEqual(getNextPosSelectorPage({ page: 3, perPage: 7 }, 7, 20), {
    page: 4,
    perPage: 7,
  });
});

test('POS selector page falls back like the API for missing page values', () => {
  assert.deepEqual(getNextPosSelectorPage({}, 0, 20), { page: 1, perPage: 20 });
  assert.deepEqual(
    getNextPosSelectorPage({ page: null, perPage: null }, 20, 20),
    { page: 2, perPage: 20 },
  );
  assert.deepEqual(getNextPosSelectorPage({ page: 0, perPage: 0 }, 20, 20), {
    page: 2,
    perPage: 20,
  });
});
