jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  sendTRPCMessage: jest.fn(),
}));

import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { buildAccountFilter } from '../accountList';

const mockedTRPC = sendTRPCMessage as jest.Mock;

describe('buildAccountFilter', () => {
  beforeEach(() => mockedTRPC.mockReset());

  it('narrows to a tier of one account type', async () => {
    expect(
      await buildAccountFilter('test', { accountTypeId: 'at1', tier: 'gold' }),
    ).toEqual({ 'balances.at1.tier': 'gold' });
  });

  it('reads "none" as holding that account type without a tier', async () => {
    expect(
      await buildAccountFilter('test', { accountTypeId: 'at1', tier: 'none' }),
    ).toEqual({
      'balances.at1': { $exists: true },
      'balances.at1.tier': { $in: [null, ''] },
    });
  });

  it('looks an account number up directly', async () => {
    expect(
      await buildAccountFilter('test', { searchValue: ' 4867949211 ' }),
    ).toEqual({ number: '4867949211' });
    expect(mockedTRPC).not.toHaveBeenCalled();
  });

  it('matches owners by name through core', async () => {
    mockedTRPC.mockImplementation(async ({ module }) =>
      module === 'customers' ? [{ _id: 'c1' }] : [],
    );

    expect(await buildAccountFilter('test', { searchValue: 'Bold' })).toEqual({
      $or: [{ ownerType: 'customer', ownerId: { $in: ['c1'] } }],
    });
  });

  it('returns nothing when no owner matches', async () => {
    mockedTRPC.mockResolvedValue([]);

    expect(
      await buildAccountFilter('test', {
        searchValue: 'nobody',
        ownerType: 'customer',
      }),
    ).toEqual({ ownerType: 'customer', _id: { $in: [] } });
  });
});
