import { IReportConfig } from './common';

export const fixedAssetReportRules: Record<string, IReportConfig> = {
  fxa: {
    title: 'Үндсэн хөрөнгийн тайлан',
    colCount: 9,
    choices: [
      { code: 'fixedAsset', title: 'Хөрөнгөөр' },
      { code: 'accountFixedAsset', title: 'Данс-Хөрөнгө' },
      { code: 'branchDepartmentFixedAsset', title: 'Салбар-Хэлтэс-Хөрөнгө' },
    ],
    groups: {
      fixedAsset: {
        group: 'fixedAssetId',
        code: 'fixedAssetCode',
        name: 'fixedAssetName',
        from: ['details'],
        groupRule: null,
      },
      accountFixedAsset: {
        group: 'accountId',
        code: 'accountCode',
        name: 'accountName',
        from: ['details'],
        style: 'font-semibold',
        groupRule: {
          group: 'fixedAssetId',
          code: 'fixedAssetCode',
          name: 'fixedAssetName',
          from: ['details'],
          groupRule: null,
        },
      },
      branchDepartmentFixedAsset: {
        group: 'branchId',
        code: 'branchCode',
        name: 'branchName',
        style: 'font-semibold',
        groupRule: {
          group: 'departmentId',
          code: 'departmentCode',
          name: 'departmentName',
          style: 'font-semibold',
          groupRule: {
            group: 'fixedAssetId',
            code: 'fixedAssetCode',
            name: 'fixedAssetName',
            from: ['details'],
            groupRule: null,
          },
        },
      },
    },
  },
};
