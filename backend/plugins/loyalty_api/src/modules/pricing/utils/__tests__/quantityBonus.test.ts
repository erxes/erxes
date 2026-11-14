jest.mock('erxes-api-shared/utils', () => ({
  shortStrToDate: jest.fn(),
}));

import { IQuantityRule } from '../../@types/quantityRule';
import { calculateQuantityRule } from '../rule';

const bonusRule = (overrides: Partial<IQuantityRule> = {}): IQuantityRule => ({
  type: 'every',
  value: 3,
  discountType: 'bonus',
  discountValue: 0,
  discountBonusProduct: 'b',
  priceAdjustType: 'none',
  priceAdjustFactor: 0,
  ...overrides,
});

const calculate = (quantity: number, rules = [bonusRule()]) =>
  calculateQuantityRule(
    { isQuantityEnabled: true, quantityRules: rules },
    { itemId: 'line-a', productId: 'a', quantity, price: 100 },
    0,
  );

describe('quantity pricing bonuses', () => {
  it.each([
    [0, 0],
    [2, 0],
    [2.9, 0],
    [3, 1],
    [4, 1],
    [5, 1],
    [5.9, 1],
    [6, 2],
    [9, 3],
  ])('awards %s A the correct %s B bonuses', (quantity, expected) => {
    const result = calculate(quantity);
    expect(result.bonusProducts).toEqual(Array(expected).fill('b'));
    expect(result.value).toBe(0);
    expect(result.passed).toBe(quantity >= 3);
  });

  it.each([
    [2, 1],
    [4, 2],
    [6, 3],
  ])('supports buy every two: %s A gives %s free A', (quantity, expected) => {
    const result = calculate(quantity, [
      bonusRule({ value: 2, discountBonusProduct: 'a' }),
    ]);
    expect(result.bonusProducts).toEqual(Array(expected).fill('a'));
  });

  it.each(['exact', 'minimum'])(
    'keeps one bonus for an eligible %s rule',
    (type) => {
      expect(calculate(3, [bonusRule({ type })]).bonusProducts).toEqual(['b']);
      expect(calculate(2, [bonusRule({ type })]).bonusProducts).toEqual([]);
    },
  );

  it('keeps bonuses from other matching rules without adding an extra per bundle', () => {
    const result = calculate(6, [
      bonusRule({ type: 'minimum', discountBonusProduct: 'c' }),
      bonusRule(),
    ]);
    expect(result.bonusProducts).toEqual(['c', 'b', 'b']);
  });
});
