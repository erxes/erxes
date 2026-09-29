/// <reference types="jest" />

import { JOURNALS } from '../../@types/constants';
import { resolveErkhetReportJournals } from '../journalReports/erkhetKinds';
import { getReportDetailRecords } from '../journalReports/maps';

const mockSendTRPCMessage = jest.fn();

jest.mock('erxes-api-shared/utils', () => ({
  cursorPaginate: jest.fn(),
  defaultPaginate: jest.fn(),
  escapeRegExp: (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  getPureDate: (value: Date) => value,
  sendTRPCMessage: (...args: unknown[]) => mockSendTRPCMessage(...args),
}));

describe('resolveErkhetReportJournals', () => {
  it('includes cost adjustments in the inventory adjustment report filter', () => {
    expect(resolveErkhetReportJournals({ getTrKind: 'only_adjust' })).toEqual({
      hasFilter: true,
      journals: [JOURNALS.INV_JUSTIFY],
    });
  });
});

describe('journal report filters', () => {
  beforeEach(() => {
    mockSendTRPCMessage.mockReset();
  });

  it('keeps product category product ids when merging inventory detail filters', async () => {
    const aggregateMock = jest.fn().mockResolvedValue([]);
    const models = {
      AccountCategories: {
        find: jest.fn().mockResolvedValue([]),
      },
      Accounts: {
        find: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ _id: 'account-1' }]),
        }),
      },
      Transactions: {
        aggregate: aggregateMock,
      },
    } as unknown as Parameters<typeof getReportDetailRecords>[1];

    mockSendTRPCMessage.mockImplementation(({ module }) => {
      if (module === 'products') {
        return Promise.resolve([{ _id: 'product-1' }]);
      }

      return Promise.resolve([]);
    });

    await getReportDetailRecords(
      'test',
      models,
      { productCategoryId: 'category-1' },
      { _id: 'user-1', isOwner: true } as Parameters<
        typeof getReportDetailRecords
      >[3],
      {
        code: 'invCost',
        baseGroups: ['accountId', 'productId'],
        extraDetailMatch: {
          'details.productId': { $exists: true, $ne: '' },
        },
      },
    );

    const pipeline = aggregateMock.mock.calls[0][0];
    const expectedProductMatch = {
      $in: ['product-1'],
      $exists: true,
      $ne: '',
    };

    expect(pipeline[0].$match['details.productId']).toEqual(
      expectedProductMatch,
    );
    expect(pipeline[2].$match['details.productId']).toEqual(
      expectedProductMatch,
    );
  });
});
