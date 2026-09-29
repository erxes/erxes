import {
  checkSpendRules,
  normalizeSpendRules,
} from '@/score/services/spendRules';

const base = {
  rules: {},
  paidMoney: 5000,
  orderTotal: 10000,
  pointValue: 10,
  balance: 1000,
};

describe('checkSpendRules', () => {
  it('turns the paid money into points through the point value', () => {
    expect(checkSpendRules(base)).toBe(500);
  });

  it('rejects spending more than the balance', () => {
    expect(() => checkSpendRules({ ...base, pointValue: 1 })).toThrow(
      'There has no enough score to subtract',
    );
  });

  it('requires the step, the minimum balance and the order share', () => {
    expect(() => checkSpendRules({ ...base, rules: { step: 300 } })).toThrow(
      'multiples of 300',
    );
    expect(checkSpendRules({ ...base, rules: { step: 100 } })).toBe(500);

    expect(() =>
      checkSpendRules({ ...base, rules: { minBalance: 2000 } }),
    ).toThrow('balance reaches 2000');

    expect(() => checkSpendRules({ ...base, rules: { maxShare: 40 } })).toThrow(
      'at most 40%',
    );
    expect(checkSpendRules({ ...base, rules: { maxShare: 50 } })).toBe(500);
  });

  it('costs nothing when nothing is paid with points', () => {
    expect(
      checkSpendRules({ ...base, paidMoney: 0, rules: { minBalance: 99999 } }),
    ).toBe(0);
  });
});

describe('normalizeSpendRules', () => {
  it('drops empty values and rejects a share above 100%', () => {
    expect(
      normalizeSpendRules({ minBalance: '' as unknown as number, step: 0 }),
    ).toEqual({
      minBalance: undefined,
      maxShare: undefined,
      step: undefined,
    });
    expect(() => normalizeSpendRules({ maxShare: 120 })).toThrow('100%');
  });
});
