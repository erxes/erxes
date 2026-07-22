import { Schema } from 'mongoose';
import { buildPosOrderFields, POS_ORDER_EXTENDED_FIELDS } from './fieldUtils';

describe('buildPosOrderFields', () => {
  it('includes POS extensions and nested order item fields', async () => {
    const itemSchema = new Schema({
      productId: { type: String, label: 'Product' },
      count: { type: Number, label: 'Count' },
    });
    const orderSchema = new Schema({
      number: { type: String, label: 'Order number' },
      items: { type: [itemSchema], label: 'Items' },
    });

    const fields = await buildPosOrderFields(orderSchema);

    expect(fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'number' }),
        expect.objectContaining({ name: 'items.count' }),
        expect.objectContaining({
          name: 'items.productId',
          selectionConfig: {
            queryName: 'products',
            labelField: 'name',
          },
        }),
        expect.objectContaining({ name: 'items.productName' }),
        expect.objectContaining({ name: 'paymentType' }),
        expect.objectContaining({ name: 'pos' }),
      ]),
    );
  });

  it('keeps stable identifiers for extended fields', () => {
    expect(
      POS_ORDER_EXTENDED_FIELDS.every((field) => field._id === field.name),
    ).toBe(true);
  });
});
