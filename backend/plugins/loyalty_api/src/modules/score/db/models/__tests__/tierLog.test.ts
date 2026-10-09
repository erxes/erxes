import { loadLoyaltyTierLogClass } from '@/score/db/models/TierLog';

const TIERS = [
  { key: 'silver', name: 'Silver', order: 0 },
  { key: 'gold', name: 'Gold', order: 1 },
];

const setup = () => {
  const create = jest.fn(async (doc) => ({ _id: 'log-1', ...doc }));
  const createActivityLog = jest.fn();
  const schema = loadLoyaltyTierLogClass(
    { LoyaltyTierLogs: { create } } as never,
    { createActivityLog } as never,
  );
  const record = schema.statics.record as (
    args: Record<string, unknown>,
  ) => Promise<unknown>;

  return { create, createActivityLog, record };
};

const ARGS = {
  account: { _id: 'account-1', ownerType: 'customer', ownerId: 'customer-1' },
  accountType: { _id: 'wallet-1', name: 'Points', tiers: TIERS },
  from: 'silver',
  to: 'gold',
};

describe('LoyaltyTierLogs.record', () => {
  it('keeps the change with its direction and source', async () => {
    const { create, record } = setup();

    await record({
      ...ARGS,
      via: { createdBy: 'user-1', targetId: 'deal-1', targetType: 'deal' },
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 'account-1',
        accountTypeId: 'wallet-1',
        fromTier: 'silver',
        toTier: 'gold',
        direction: 'up',
        createdBy: 'user-1',
        targetId: 'deal-1',
      }),
    );
  });

  it('tells the owner and the source record, naming the tiers', async () => {
    const { createActivityLog, record } = setup();

    await record({
      ...ARGS,
      via: { createdBy: 'user-1', targetId: 'deal-1', targetType: 'deal' },
    });

    const [entries, actorId] = createActivityLog.mock.calls[0];

    expect(actorId).toBe('user-1');
    expect(entries.map(({ target }) => target._id)).toEqual([
      'customer-1',
      'deal-1',
    ]);
    expect(entries[0].action.description).toBe(
      'moved Points tier up from Silver to Gold',
    );
  });

  it('keeps the line but writes no activity without an actor', async () => {
    const { create, createActivityLog, record } = setup();

    await record({ ...ARGS, from: 'gold', to: null });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'down', toTier: null }),
    );
    expect(createActivityLog).not.toHaveBeenCalled();
  });
});
