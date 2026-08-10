import { generateTargetTotalAmountDeal } from "../utils";

describe('deal score target totals', () => {
  it('counts only ticked deal products without discounts', () => {
    expect(
      generateTargetTotalAmountDeal([
        { amount: 100, tickUsed: true },
        { amount: 200, tickUsed: true, discount: 0 },
        { amount: 300, tickUsed: false, discount: 0 },
        { amount: 400, tickUsed: true, discount: 5 },
        { amount: 500, tickUsed: true, discount: '10' },
      ]),
    ).toBe(300);
  });
});
