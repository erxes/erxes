import { resetAccountType } from '@/score/services/accountReset';
import { setAccountTier } from '@/score/services/accountTier';
import { applyScoreChange } from '@/score/services/scoreLedger';

jest.mock('@/score/services/scoreLedger', () => ({
  applyScoreChange: jest.fn(),
  fixScoreNumber: (value: number) => Math.round(value * 1e8) / 1e8,
}));

jest.mock('@/score/services/accountTier', () => ({
  setAccountTier: jest.fn(),
}));

const BOUNDARY = new Date('2026-10-01T00:00:00+08:00');

type TEntry = { balance: number; tier?: string; tierSince?: Date };

const buildModels = ({
  entries,
  changedSince = 0,
  pendingSince = 0,
  oldPending = [],
}: {
  entries: TEntry[];
  changedSince?: number;
  pendingSince?: number;
  oldPending?: { remaining: number; sourceLogId: string }[];
}) => {
  const accounts = entries.map((entry, index) => ({
    _id: `account-${index}`,
    number: `${index}`,
    ownerType: 'customer',
    ownerId: `customer-${index}`,
    balances: new Map([['wallet', entry]]),
  }));

  return {
    LoyaltyAccounts: {
      find: () => ({
        limit: (size: number) => ({
          cursor: async function* () {
            yield* accounts.slice(0, size);
          },
        }),
      }),
      markReset: jest.fn(),
    },
    ScoreLogs: {
      aggregate: jest.fn().mockResolvedValue([{ total: changedSince }]),
    },
    LoyaltyLots: {
      sumOpen: jest.fn().mockResolvedValue(pendingSince),
      find: jest.fn(() => ({ lean: async () => oldPending })),
    },
  };
};

const accountType = {
  _id: 'wallet',
  fieldId: 'field',
  expiry: { mode: 'calendar' },
  reset: { period: 'monthly', tierTo: 'none' },
  tiers: [],
};

const run = (models: ReturnType<typeof buildModels>) =>
  resetAccountType({
    models: models as never,
    subdomain: 'test',
    accountType: accountType as never,
    boundary: BOUNDARY,
  });

describe('resetAccountType', () => {
  beforeEach(() => {
    jest.mocked(applyScoreChange).mockReset();
    jest.mocked(setAccountTier).mockReset();
  });

  it('keeps what moved after the period began when the run comes late', async () => {
    // 100 left from September; after midnight +50 earned, 30 spent.
    const models = buildModels({
      entries: [{ balance: 120 }],
      changedSince: 20,
    });

    await run(models);

    expect(jest.mocked(applyScoreChange).mock.calls[0][0].doc).toMatchObject({
      action: 'set',
      changeScore: 20,
    });
  });

  it('leaves out earnings still pending, which are not in the balance', async () => {
    const models = buildModels({
      entries: [{ balance: 100 }],
      changedSince: 50,
      pendingSince: 50,
    });

    await run(models);

    expect(jest.mocked(applyScoreChange).mock.calls[0][0].doc).toMatchObject({
      changeScore: 0,
    });
  });

  it('never leaves debt for old points spent before the run', async () => {
    const models = buildModels({
      entries: [{ balance: 70 }],
      changedSince: -30,
    });

    await run(models);

    expect(jest.mocked(applyScoreChange).mock.calls[0][0].doc).toMatchObject({
      changeScore: 0,
    });
  });

  it('does not reset a tier won after the period began', async () => {
    const models = buildModels({
      entries: [
        {
          balance: 0,
          tier: 'gold',
          tierSince: new Date('2026-10-01T02:00:00+08:00'),
        },
        {
          balance: 0,
          tier: 'gold',
          tierSince: new Date('2026-09-10T00:00:00+08:00'),
        },
      ],
    });

    await run(models);

    expect(setAccountTier).toHaveBeenCalledTimes(1);
    expect(jest.mocked(setAccountTier).mock.calls[0][0].accountId).toBe(
      'account-1',
    );
  });

  it('counts what a reset would do without writing anything in a dry run', async () => {
    const models = buildModels({
      entries: [
        { balance: 100, tier: 'gold' },
        { balance: 40, tier: 'gold' },
        { balance: 0 },
      ],
    });

    const { impact } = await resetAccountType({
      models: models as never,
      subdomain: 'test',
      accountType: accountType as never,
      boundary: BOUNDARY,
      dryRun: true,
    });

    expect(applyScoreChange).not.toHaveBeenCalled();
    expect(setAccountTier).not.toHaveBeenCalled();
    expect(models.LoyaltyAccounts.markReset).not.toHaveBeenCalled();
    expect(impact).toEqual({
      accounts: 3,
      pointsCleared: 140,
      pointsKept: 0,
      tierChanges: [{ from: 'gold', to: null, accounts: 2 }],
    });
  });

  it('clears points of the old period still held back, without touching the balance', async () => {
    const models = buildModels({
      entries: [{ balance: 0 }],
      oldPending: [{ remaining: 100, sourceLogId: 'earn-1' }],
    });

    const dry = await resetAccountType({
      models: models as never,
      subdomain: 'test',
      accountType: accountType as never,
      boundary: BOUNDARY,
      dryRun: true,
    });

    expect(dry.impact.pointsCleared).toBe(100);
    expect(applyScoreChange).not.toHaveBeenCalled();

    await run(models);

    expect(jest.mocked(applyScoreChange).mock.calls[0][0].doc).toMatchObject({
      action: 'expire',
      changeScore: -100,
      sourceScoreLogId: 'earn-1',
    });
  });
});
