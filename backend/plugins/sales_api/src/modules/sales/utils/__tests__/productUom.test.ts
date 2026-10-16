import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { normalizeProductUomInfo, syncProductUomInfo } from '../productUom';
import type { IProductData } from '../../@types/deal';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
const findProducts = jest.mocked(sendTRPCMessage);
beforeEach(() => findProducts.mockReset());

const row = (): IProductData => ({
  productId: 'product',
  uom: 'pcs',
  currency: 'MNT',
  quantity: 10,
  unitPrice: 100,
  globalUnitPrice: 100,
  unitPricePercent: 100,
  amount: 1000,
  uomInfo: { uom: 'box', ratio: 0.1, unitPrice: 1000, quantity: 1 },
});

it('derives base-unit price, quantity and amount from entry values even with stale root fields', async () => {
  const product = {
    ...row(),
    uomInfo: { uom: 'box', ratio: 0.1, unitPrice: 2000, quantity: 3 },
  };
  const [saved] = await normalizeProductUomInfo('tenant', [product]);
  expect(saved.uom).toBe('pcs');
  expect(saved.unitPrice).toBe(200);
  expect(saved.quantity).toBe(30);
  expect(saved.amount).toBe(6000);
  expect(saved.uomInfo).toEqual(product.uomInfo);
  expect(findProducts).not.toHaveBeenCalled();
});

it('fills empty and partial information with base-unit defaults', async () => {
  const [empty, partial] = await normalizeProductUomInfo('tenant', [
    { ...row(), uomInfo: {} },
    { ...row(), uomInfo: { uom: 'pcs', quantity: 2 } },
  ]);
  expect(empty.uomInfo).toBeUndefined();
  expect(empty.unitPrice).toBe(100);
  expect(empty.quantity).toBe(10);
  expect(partial.uomInfo).toBeUndefined();
  expect(partial.quantity).toBe(2);
  expect(partial.amount).toBe(200);
});

it('resolves missing base units in one tenant-scoped Core product request', async () => {
  findProducts.mockResolvedValue([{ _id: 'product', uom: 'pcs' }]);
  const results = await normalizeProductUomInfo('tenant', [
    { ...row(), uom: '' },
    { ...row(), uom: '' },
  ]);
  expect(results.map((product) => product.uom)).toEqual(['pcs', 'pcs']);
  expect(findProducts).toHaveBeenCalledTimes(1);
  expect(findProducts).toHaveBeenCalledWith(
    expect.objectContaining({
      subdomain: 'tenant',
      module: 'products',
      action: 'find',
    }),
  );
});

it('uses base units when a sub-unit input is missing its conversion ratio', async () => {
  const [saved] = await normalizeProductUomInfo('tenant', [
    {
      ...row(),
      uomInfo: { uom: 'box', unitPrice: 2000, quantity: 3 },
    },
  ]);
  expect(saved.uomInfo).toBeUndefined();
  expect(saved.unitPrice).toBe(100);
  expect(saved.quantity).toBe(10);
  expect(saved.amount).toBe(1000);
});

it('recalculates tax and totals after normalizing entry values', async () => {
  const [saved] = await normalizeProductUomInfo('tenant', [
    {
      ...row(),
      discount: 100,
      taxPercent: 10,
      uomInfo: { uom: 'box', ratio: 0.1, unitPrice: 2000, quantity: 3 },
    },
  ]);
  expect(saved.tax).toBe(590);
  expect(saved.amount).toBe(6490);
});

it('keeps the selected ratio after server pricing updates the base price', async () => {
  const [saved] = syncProductUomInfo([{ ...row(), unitPrice: 200 }]);
  expect(saved.uomInfo).toEqual({
    uom: 'box',
    ratio: 0.1,
    unitPrice: 2000,
    quantity: 1,
  });
  expect((await normalizeProductUomInfo('tenant', [saved]))[0].unitPrice).toBe(
    200,
  );
});

it.each([0, -1, NaN, Infinity])('rejects invalid ratio %s', async (ratio) => {
  await expect(
    normalizeProductUomInfo('tenant', [
      { ...row(), uomInfo: { uom: 'box', ratio } },
    ]),
  ).rejects.toThrow('positive finite');
});

it.each([-1, NaN, Infinity])(
  'rejects invalid entry price and quantity %s',
  async (value) => {
    await expect(
      normalizeProductUomInfo('tenant', [
        { ...row(), uomInfo: { ...row().uomInfo, quantity: value } },
      ]),
    ).rejects.toThrow('non-negative');
    await expect(
      normalizeProductUomInfo('tenant', [
        { ...row(), uomInfo: { ...row().uomInfo, unitPrice: value } },
      ]),
    ).rejects.toThrow('non-negative');
  },
);

it('preserves zero entry values', async () => {
  const [saved] = await normalizeProductUomInfo('tenant', [
    { ...row(), uomInfo: { uom: 'pcs', ratio: 1, unitPrice: 0, quantity: 0 } },
  ]);
  expect(saved.unitPrice).toBe(0);
  expect(saved.quantity).toBe(0);
  expect(saved.amount).toBe(0);
  expect(saved.uomInfo).toBeUndefined();
});

it('copies base-unit input values directly and omits redundant metadata', async () => {
  const unitPrice = 1.2345678901234567;
  const quantity = 2.345678901234567;
  const [saved] = await normalizeProductUomInfo('tenant', [
    {
      ...row(),
      uomInfo: { uom: 'pcs', ratio: 1, unitPrice, quantity },
    },
  ]);
  expect(saved.uomInfo).toBeUndefined();
  expect(saved.unitPrice).toBe(unitPrice);
  expect(saved.quantity).toBe(quantity);
});

it('keeps legacy rows without entry information unchanged', async () => {
  const product = row();
  delete product.uomInfo;
  expect((await normalizeProductUomInfo('tenant', [product]))[0]).toBe(product);
});

it('preserves base-unit precision when syncing input values after pricing', () => {
  const unitPrice = 1.2345678901234567;
  const quantity = 2.345678901234567;
  const [synced] = syncProductUomInfo([
    { ...row(), unitPrice, quantity, uomInfo: { uom: 'pcs', ratio: 1 } },
  ]);
  expect(synced.uomInfo?.unitPrice).toBe(unitPrice);
  expect(synced.uomInfo?.quantity).toBe(quantity);
});
