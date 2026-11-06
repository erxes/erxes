jest.mock('erxes-api-shared/utils', () => ({
  shortStrToDate: (value: string) => Date.parse(value),
}));
jest.mock('../product', () => ({
  getAllowedProducts: async () => ['a'],
}));
jest.mock('../eligibility', () => ({
  planMatchesContext: async () => true,
}));

import { IModels } from '~/connectionResolvers';
import { IPricingPlan } from '../../@types/pricingPlan';
import { IRepeatRule } from '../../@types/repeatRule';
import { checkPricing } from '../index';
import { checkRepeatRule } from '../rule';

const NOW = new Date(2026, 10, 4, 13);
const THEN = new Date(2020, 0, 6, 10, 30);
const repeatRule = (overrides: Partial<IRepeatRule> = {}): IRepeatRule => ({
  type: 'everyWeek',
  dayStartValue: new Date(2020, 0, 1, 10),
  dayEndValue: new Date(2020, 0, 1, 11),
  weekValue: [{ label: 'Monday', value: '1' }],
  monthValue: [{ label: '6', value: '6' }],
  yearStartValue: new Date(2020, 0, 1),
  yearEndValue: new Date(2020, 0, 31),
  ...overrides,
});

const pricingPlan = (overrides: Partial<IPricingPlan> = {}): IPricingPlan => ({
  name: 'Dated plan',
  status: 'active',
  type: 'subtraction',
  value: 10,
  priceAdjustType: 'none',
  priceAdjustFactor: 0,
  priority: '',
  applyType: 'product',
  ...overrides,
});

const fixture = (plan: IPricingPlan) => {
  const find = jest.fn(() => ({ sort: async () => [plan] }));
  // Mongoose boundary: this pricing path only uses PricingPlans.find().sort().
  const models = { PricingPlans: { find } } as unknown as IModels;
  return {
    find,
    run: (date?: Date) =>
      checkPricing({
        models,
        subdomain: 'test',
        prioritizeRule: 'exclude',
        totalAmount: 100,
        date,
        orderItems: [
          {
            itemId: 'line-a',
            productId: 'a',
            price: 100,
            quantity: 1,
            manufacturedDate: new Date(2020, 0, 1).toISOString(),
          },
        ],
      }),
  };
};

beforeEach(() => jest.useFakeTimers().setSystemTime(NOW));
afterEach(() => jest.useRealTimers());

describe('pricing evaluation date', () => {
  it('uses the supplied timestamp for plan dates and repeat eligibility', async () => {
    const f = fixture(
      pricingPlan({
        isRepeatEnabled: true,
        repeatRules: [repeatRule()],
      }),
    );
    const result = await f.run(THEN);
    expect(result?.['line-a'].value).toBe(10);
    expect(f.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $and: expect.arrayContaining([
          expect.objectContaining({
            $or: expect.arrayContaining([
              expect.objectContaining({
                startDate: { $lt: THEN.toISOString() },
              }),
              expect.objectContaining({ endDate: { $gt: THEN.toISOString() } }),
            ]),
          }),
        ]),
      }),
    );
  });

  it('defaults to now when the date is omitted', async () => {
    const f = fixture(
      pricingPlan({
        isRepeatEnabled: true,
        repeatRules: [repeatRule()],
      }),
    );
    expect((await f.run())?.['line-a'].value).toBe(0);
    expect(f.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $and: expect.arrayContaining([
          expect.objectContaining({
            $or: expect.arrayContaining([
              expect.objectContaining({
                startDate: { $lt: NOW.toISOString() },
              }),
            ]),
          }),
        ]),
      }),
    );
  });

  it('evaluates expiry at now regardless of the supplied pricing date', async () => {
    const f = fixture(
      pricingPlan({
        isExpiryEnabled: true,
        expiryRules: [
          {
            type: 'day',
            value: 7,
            discountType: 'subtraction',
            discountValue: 20,
            priceAdjustType: 'none',
            priceAdjustFactor: 0,
          },
        ],
      }),
    );
    // Today is after expiry, even when pricing at a historical date before it.
    expect((await f.run(new Date(2020, 0, 6)))?.['line-a'].value).toBe(20);
    // Today is before expiry, even when pricing at a future date after it.
    jest.setSystemTime(new Date(2020, 0, 6));
    expect((await f.run(new Date(2020, 0, 10)))?.['line-a'].value).toBe(0);
    jest.setSystemTime(NOW);
    expect((await f.run())?.['line-a'].value).toBe(20);
  });

  it.each(['everyDay', 'everyWeek', 'everyMonth', 'everyYear'])(
    'uses the supplied date for %s repeat rules',
    (type) => {
      const plan = {
        isRepeatEnabled: true,
        repeatRules: [repeatRule({ type })],
      };
      expect(checkRepeatRule(plan, THEN)).toBe(true);
      expect(checkRepeatRule(plan)).toBe(false);
    },
  );
});
