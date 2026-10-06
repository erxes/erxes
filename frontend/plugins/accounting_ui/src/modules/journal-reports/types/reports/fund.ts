import { IReportConfig } from './common';

export const fundReportRules: Record<string, IReportConfig> = {
  fund: {
    title: 'cash-and-bank-report',
    colCount: 6,
    choices: [
      { code: 'default', title: 'by-account' },
      { code: 'cat', title: 'by-account-category' },
      { code: 'branchDepartment', title: 'by-branch-and-department' },
      { code: 'departmentBranch', title: 'by-department-and-branch' },
    ],
    groups: {
      default: {
        group: 'accountId',
        code: 'accountCode',
        name: 'accountName',
        from: ['details'],
        style: 'font-semibold bg-[#fefef1]',
        groupRule: null,
      },
      cat: {
        group: 'accountCategoryId',
        code: 'accountCategoryCode',
        name: 'accountCategoryName',
        excMore: true,
        style: 'font-semibold',
        groupRule: {
          group: 'accountId',
          code: 'accountCode',
          name: 'accountName',
          from: ['details'],
          style: 'font-semibold bg-[#fefef1]',
          groupRule: null,
        },
      },
      branchDepartment: {
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
            group: 'accountId',
            code: 'accountCode',
            name: 'accountName',
            from: ['details'],
            style: 'font-semibold bg-[#fefef1]',
            groupRule: null,
          },
        },
      },
      departmentBranch: {
        group: 'departmentId',
        code: 'departmentCode',
        name: 'departmentName',
        style: 'font-semibold',
        groupRule: {
          group: 'branchId',
          code: 'branchCode',
          name: 'branchName',
          style: 'font-semibold',
          groupRule: {
            group: 'accountId',
            code: 'accountCode',
            name: 'accountName',
            from: ['details'],
            style: 'font-semibold bg-[#fefef1]',
            groupRule: null,
          },
        },
      },
    },
  },
};
