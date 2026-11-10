const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { afterEach, test } = require('node:test');
const { runInThisContext } = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { JSDOM } = createRequire(require.resolve('jest-environment-jsdom'))(
  'jsdom',
);

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});
global.HTMLElement = dom.window.HTMLElement;
global.IS_REACT_ACT_ENVIRONMENT = true;
const { cleanup, renderHook } = require('@testing-library/react');
afterEach(cleanup);

const load = (file, mocks = {}) => {
  const compiled = ts.transpileModule(
    readFileSync(path.resolve(__dirname, file), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    },
  ).outputText;
  const exports = {};
  runInThisContext(`(function(exports, require) { ${compiled}\n})`)(
    exports,
    (name) => (Object.hasOwn(mocks, name) ? mocks[name] : require(name)),
  );
  return exports;
};

const { useSyncLocalProductsData } = load('../useProductsListState.ts', {
  '@/deals/constants/toast': { DEAL_TOAST_OPTIONS: {} },
  'erxes-ui': { useToast: () => ({ toast: () => undefined }) },
  'react-i18next': { useTranslation: () => ({ t: (key) => key }) },
  '../utils/isPatchAppliedByServer': load(
    '../../utils/isPatchAppliedByServer.ts',
  ),
  '../utils/productUom': load('../../utils/productUom.ts'),
});

const product = { _id: 'product', name: 'Coffee', uom: 'pcs' };
const toRow = (_id, unitPrice = 100) => ({
  _id,
  productId: 'product',
  product,
  uom: 'pcs',
  currency: 'MNT',
  unitPrice,
  quantity: 1,
  amount: unitPrice,
});
const keepOrder = (rows) => rows;

const renderSync = ({ local, server, patches = {}, deletions = [] }) => {
  const pendingProductPatchesRef = { current: patches };
  const pendingProductDeletionsRef = { current: new Set(deletions) };
  const productByIdRef = { current: { product } };
  const view = renderHook(
    ({ productsData }) => {
      const [localProductsData, setLocalProductsData] = React.useState(local);

      useSyncLocalProductsData({
        productsData,
        defaultCurrency: 'MNT',
        setLocalProductsData,
        pendingProductPatchesRef,
        pendingProductDeletionsRef,
        productByIdRef,
        sortByStableProductOrder: keepOrder,
      });

      return localProductsData;
    },
    { initialProps: { productsData: server } },
  );

  return { ...view, pendingProductPatchesRef, pendingProductDeletionsRef };
};

const ids = (rows) => rows.map((row) => row._id);

test('a pending footer edit survives a refetch that still has the old value', () => {
  const { result, pendingProductPatchesRef } = renderSync({
    local: [toRow('a', 90)],
    server: [toRow('a')],
    patches: { a: { unitPrice: 90 } },
  });

  assert.equal(result.current[0].unitPrice, 90);
  assert.deepEqual(pendingProductPatchesRef.current, { a: { unitPrice: 90 } });
});

test('a pending edit clears once the server returns it and later server values show', () => {
  const { result, rerender, pendingProductPatchesRef } = renderSync({
    local: [toRow('a', 90)],
    server: [toRow('a')],
    patches: { a: { unitPrice: 90 } },
  });

  rerender({ productsData: [toRow('a', 90)] });
  assert.deepEqual(pendingProductPatchesRef.current, {});

  rerender({ productsData: [toRow('a', 80)] });
  assert.equal(result.current[0].unitPrice, 80);
});

test('while edits are pending, a row added locally is kept until the server returns it', () => {
  const { result } = renderSync({
    local: [toRow('a', 90), toRow('added')],
    server: [toRow('a')],
    patches: { a: { unitPrice: 90 } },
  });

  assert.deepEqual(ids(result.current), ['a', 'added']);
});

test('while edits are pending, a row the server stopped returning is dropped', () => {
  const { result, rerender } = renderSync({
    local: [toRow('a', 90), toRow('removed')],
    server: [toRow('a'), toRow('removed')],
    patches: { a: { unitPrice: 90 } },
  });

  rerender({ productsData: [toRow('a')] });

  assert.deepEqual(ids(result.current), ['a']);
  assert.equal(result.current[0].unitPrice, 90);
});

test('a row deleted locally stays hidden until the server stops returning it', () => {
  const { result, rerender, pendingProductDeletionsRef } = renderSync({
    local: [toRow('a')],
    server: [toRow('a'), toRow('deleted')],
    deletions: ['deleted'],
  });

  assert.deepEqual(ids(result.current), ['a']);
  assert.equal(pendingProductDeletionsRef.current.has('deleted'), true);

  rerender({ productsData: [toRow('a')] });
  assert.equal(pendingProductDeletionsRef.current.has('deleted'), false);
});
