import {
  checkLoyaltiesInput,
  checkPricingInput,
  confirmLoyaltiesInput,
} from '../init-trpc';

describe('sale quantity tRPC inputs', () => {
  it('accepts fractional quantities for loyalty discount checks', () => {
    const input = checkLoyaltiesInput.parse({
      ownerType: 'customer',
      ownerId: 'customer-1',
      products: [{ productId: 'flour', quantity: 1.25, unitPrice: 4000 }],
    });

    expect(input.products[0].quantity).toBe(1.25);
  });

  it('accepts fractional quantities for pricing checks', () => {
    const input = checkPricingInput.parse({
      prioritizeRule: 'exclude',
      totalAmount: 5000,
      products: [
        { itemId: 'line-1', productId: 'flour', quantity: 1.25, price: 4000 },
      ],
    });

    expect(input.products[0].quantity).toBe(1.25);
  });

  it('accepts fractional bonus voucher counts when confirming use', () => {
    const input = confirmLoyaltiesInput.parse({
      checkInfo: {
        flour: { voucherId: 'voucher-1', count: 0.5 },
      },
    });

    expect(input.checkInfo.flour.count).toBe(0.5);
  });

  it('still rejects zero sale quantities', () => {
    expect(() =>
      checkPricingInput.parse({
        prioritizeRule: 'exclude',
        totalAmount: 0,
        products: [{ productId: 'flour', quantity: 0, price: 4000 }],
      }),
    ).toThrow();
  });

  it('confirms fractional voucher use alongside lines without a voucher', () => {
    const input = confirmLoyaltiesInput.parse({
      checkInfo: {
        flour: { voucherId: 'voucher-1', count: 0.5 },
        milk: { voucherId: null, count: null },
        bread: {},
      },
      extraInfo: { couponCode: null, voucherId: null, ownerId: null },
    });

    expect(input.checkInfo.flour.count).toBe(0.5);
    expect(input.checkInfo.milk).toEqual({ voucherId: null, count: null });
    expect(input.checkInfo.bread).toEqual({});
  });
});

describe('pricing date tRPC input', () => {
  const input = { prioritizeRule: 'exclude', totalAmount: 100, products: [] };

  it('accepts an omitted date', () => {
    expect(checkPricingInput.parse(input).date).toBeUndefined();
  });

  it.each([
    new Date('2020-01-06T10:30:00Z'),
    '2020-01-06T10:30:00Z',
    '2020-01-06T18:30:00+08:00',
  ])('normalizes a date or ISO timestamp to Date: %s', (date) => {
    expect(checkPricingInput.parse({ ...input, date }).date).toEqual(
      new Date('2020-01-06T10:30:00Z'),
    );
  });

  it.each(['invalid', '', null, new Date('invalid')])(
    'rejects an invalid date: %s',
    (date) => {
      expect(checkPricingInput.safeParse({ ...input, date }).success).toBe(
        false,
      );
    },
  );
});
