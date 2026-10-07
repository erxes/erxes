/// <reference types="jest" />

import { JOURNALS } from '../../@types/constants';
import { getRecMore } from '../journalReports';
import { resolveErkhetReportJournals } from '../journalReports/erkhetKinds';
import { getReportDetailRecords } from '../journalReports/maps';

const mockSendTRPCMessage = jest.fn();

jest.mock('erxes-api-shared/utils', () => ({
  cursorPaginate: jest.fn(),
  defaultPaginate: jest.fn(),
  escapeRegExp: (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
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

  it('loads detail rows for summary reports and filters the selected pointer', async () => {
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
    } as unknown as Parameters<typeof getRecMore>[1];

    await getRecMore('test', models, 'tb', { ptrId: 'pointer-1' }, {
      _id: 'user-1',
      isOwner: true,
    } as Parameters<typeof getRecMore>[4]);

    const transactionMatch = aggregateMock.mock.calls[0][0][0].$match;

    expect(transactionMatch.$and).toContainEqual({
      $or: [{ ptrId: 'pointer-1' }, { parentId: 'pointer-1' }],
    });
  });

  it('keeps inventory detail rows inside the selected period', async () => {
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
    } as unknown as Parameters<typeof getRecMore>[1];
    const fromDate = new Date('2026-08-01T00:00:00.000Z');
    const toDate = new Date('2026-09-29T00:00:00.000Z');

    await getRecMore('test', models, 'invCost', { fromDate, toDate }, {
      _id: 'user-1',
      isOwner: true,
    } as Parameters<typeof getRecMore>[4]);

    expect(aggregateMock.mock.calls[0][0][0].$match.date).toEqual({
      $gte: fromDate,
      $lte: toDate,
    });
  });
});
