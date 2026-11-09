jest.mock('erxes-api-shared/utils', () => ({
  shortStrToDate: (value: string) => Date.parse(value),
}));
jest.mock('../product', () => ({
  getAllowedProducts: async () => ['a'],
}));
jest.mock('../eligibility', () => ({
  planMatchesContext: async () => true,
}));
jest.mock('@/score/services/periodSchedule', () => ({
  loyaltyTimeZone: async () => 'Asia/Ulaanbaatar',
}));

import { IModels } from '~/connectionResolvers';
import { IPricingPlan } from '../../@types/pricingPlan';
import { IActiveWindow } from '../../@types/schedule';
import { checkPricing } from '../index';

// Wednesday 13:00 and Monday 10:30 in Ulaanbaatar.
const NOW = new Date('2026-11-04T05:00:00Z');
const THEN = new Date('2020-01-06T02:30:00Z');
const mondayMorning: IActiveWindow = {
  type: 'weekly',
  weekDays: [1],
  startTime: '10:00',
  endTime: '11:00',
};

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
    run: (date?: Date, orderCreatedAt?: Date) =>
      checkPricing({
        models,
        subdomain: 'test',
        prioritizeRule: 'exclude',
        totalAmount: 100,
        date,
        orderCreatedAt,
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
  it('uses the supplied timestamp for plan dates and the schedule', async () => {
    const f = fixture(
      pricingPlan({
        isRepeatEnabled: true,
        activeWindows: [mondayMorning],
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
        activeWindows: [mondayMorning],
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

  // Monday 10:50 and 11:10 in Ulaanbaatar, around a 10:00–11:00 window.
  const opened = new Date('2020-01-06T02:50:00Z');
  const paid = new Date('2020-01-06T03:10:00Z');

  it.each([
    ['checkout', 0],
    ['orderCreated', 10],
    ['either', 10],
  ] as const)(
    'checks the schedule at the %s moment',
    async (scheduleMoment, value) => {
      const f = fixture(
        pricingPlan({
          isRepeatEnabled: true,
          activeWindows: [mondayMorning],
          scheduleMoment,
        }),
      );

      expect((await f.run(paid, opened))?.['line-a'].value).toBe(value);
    },
  );

  it('treats a purchase without an order start as starting at checkout', async () => {
    const f = fixture(
      pricingPlan({
        isRepeatEnabled: true,
        activeWindows: [mondayMorning],
        scheduleMoment: 'orderCreated',
      }),
    );

    expect((await f.run(opened))?.['line-a'].value).toBe(10);
    expect((await f.run(paid))?.['line-a'].value).toBe(0);
  });

  it('says which plan, window and moment priced a line', async () => {
    const f = fixture(
      pricingPlan({
        isRepeatEnabled: true,
        activeWindows: [mondayMorning],
        scheduleMoment: 'orderCreated',
      }),
    );
    const line = (await f.run(paid, opened))?.['line-a'];

    expect(line?.reasons).toEqual([
      expect.objectContaining({
        planName: 'Dated plan',
        kind: 'discount',
        value: 10,
        window: mondayMorning,
        matchedMoment: 'orderCreated',
      }),
    ]);
  });
});
