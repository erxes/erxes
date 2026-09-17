/// <reference types="jest" />

import { JOURNALS } from '../../@types/constants';
import {
  normalizeOpeningFixedAssetBalances,
  resolveErkhetFxaOwnerRecordSourcesForTest,
  resolveErkhetFxaOwnerRecordsForTest,
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

describe('Erkhet migration fixed asset owner records', () => {
  const maps = {
    accountsByCode: {},
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
