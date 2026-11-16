import { getFxaTaxValues } from '../fxaTaxValues';

test.each([
  [1000, 600, 10, -400, 40, 0],
  [600, 1000, 10, 400, 0, 40],
  [1000, 1000, 10, 0, 0, 0],
  [1000, 600, 0, -400, 0, 0],
])(
  'derives deferred tax from book %s and tax %s at %s percent',
  (book, tax, rate, difference, asset, liability) => {
    expect(
      getFxaTaxValues(
        { accumulatedDepreciation: book, taxAccumulatedDepreciation: tax },
        rate,
      ),
    ).toEqual({
      temporaryDifference: difference,
      deferredTaxAsset: asset,
      deferredTaxLiability: liability,
    });
  },
);

test('legacy missing tax totals or rates do not invent a tax display', () => {
  expect(getFxaTaxValues({ accumulatedDepreciation: 1000 }, 10)).toEqual({
    temporaryDifference: undefined,
    deferredTaxAsset: undefined,
    deferredTaxLiability: undefined,
  });
  expect(
    getFxaTaxValues({
      accumulatedDepreciation: 1000,
      taxAccumulatedDepreciation: 600,
    }),
  ).toEqual({
    temporaryDifference: -400,
    deferredTaxAsset: undefined,
    deferredTaxLiability: undefined,
  });
});
