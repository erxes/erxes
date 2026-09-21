/// <reference types="jest" />

import { JOURNALS } from '../../@types/constants';
import {
  getErkhetTransactionCodeMapForTest,
  normalizeOpeningFixedAssetBalances,
  resolveErkhetInvIncomeExpensesForTest,
  resolveErkhetFxaOwnerRecordSourcesForTest,
  resolveErkhetFxaOwnerRecordsForTest,
  resolveErkhetTransactionFollowInfosForTest,
  resolveErkhetTransactionVatRowIdForTest,
} from '../erkhetMigration';
import { IModels } from '~/connectionResolvers';

describe('Erkhet migration fixed asset openings', () => {
  it('reduces opening balance main transaction by fixed asset accumulated depreciation', () => {
    const docs = normalizeOpeningFixedAssetBalances([
      {
        _id: 'income-tr',
        date: new Date('2025-12-31T00:00:00.000Z'),
        journal: JOURNALS.FXA_INCOME,
        contentId: 'opening-200301-1-asset-3',
        followInfos: {},
        details: [
          {
            _id: 'opening-detail-200301-asset-3',
            accountId: 'asset-account',
            amount: 350000,
            fixedAssetId: 'asset-a',
            fixedAssetCategoryId: 'cat-a',
            followInfos: {
              accountCode: '200301',
              branchCode: '2000',
              preDeprecation: 233333.33333333334,
            },
          },
        ],
      },
      {
        _id: 'balance-tr',
        date: new Date('2025-12-31T00:00:00.000Z'),
        journal: JOURNALS.MAIN,
        contentId: 'opening-200301-1-asset-3',
        followInfos: {},
        details: [
          {
            accountId: 'opening-balance-account',
            amount: 350000,
            followInfos: {
              sourceAccountCode: '200301',
              openingBalanceAccount: true,
              accountCode: '990909',
              branchCode: '2000',
            },
          },
        ],
      },
    ]);

    expect(docs[1].details[0].amount).toBe(116666.6667);
  });
});

describe('Erkhet migration inventory sale follow accounts', () => {
  const transaction = {
    date: new Date('2026-01-01T00:00:00.000Z'),
    journal: JOURNALS.INV_SALE,
    followInfos: {
      saleOutAccountId: '201001',
      saleCostAccountId: '701001',
    },
    hasVat: true,
    vatRowId: '36',
    details: [
      {
        accountId: '501001',
        productId: 'product-1',
        count: 1,
        amount: 100,
      },
    ],
  };

  it('collects and resolves inventory sale follow account codes', () => {
    expect(getErkhetTransactionCodeMapForTest([transaction])).toEqual(
      expect.objectContaining({
        accountCodes: expect.arrayContaining(['201001', '701001']),
        vatRowNumbers: ['36'],
      }),
    );

    expect(
      resolveErkhetTransactionFollowInfosForTest(transaction, {
        accountsByCode: {
          '201001': 'sale-out-account-id',
          '701001': 'sale-cost-account-id',
        },
        vatRowsByNumber: {},
        ctaxRowsByNumber: {},
        branchesByCode: {},
        departmentsByCode: {},
        customersByCode: {},
        productsByCode: {},
        fixedAssetCategoriesByCode: {},
        fixedAssetsByCode: {},
        usersByRef: {},
      }),
    ).toEqual(
      expect.objectContaining({
        saleOutAccountId: 'sale-out-account-id',
        saleCostAccountId: 'sale-cost-account-id',
        saleOutAccountCode: '201001',
        saleCostAccountCode: '701001',
      }),
    );

    expect(
      resolveErkhetTransactionVatRowIdForTest(transaction, {
        accountsByCode: {},
        vatRowsByNumber: { '36': 'vat-row-id' },
        ctaxRowsByNumber: {},
        branchesByCode: {},
        departmentsByCode: {},
        customersByCode: {},
        productsByCode: {},
        fixedAssetCategoriesByCode: {},
        fixedAssetsByCode: {},
        usersByRef: {},
      }),
    ).toBe('vat-row-id');
  });
});

