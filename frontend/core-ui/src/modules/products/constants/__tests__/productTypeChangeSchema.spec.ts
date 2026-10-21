import { productTypeChangeSchema } from '../productTypeChangeSchema';

describe('bulk product type validation', () => {
  it.each(['product', 'service', 'subscription'])(
    'allows %s without a duration',
    (type) => {
      expect(productTypeChangeSchema.safeParse({ type }).success).toBe(true);
    },
  );

  it('requires a known type', () => {
    expect(productTypeChangeSchema.safeParse({}).success).toBe(false);
    expect(productTypeChangeSchema.safeParse({ type: 'other' }).success).toBe(
      false,
    );
  });

  it('requires a positive duration and supported unit for unique products', () => {
    expect(productTypeChangeSchema.safeParse({ type: 'unique' }).success).toBe(
      false,
    );
    expect(
      productTypeChangeSchema.safeParse({
        type: 'unique',
        duration: 0,
        durationType: 'day',
      }).success,
    ).toBe(false);
    expect(
      productTypeChangeSchema.safeParse({
        type: 'unique',
        duration: 3,
        durationType: 'unknown',
      }).success,
    ).toBe(false);
    expect(
      productTypeChangeSchema.safeParse({
        type: 'unique',
        duration: 3,
        durationType: 'day',
      }).success,
    ).toBe(true);
  });
});
