jest.mock('@/score/services/periodSchedule', () => ({
  loyaltyTimeZone: async () => 'Asia/Ulaanbaatar',
}));
jest.mock('../eligibility', () => ({
  planMatchesContext: async (_subdomain: string, plan: { _id: string }) =>
    plan._id !== 'not-for-buyer',
}));
jest.mock('../product', () => ({
  getAllowedProducts: async (
    _subdomain: string,
    plan: { _id: string },
    productIds: string[],
  ) => (plan._id === 'other-products' ? [] : productIds),
}));

import { IModels } from '~/connectionResolvers';
import { getScheduleStatus } from '../scheduleStatus';

const evening = { type: 'daily', startTime: '18:00', endTime: '21:00' };
const plan = (_id: string, extra: Record<string, unknown> = {}) => ({
  _id,
  name: _id,
  isRepeatEnabled: true,
  activeWindows: [evening],
  ...extra,
});

const run = (plans: unknown[], checkout: Date, orderCreatedAt?: Date) => {
  const find = jest.fn(() => ({ lean: async () => plans }));
  // Mongoose boundary: only PricingPlans.find().lean() is read.
  const models = { PricingPlans: { find } } as unknown as IModels;

  return getScheduleStatus({
    models,
    subdomain: 'test',
    productIds: ['a'],
    checkout,
    orderCreatedAt,
  });
};

// 20:50 and 21:10 on Friday 6 November in Ulaanbaatar.
const before = new Date('2026-11-06T12:50:00Z');
const after = new Date('2026-11-06T13:10:00Z');

describe('pricing schedule status', () => {
  it('lists only plans for this buyer and these products', async () => {
    const statuses = await run(
      [plan('ok'), plan('not-for-buyer'), plan('other-products')],
      before,
    );

    expect(statuses.map(({ planId }) => planId)).toEqual(['ok']);
  });

  it('tells an open window from a closed one', async () => {
    const [open] = await run([plan('ok')], before);
    const [closed] = await run([plan('ok')], after);

    expect(open).toEqual(
      expect.objectContaining({ active: true, matchedMoment: 'checkout' }),
    );
    expect(open.endsAt?.toISOString()).toBe('2026-11-06T13:00:00.000Z');
    expect(closed.active).toBe(false);
    expect(closed.endedAt?.toISOString()).toBe('2026-11-06T13:00:00.000Z');
    expect(closed.startsAt?.toISOString()).toBe('2026-11-07T10:00:00.000Z');
  });

  it('keeps an order created inside the window active by its creation', async () => {
    const [status] = await run(
      [plan('ok', { scheduleMoment: 'orderCreated' })],
      after,
      before,
    );

    expect(status).toEqual(
      expect.objectContaining({ active: true, matchedMoment: 'orderCreated' }),
    );
  });

  it('asks nothing without products', async () => {
    const find = jest.fn();
    const models = { PricingPlans: { find } } as unknown as IModels;

    expect(
      await getScheduleStatus({ models, subdomain: 'test', productIds: [] }),
    ).toEqual([]);
    expect(find).not.toHaveBeenCalled();
  });
});
