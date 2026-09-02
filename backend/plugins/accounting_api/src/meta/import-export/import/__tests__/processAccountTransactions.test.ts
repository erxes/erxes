/// <reference types="jest" />

import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { JOURNALS } from '~/modules/accounting/@types/constants';
import { processTransactionRows } from '../processAccountTransactions';

jest.mock('erxes-api-shared/utils', () => {
  return {
    fixNum: (value: unknown) => Number(value || 0),
    sendTRPCMessage: jest.fn(),
  };
});

const queryResult = <T>(value: T) => ({
  lean: jest.fn().mockResolvedValue(value),
});

const makeModels = () => ({
  Accounts: {
    find: jest.fn().mockReturnValue(
      queryResult([
        { _id: 'asset-account', code: '1010' },
        { _id: 'expense-account', code: '7110' },
        { _id: 'accumulated-account', code: '1310' },
        { _id: 'loss-account', code: '8910' },
        { _id: 'sale-account', code: '6010' },
      ]),
    ),
  },
  FixedAssets: {
    find: jest
      .fn()
      .mockReturnValue(queryResult([{ _id: 'fixed-asset-1', code: 'LAPTOP' }])),
  },
  Transactions: {
    findOne: jest.fn().mockResolvedValue(null),
    createPTransaction: jest.fn(async (docs) =>
      docs.map((doc) => ({ ...doc, parentId: doc.parentId })),
    ),
    updatePTransaction: jest.fn(),
  },
});

type TModels = ReturnType<typeof makeModels>;

const mockRelatedData = () => {
  const mockedSendTRPCMessage = sendTRPCMessage as jest.MockedFunction<
    typeof sendTRPCMessage
  >;

  mockedSendTRPCMessage.mockImplementation(async ({ module }) => {
    if (module === 'branches') {
      return [{ _id: 'branch-1', code: 'BR01' }];
    }

    if (module === 'departments') {
      return [{ _id: 'department-1', code: 'DP01' }];
    }

    return [];
  });
};

describe('account transaction import fixed assets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRelatedData();
  });

  it('uses productCode as fixed asset code without creating owner record extra data', async () => {
    const models = makeModels();

    const result = await processTransactionRows(
      'os',
      models as unknown as Parameters<typeof processTransactionRows>[1],
      [
        {
          date: '2026-01-10',
          number: 'FXA-IMPORT-1',
          journal: JOURNALS.FXA_INCOME,
          description: 'Fixed asset import',
          side: 'dt',
          accountCode: '1010',
          branchId: 'BR01',
          departmentId: 'DP01',
          productCode: 'LAPTOP',
          count: 2,
          unitPrice: 500,
        },
      ],
      'user-1',
    );

    expect(result.errorRows).toEqual([]);
    expect(models.FixedAssets.find).not.toHaveBeenCalled();
    expect(models.Transactions.createPTransaction).toHaveBeenCalledTimes(1);

    const trDocs = models.Transactions.createPTransaction.mock.calls[0][0];
    expect(trDocs[0]).toEqual(
      expect.objectContaining({
        journal: JOURNALS.FXA_INCOME,
      }),
    );
    expect(trDocs[0]).not.toHaveProperty('extraData.fxaOwnerRecords');
    expect(trDocs[0].details[0]).toEqual(
      expect.objectContaining({
        accountId: 'asset-account',
        branchId: 'branch-1',
        departmentId: 'department-1',
        productId: '',
        fixedAssetId: '',
        fixedAssetCode: 'LAPTOP',
        count: 2,
        unitPrice: 500,
        amount: 1000,
      }),
    );
  });

  it('keeps journal context for fixed asset detail rows without journal value', async () => {
    const models = makeModels();

    await processTransactionRows(
      'os',
      models as unknown as Parameters<typeof processTransactionRows>[1],
      [
        {
          date: '2026-01-10',
          number: 'FXA-IMPORT-2',
          journal: JOURNALS.FXA_INCOME,
          description: 'Fixed asset import',
          side: 'dt',
          accountCode: '1010',
          productCode: 'LAPTOP',
          count: 1,
          unitPrice: 500,
        },
        {
          accountCode: '1010',
          productCode: 'LAPTOP',
          count: 1,
          unitPrice: 700,
        },
      ],
      'user-1',
    );

    expect(models.FixedAssets.find).not.toHaveBeenCalled();
    expect(sendTRPCMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({
        module: 'products',
      }),
    );

    const trDocs = models.Transactions.createPTransaction.mock.calls[0][0];
    expect(trDocs[0].details[0]).toEqual(
      expect.objectContaining({
        productId: '',
        fixedAssetId: '',
        fixedAssetCode: 'LAPTOP',
        amount: 500,
      }),
    );
  });

  it('maps fixed asset disposal follow accounts from follow fields', async () => {
    const models = makeModels();

    await processTransactionRows(
      'os',
      models as unknown as Parameters<typeof processTransactionRows>[1],
      [
        {
          date: '2026-01-11',
          number: 'FXA-SALE-1',
          journal: JOURNALS.FXA_SALE,
          description: 'Fixed asset sale import',
          side: 'ct',
          accountCode: '6010',
          fixedAssetCode: 'LAPTOP',
          count: 1,
          unitPrice: 600,
          follow1: '1010',
          follow2: '1310',
          follow3: '8910',
        },
      ],
      'user-1',
    );

    const trDocs = models.Transactions.createPTransaction.mock.calls[0][0];
    expect(trDocs[0].followInfos).toEqual({
      fixedAssetAccountId: 'asset-account',
      accumulatedDepreciationAccountId: 'accumulated-account',
      lossAccountId: 'loss-account',
    });
    expect(trDocs[0].details[0]).toEqual(
      expect.objectContaining({
        accountId: 'sale-account',
        fixedAssetId: 'fixed-asset-1',
        productId: '',
      }),
    );
  });
});