describe('Erkhet migration inventory income expenses', () => {
  const maps = {
    accountsByCode: { '201001': 'expense-account-id' },
    vatRowsByNumber: {},
    ctaxRowsByNumber: {},
    branchesByCode: {},
    departmentsByCode: {},
    customersByCode: {},
    productsByCode: {},
    fixedAssetCategoriesByCode: {},
    fixedAssetsByCode: {},
    usersByRef: {},
  };

  it('collects and resolves expense account codes while preserving weight allocation', () => {
    const transaction = {
      date: new Date('2026-01-01T00:00:00.000Z'),
      journal: JOURNALS.INV_INCOME,
      details: [
        {
          accountId: '101001',
          productId: 'product-1',
          count: 2,
          weight: 10,
          amount: 100,
        },
      ],
      extraData: {
        invIncomeExpenses: [
          {
            _id: 'expense-1',
            title: 'Transport',
            rule: 'weight' as const,
            amount: 20,
            accountId: '201001',
          },
        ],
      },
    };

    expect(getErkhetTransactionCodeMapForTest([transaction])).toEqual(
      expect.objectContaining({
        accountCodes: expect.arrayContaining(['101001', '201001']),
      }),
    );
    expect(
      resolveErkhetInvIncomeExpensesForTest(
        transaction.extraData.invIncomeExpenses,
        maps,
      ),
    ).toEqual([
      expect.objectContaining({
        rule: 'weight',
        accountId: 'expense-account-id',
      }),
    ]);
    expect(transaction.details[0].weight).toBe(10);
  });

  it('rejects an unknown expense account code', () => {
    expect(() =>
      resolveErkhetInvIncomeExpensesForTest(
        [{ rule: 'amount', amount: 20, accountId: 'missing' }],
        maps,
      ),
    ).toThrow('Account not found: missing');
  });
});

describe('Erkhet migration fixed asset owner records', () => {
  const maps = {
    accountsByCode: {},
    vatRowsByNumber: {},
    ctaxRowsByNumber: {},
    branchesByCode: {},
    departmentsByCode: {},
    customersByCode: {},
    productsByCode: {},
    fixedAssetCategoriesByCode: {},
    fixedAssetsByCode: {
      'asset-1': 'fixed-asset-id-1',
    },
    usersByRef: {
      'owner@example.com': 'user-owner-id',
    },
  };

  it('skips only owner record rows whose users were not synced', () => {
    const ownerRecords = resolveErkhetFxaOwnerRecordsForTest(
      [
        {
          transactionDetailId: 'detail-1',
          fixedAssetId: 'asset-1',
          ownerId: 'owner@example.com',
          count: 1,
        },
        {
          transactionDetailId: 'detail-2',
          fixedAssetId: 'asset-1',
          ownerId: 'missing@example.com',
          count: 1,
        },
      ],
      maps,
    );

    expect(ownerRecords).toEqual([
      {
        _id: undefined,
        fxaOwnerRecordId: undefined,
        tempId: undefined,
        transactionDetailId: 'detail-1',
        code: undefined,
        sequence: undefined,
        count: 1,
        fixedAssetId: 'fixed-asset-id-1',
        ownerId: 'user-owner-id',
        sourceOwnerId: undefined,
        sourceResponsibleUserId: undefined,
      },
    ]);
  });

  it('still rejects owner record rows for missing fixed assets', () => {
    expect(() =>
      resolveErkhetFxaOwnerRecordsForTest(
        [
          {
            transactionDetailId: 'detail-1',
            fixedAssetId: 'missing-asset',
            ownerId: 'owner@example.com',
            count: 1,
          },
        ],
        maps,
      ),
    ).toThrow('Fixed asset not found: missing-asset');
  });

  it('skips an out owner row when its source allocation has no balance', async () => {
    const lean = jest.fn().mockResolvedValue([]);
    const limit = jest.fn().mockReturnValue({ lean });
    const find = jest.fn().mockReturnValue({ limit });
    const models = {
      FxaOwnerRecords: { find },
    } as unknown as IModels;

    const ownerRecords = await resolveErkhetFxaOwnerRecordSourcesForTest(
      models,
      {
        date: new Date('2026-01-01T00:00:00.000Z'),
        journal: JOURNALS.FXA_OUT,
        details: [
          {
            _id: 'detail-out-1',
            accountId: 'asset-account',
            fixedAssetId: 'fixed-asset-id-1',
            count: 1,
            amount: 100,
          },
        ],
      },
      [
        {
          transactionDetailId: 'detail-out-1',
          fixedAssetId: 'fixed-asset-id-1',
          count: 1,
        },
      ],
    );

    expect(ownerRecords).toEqual([]);
    expect(find).toHaveBeenCalledWith(
      {
        fixedAssetId: 'fixed-asset-id-1',
        status: 'active',
      },
      expect.any(Object),
    );
  });
});
