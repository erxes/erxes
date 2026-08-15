import { IReportConfig } from './common';

export const debtReportRules: Record<string, IReportConfig> = {
  debt: {
    title: 'Авлага өглөгийн тайлан',
    colCount: 6,
    choices: [
      { code: 'customerAccount', title: 'Харилцагч-Данс' },
      { code: 'accountCustomer', title: 'Данс-Харилцагч' },
    ],
    initParams: {
      isMore: true,
    },
    groups: {
      customerAccount: {
        group: 'customerId',
        code: 'customerCode',
        name: 'customerName',
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
      accountCustomer: {
        group: 'accountId',
        code: 'accountCode',
        name: 'accountName',
        from: ['details'],
        style: 'font-semibold',
        groupRule: {
          group: 'customerId',
          code: 'customerCode',
          name: 'customerName',
          style: 'font-semibold bg-[#fefef1]',
          groupRule: null,
        },
      },
    },
  },
};
