jest.mock('../scoreLedger', () => ({ applyScoreChange: jest.fn() }));
jest.mock('../earnEligibility', () => ({ mayEarn: jest.fn() }));

import { IModels } from '~/connectionResolvers';
import { mayEarn } from '../earnEligibility';
import { giveFixedPoints } from '../fixedPoints';
import { applyScoreChange } from '../scoreLedger';

const mockedApply = applyScoreChange as jest.Mock;
const mockedMayEarn = mayEarn as jest.Mock;

const wallet = {
  _id: 'w1',
  name: 'Points',
  ownerType: 'customer',
  fieldId: 'f1',
};

const buildModels = (accountType: Record<string, unknown>, given = null) =>
  ({
    LoyaltyAccountTypes: {
      getActiveAccountType: jest.fn().mockResolvedValue(accountType),
    },
    ScoreLogs: { findOne: jest.fn().mockResolvedValue(given) },
  } as unknown as IModels);

const input = {
  accountTypeId: 'w1',
  ownerType: 'customer',
  ownerId: 'c1',
  points: 100,
};

describe('giveFixedPoints', () => {
  beforeEach(() => {
    mockedApply.mockReset().mockResolvedValue({ log: { _id: 'log1' } });
    mockedMayEarn.mockReset();
  });

  it('writes the points into the wallet without a campaign', async () => {
    const result = await giveFixedPoints(buildModels(wallet), 'os', input);

    expect(result).toEqual({ log: { _id: 'log1' } });
    expect(mockedApply.mock.calls[0][0].doc).toMatchObject({
      fieldId: 'f1',
      action: 'add',
      changeScore: 100,
    });
    expect(mockedApply.mock.calls[0][0].doc.campaignId).toBeUndefined();
  });

  it('refuses zero and a wallet of another owner type', async () => {
    await expect(
      giveFixedPoints(buildModels(wallet), 'os', { ...input, points: 0 }),
    ).rejects.toThrow('more than zero');
    await expect(
      giveFixedPoints(
        buildModels({ ...wallet, ownerType: 'company' }),
        'os',
        input,
      ),
    ).rejects.toThrow('company');
  });

  it('skips an owner the wallet does not let earn', async () => {
    mockedMayEarn.mockResolvedValue(false);

    const result = await giveFixedPoints(
      buildModels({
        ...wallet,
        earnEligibility: { who: 'segment', segmentId: 's1' },
      }),
      'os',
      input,
    );

    expect(result).toEqual({
      skip: { reason: 'not-eligible', who: 'segment' },
    });
    expect(mockedApply).not.toHaveBeenCalled();
  });

  it('gives once per run', async () => {
    const result = await giveFixedPoints(
      buildModels(wallet, { _id: 'earlier' } as never),
      'os',
      { ...input, createdVia: { source: 'automation', runId: 'run1' } },
    );

    expect(result).toEqual({ log: { _id: 'earlier' } });
    expect(mockedApply).not.toHaveBeenCalled();
  });
});
