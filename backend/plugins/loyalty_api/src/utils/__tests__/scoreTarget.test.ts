import { generateTargetTotalAmountDeal } from '../utils';

describe('deal score target totals', () => {
  it('always excludes products that are not ticked', () => {
    expect(
      generateTargetTotalAmountDeal([
        { amount: 100, tickUsed: true },
        { amount: 200, tickUsed: true, discount: 0 },
        { amount: 300, tickUsed: false, discount: 0 },
        { amount: 400, tickUsed: true, discount: 5 },
        { amount: 500, tickUsed: true, discount: '10' },
      ]),
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
        true,
      ),
    ).toBe(300);
  });
});
