jest.mock('~/utils', () => ({
  getLoyaltyOwner: jest.fn(async () => ({ _id: 'c1' })),
}));
jest.mock('~/utils/utils', () => ({
  generateTargetTotalAmountDeal: jest.fn(),
  getAllowedProductIdsByRestrictions: jest.fn(),
}));
jest.mock('@/score/services/earnContext', () => ({
  buildEarnContext: jest.fn(async () => ({})),
}));
jest.mock('@/score/services/earnTable', () => ({
  evaluateEarnTable: jest.fn(),
  explainEmptyEarn: jest.fn(() => []),
  normalizeEarnTable: jest.fn((table) => table),
}));
jest.mock('@/score/services/earnWindow', () => ({
  heldPastReset: jest.fn(async () => null),
}));
jest.mock('@/score/services/scoreLedger', () => ({
  ...jest.requireActual('@/score/services/scoreLedger'),
  changeBalance: jest.fn(),
  applyScoreChange: jest.fn(),
  refundScoreChange: jest.fn(),
}));

import { loadScoreCampaignClass } from '@/score/db/models/ScoreCampaign';
import { evaluateEarnTable } from '@/score/services/earnTable';
import { changeBalance } from '@/score/services/scoreLedger';

const mockedEvaluate = evaluateEarnTable as jest.Mock;
const mockedChangeBalance = changeBalance as jest.Mock;

const campaign = {
  _id: 'camp1',
  status: 'active',
  ownerType: 'customer',
  fieldId: 'f1',
  add: { table: { rows: [{ key: 'r1' }] } },
};

const earnedAt = new Date('2026-11-01T00:00:00Z');

const logDoc = (doc: Record<string, unknown>) => ({
  ownerType: 'customer',
  ownerId: 'c1',
  campaignId: 'camp1',
  targetId: 'deal1',
  targetType: 'sales:sales.deals',
  serviceName: 'sales',
  action: 'add',
  save: jest.fn(),
  ...doc,
});

const setup = ({ active }: { active: ReturnType<typeof logDoc> }) => {
  const create = jest.fn(async (docs: Record<string, unknown>[]) => docs);
  const moveToLog = jest.fn();
  const recordActivity = jest.fn();

  function ScoreLogs(this: { _id: string }) {
    this._id = 'next1';
  }

  Object.assign(ScoreLogs, {
    find: jest.fn(() => ({ sort: jest.fn(async () => [active]) })),
    exists: jest.fn(async () => null),
    // The chain is never walked back.
    findOne: jest.fn(() => {
      throw new Error('no chain lookups');
    }),
    create,
    recordActivity,
  });

  const models = {
    ScoreCampaigns: { findOne: jest.fn(async () => campaign) },
    ScoreLogs,
    LoyaltyLots: { moveToLog },
  };
  const schema = loadScoreCampaignClass(models as never, 'os', {
    sendDbEventLog: jest.fn(),
  } as never);
  const earn = schema.statics.earn as (input: unknown) => Promise<unknown>;

  return { earn, create, moveToLog, recordActivity };
};

const input = {
  campaignId: 'camp1',
  ownerType: 'customer',
  ownerId: 'c1',
  targetId: 'deal1',
  serviceName: 'sales',
  actorId: 'u1',
  purchase: { totalAmount: 0 },
};

describe('ScoreCampaigns.earn on a recalculated purchase', () => {
  beforeEach(() => {
    mockedChangeBalance.mockReset().mockResolvedValue({
      previous: 5000,
      next: 5200,
      accountId: 'acc1',
      accountType: { _id: 'w1', name: 'Points' },
    });
  });

  it('reverses the standing entry and writes a new one, never editing it', async () => {
    mockedEvaluate.mockReturnValue({ total: 1200, breakdown: [] });
    const active = logDoc({ _id: 'A', changeScore: 1000, createdAt: earnedAt });
    const { earn, create, moveToLog, recordActivity } = setup({ active });

    const result = await earn(input);

    expect(active.save).not.toHaveBeenCalled();
    expect(active.changeScore).toBe(1000);
    expect(mockedChangeBalance.mock.calls[0][0]).toMatchObject({
      change: 200,
      logId: 'next1',
      sourceLogId: 'A',
      preventNegativeBalance: false,
      lotDatesFrom: earnedAt,
    });
    expect(moveToLog).toHaveBeenCalledWith('A', 'next1');

    const [reversal, replacement] = create.mock.calls[0][0];

    expect(reversal).toMatchObject({
      action: 'refund',
      changeScore: -1000,
      preScore: 5000,
      sourceScoreLogId: 'A',
      replacedByScoreLogId: 'next1',
      targetId: 'deal1',
    });
    expect(replacement).toMatchObject({
      _id: 'next1',
      action: 'add',
      changeScore: 1200,
      preScore: 4000,
      lotDatesFrom: earnedAt,
    });
    // The original, its reversal and the replacement sum to the new amount.
    expect(1000 + reversal.changeScore + replacement.changeScore).toBe(1200);
    expect(recordActivity.mock.calls[0][0]).toMatchObject({ changeScore: 200 });
    expect(result).toBe(replacement);
  });

  it('lets a smaller purchase take back points already spent', async () => {
    mockedEvaluate.mockReturnValue({ total: 300, breakdown: [] });
    const active = logDoc({ _id: 'A', changeScore: 1000, createdAt: earnedAt });
    const { earn } = setup({ active });

    await earn(input);

    expect(mockedChangeBalance.mock.calls[0][0]).toMatchObject({
      change: -700,
      preventNegativeBalance: false,
    });
  });

  it('keeps the first earning date across corrections', async () => {
    mockedEvaluate.mockReturnValue({ total: 1500, breakdown: [] });
    // B replaced A and carries A's date.
    const active = logDoc({
      _id: 'B',
      changeScore: 1200,
      createdAt: new Date('2026-11-20T00:00:00Z'),
      lotDatesFrom: earnedAt,
    });
    const { earn, create } = setup({ active });

    await earn(input);

    expect(mockedChangeBalance.mock.calls[0][0]).toMatchObject({
      change: 300,
      sourceLogId: 'B',
      lotDatesFrom: earnedAt,
    });
    expect(create.mock.calls[0][0][1]).toMatchObject({
      lotDatesFrom: earnedAt,
    });
  });

  it('writes nothing when the amount is unchanged', async () => {
    mockedEvaluate.mockReturnValue({ total: 1000, breakdown: [] });
    const active = logDoc({ _id: 'A', changeScore: 1000, createdAt: earnedAt });
    const { earn, create } = setup({ active });

    expect(await earn(input)).toBe(active);
    expect(create).not.toHaveBeenCalled();
    expect(mockedChangeBalance).not.toHaveBeenCalled();
  });
});
