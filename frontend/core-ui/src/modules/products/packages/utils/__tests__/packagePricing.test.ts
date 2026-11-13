import {
  percentFromPrice,
  priceFromPercent,
  toPackageProductsInput,
} from '../packagePricing';

describe('package pricing', () => {
  it('prices a package off its total by the discount', () => {
    expect(priceFromPercent(200, 25)).toBe(150);
    expect(priceFromPercent(99.99, 10)).toBe(89.99);
  });

  it('sells at the total without a discount', () => {
    expect(priceFromPercent(200, null)).toBe(200);
    expect(priceFromPercent(200, 0)).toBe(200);
  });

  it('has no price without products', () => {
    expect(priceFromPercent(0, 10)).toBeNull();
    expect(priceFromPercent(null, 10)).toBeNull();
  });

  it('reads the discount a price gives', () => {
    expect(percentFromPrice(200, 150)).toBe(25);
    expect(percentFromPrice(3, 2)).toBe(33.33);
  });

  it('has no discount at or above the total, or without one', () => {
    expect(percentFromPrice(200, 200)).toBeNull();
    expect(percentFromPrice(200, 250)).toBeNull();
    expect(percentFromPrice(200, 0)).toBeNull();
    expect(percentFromPrice(null, 100)).toBeNull();
  });

  it('sends products without the query typename', () => {
    const products = [
      { productId: 'a', quantity: 2, __typename: 'PackageProduct' },
    ];
    expect(toPackageProductsInput(products)).toEqual([
      { productId: 'a', quantity: 2 },
    ]);
    expect(toPackageProductsInput(null)).toEqual([]);
  });
});
