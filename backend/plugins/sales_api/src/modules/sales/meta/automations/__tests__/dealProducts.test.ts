import {
  readDealProductLines,
  toDealProductsData,
} from '../action/dealProducts';

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
}));

describe('readDealProductLines', () => {
  it('reads items JSON, accepting count for quantity', () => {
    expect(
      readDealProductLines({
        items:
          '[{"productId":"p1","quantity":2,"unitPrice":"1500"},{"productId":"p2","count":"3"}]',
      }),
    ).toEqual([
      { productId: 'p1', quantity: 2, unitPrice: 1500 },
      { productId: 'p2', quantity: 3, unitPrice: undefined },
    ]);
  });

  it('drops lines without a product or a positive quantity', () => {
    expect(
      readDealProductLines({
        items: JSON.stringify([
          { productId: '', quantity: 1 },
          { productId: 'p1', quantity: 0 },
          { productId: 'p2' },
          null,
        ]),
      }),
    ).toEqual([]);
  });

  it('falls back to one of each product when items is empty', () => {
    expect(readDealProductLines({ items: '', productIds: 'p1, p2' })).toEqual([
      { productId: 'p1', quantity: 1 },
      { productId: 'p2', quantity: 1 },
    ]);
  });

  it('refuses items that are not JSON', () => {
    expect(() => readDealProductLines({ items: 'two phones' })).toThrow(
      'Deal items must be a JSON array of lines',
    );
  });
});

describe('toDealProductsData', () => {
  const products = [
    { _id: 'p1', name: 'Phone', uom: 'pcs', unitPrice: 1000 },
    { _id: 'p2', name: 'Case', uom: 'pcs' },
  ];

  it('prices from the line, else the product, and ticks every row', () => {
    const rows = toDealProductsData(
      [
        { productId: 'p1', quantity: 2 },
        { productId: 'p1', quantity: 1, unitPrice: 900 },
        { productId: 'p2', quantity: 1 },
      ],
      products,
    );

    expect(rows).toEqual([
      expect.objectContaining({ productId: 'p1', name: 'Phone', uom: 'pcs', quantity: 2, unitPrice: 1000, amount: 2000, tickUsed: true }),
      expect.objectContaining({ productId: 'p1', name: 'Phone', uom: 'pcs', quantity: 1, unitPrice: 900, amount: 900, tickUsed: true }),
      expect.objectContaining({ productId: 'p2', name: 'Case', uom: 'pcs', quantity: 1, unitPrice: 0, amount: 0, tickUsed: true }),
    ]);
    expect(new Set(rows.map((row) => row._id)).size).toBe(3);
  });

  it('leaves out products that no longer exist', () => {
    expect(toDealProductsData([{ productId: 'gone', quantity: 1 }], products)).toEqual([]);
  });
});
