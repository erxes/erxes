import { jobItemInBaseUnits } from '../jobUnits';

const product = {
  _id: 'raw',
  uom: 'kg',
  subUoms: [
    { uom: 'box', ratio: 5 },
    { uom: 'g', ratio: 0.001 },
  ],
};

test('converts scaled recipe amounts and preserves allocation ratios', () => {
  const item = { productId: 'raw', uom: 'box', quantity: 6, costRatio: 2 };
  const converted = jobItemInBaseUnits(item, product, []);
  expect(converted).toEqual({
    productId: 'raw',
    uom: 'kg',
    quantity: 30,
    costRatio: 2,
  });
  expect(jobItemInBaseUnits(converted, product, [])).toEqual(converted);
  expect(item).toMatchObject({ uom: 'box', quantity: 6 });
  expect(
    jobItemInBaseUnits({ ...item, uom: 'g', quantity: 500 }, product, [])
      .quantity,
  ).toBe(0.5);
});

test('normalizes saved unit ids and names without converting base amounts twice', () => {
  const units = [
    { _id: 'kg-id', code: 'kg', name: 'Kilogram' },
    { _id: 'box-id', code: 'box', name: 'Box' },
  ];
  const productWithUnitIds = {
    ...product,
    uom: 'kg-id',
    subUoms: [{ uom: 'box-id', ratio: 5 }],
  };
  expect(
    jobItemInBaseUnits(
      { productId: 'raw', uom: 'Box', quantity: 2 },
      productWithUnitIds,
      units,
    ),
  ).toMatchObject({ uom: 'kg', quantity: 10 });
  expect(
    jobItemInBaseUnits(
      { productId: 'raw', uom: 'Kilogram', quantity: 2 },
      productWithUnitIds,
      units,
    ),
  ).toMatchObject({ uom: 'kg', quantity: 2 });
});

test.each([undefined, 0, -1, Infinity, NaN])(
  'rejects invalid selected ratios: %s',
  (ratio) => {
    expect(() =>
      jobItemInBaseUnits(
        { productId: 'raw', uom: 'box', quantity: 2 },
        { ...product, subUoms: [{ uom: 'box', ratio }] },
        [],
      ),
    ).toThrow('Invalid product unit ratio');
  },
);
