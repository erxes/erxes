import { model, Schema } from 'mongoose';
import type { IProductData } from '../../../@types/deal';
import { productDataSchema } from '../deals';

jest.mock('erxes-api-shared/core-modules', () => ({
  attachmentSchema: new Schema({}),
  customFieldSchema: new Schema({}),
}));
jest.mock('erxes-api-shared/utils', () => ({
  mongooseStringRandomId: { type: String },
  schemaWrapper: (schema: Schema) => schema,
}));

const Deal = model<{ productsData: IProductData[] }>(
  'SalesProductUomSchemaTest',
  new Schema({ productsData: [productDataSchema] }),
);

it('keeps the selected UOM snapshot when casting deal products for persistence', () => {
  const deal = new Deal({
    productsData: [
      {
        productId: 'product',
        uom: 'pcs',
        unitPrice: 100,
        quantity: 10,
        uomInfo: { uom: 'box', ratio: 0.1, unitPrice: 1000, quantity: 1 },
      },
    ],
  });
  expect(deal.validateSync()).toBeUndefined();
  const row = deal.toObject().productsData[0];
  expect(row.uom).toBe('pcs');
  expect(row.unitPrice).toBe(100);
  expect(row.quantity).toBe(10);
  expect(row.uomInfo).toEqual({
    uom: 'box',
    ratio: 0.1,
    unitPrice: 1000,
    quantity: 1,
  });
});

it.each([0, -1, Infinity])(
  'rejects invalid ratio %s in the schema',
  (ratio) => {
    const deal = new Deal({
      productsData: [
        {
          productId: 'product',
          uomInfo: { uom: 'box', ratio, unitPrice: 1000, quantity: 1 },
        },
      ],
    });
    expect(
      deal.validateSync()?.errors['productsData.0.uomInfo.ratio'],
    ).toBeDefined();
  },
);
