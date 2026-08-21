import { generateTargetTotalAmountDeal } from '../utils';

describe('deal score target totals', () => {
  it('always excludes products that are not ticked', () => {
    expect(
      generateTargetTotalAmountDeal(
        [
          { amount: 100, tickUsed: true },
          { amount: 200, tickUsed: true, discount: 0 },
          { amount: 300, tickUsed: false, discount: 0 },
          { amount: 400, tickUsed: true, discount: 5 },
          { amount: 500, tickUsed: true, discount: '10' },
        ],
        { requireTickUsed: true },
      ),
    ).toBe(1200);
  });

  it('excludes discounted products only when discountCheck is enabled', () => {
    expect(
      generateTargetTotalAmountDeal(
        [
          { amount: 100, tickUsed: true },
          { amount: 200, tickUsed: true, discount: 0 },
          { amount: 300, tickUsed: false, discount: 0 },
          { amount: 400, tickUsed: true, discount: 5 },
          { amount: 500, tickUsed: true, discount: '10' },
        ],
        { discountCheck: true, requireTickUsed: true },
      ),
    ).toBe(300);
  });

  it('counts only allowed products when campaign product filters match rows', () => {
    expect(
      generateTargetTotalAmountDeal(
        [
          { productId: 'product-a', amount: 100, tickUsed: true },
          { productId: 'product-b', amount: 200, tickUsed: true },
          { productId: 'product-c', amount: 300, tickUsed: false },
        ],
        {
          allowedProductIds: new Set(['product-a', 'product-c']),
          requireTickUsed: true,
        },
      ),
    ).toBe(100);
  });

  it('applies product filters to pos order rows without requiring tickUsed', () => {
    expect(
      generateTargetTotalAmountDeal(
        [
          { productId: 'product-a', count: 2, unitPrice: 100 },
          { productId: 'product-b', count: 3, unitPrice: 100 },
        ],
        { allowedProductIds: new Set(['product-b']) },
      ),
    ).toBe(300);
  });
});
