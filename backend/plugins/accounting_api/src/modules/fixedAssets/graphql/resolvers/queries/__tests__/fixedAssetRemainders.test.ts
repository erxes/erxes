import { JOURNALS } from '@/accounting/@types/constants';

import { buildFixedAssetLocationRemainderRows } from '../fixedAssets';

describe('buildFixedAssetLocationRemainderRows', () => {
  it('groups fixed asset movement quantities by fixed asset, branch, and department', () => {
    const rows = buildFixedAssetLocationRemainderRows({
      fixedAssetIds: ['asset-a', 'asset-b'],
      transactions: [
        {
          journal: JOURNALS.FXA_INCOME,
          branchId: 'branch-a',
          departmentId: 'department-a',
          details: [{ fixedAssetId: 'asset-a', count: 5 }],
        },
        {
          journal: JOURNALS.FXA_OUT,
          branchId: 'branch-a',
          departmentId: 'department-a',
          details: [{ fixedAssetId: 'asset-a', count: 2 }],
        },
        {
          journal: JOURNALS.FXA_MOVE,
          branchId: 'branch-a',
          departmentId: 'department-a',
          details: [{ fixedAssetId: 'asset-a', count: 1 }],
        },
        {
          journal: JOURNALS.FXA_MOVE_IN,
          branchId: 'branch-b',
          departmentId: 'department-b',
          details: [{ fixedAssetId: 'asset-a', count: 1 }],
        },
        {
          journal: JOURNALS.FXA_INCOME,
          branchId: 'branch-a',
          departmentId: 'department-a',
          details: [{ fixedAssetId: 'asset-b', count: 4 }],
        },
        {
          journal: JOURNALS.MAIN,
          branchId: 'branch-a',
          departmentId: 'department-a',
          details: [{ fixedAssetId: 'asset-a', count: 10 }],
        },
      ],
    });

    expect(rows).toEqual([
      {
        fixedAssetId: 'asset-a',
        branchId: 'branch-a',
        departmentId: 'department-a',
        remainder: 2,
      },
      {
        fixedAssetId: 'asset-a',
        branchId: 'branch-b',
        departmentId: 'department-b',
        remainder: 1,
      },
      {
        fixedAssetId: 'asset-b',
        branchId: 'branch-a',
        departmentId: 'department-a',
        remainder: 4,
      },
    ]);
  });

  it('applies location filters and excludes depleted balances', () => {
    const rows = buildFixedAssetLocationRemainderRows({
      branchId: 'branch-b',
      departmentId: 'department-b',
      fixedAssetIds: ['asset-a', 'asset-b'],
      transactions: [
        {
          journal: JOURNALS.FXA_INCOME,
          branchId: 'branch-a',
          departmentId: 'department-a',
          details: [{ fixedAssetId: 'asset-a', count: 2 }],
        },
        {
          journal: JOURNALS.FXA_OUT,
          branchId: 'branch-a',
          departmentId: 'department-a',
          details: [{ fixedAssetId: 'asset-a', count: 2 }],
        },
        {
          journal: JOURNALS.FXA_INCOME,
          branchId: 'branch-b',
          departmentId: 'department-b',
          details: [{ fixedAssetId: 'asset-b', count: 3 }],
        },
      ],
    });

    expect(rows).toEqual([
      {
        fixedAssetId: 'asset-b',
        branchId: 'branch-b',
        departmentId: 'department-b',
        remainder: 3,
      },
    ]);
  });

  it('can explicitly match empty branch and department locations', () => {
    const rows = buildFixedAssetLocationRemainderRows({
      branchId: '',
      departmentId: '',
      fixedAssetIds: ['asset-a'],
      transactions: [
        {
          journal: JOURNALS.FXA_INCOME,
          details: [{ fixedAssetId: 'asset-a', count: 1 }],
        },
        {
          journal: JOURNALS.FXA_INCOME,
          branchId: 'branch-a',
          departmentId: 'department-a',
          details: [{ fixedAssetId: 'asset-a', count: 5 }],
        },
      ],
    });

    expect(rows).toEqual([
      {
        fixedAssetId: 'asset-a',
        branchId: '',
        departmentId: '',
        remainder: 1,
      },
    ]);
  });
});
