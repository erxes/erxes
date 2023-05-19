export const menuContracts = [
  {
    title: 'Contracts',
    link: '/erxes-plugin-loan/contract-list',
    permission: 'showContracts'
  },
  {
    title: 'Collaterals',
    link: '/erxes-plugin-loan/collateral-list',
    permission: 'showCollaterals'
  },
  {
    title: 'Transactions',
    link: '/erxes-plugin-loan/transaction-list',
    permission: 'showTransactions'
  },
  {
    title: 'PeriodLocks',
    link: '/erxes-plugin-loan/periodLock-list',
    permission: 'showPeriodLocks'
  }
];

export const FILTER_PARAMS_TR = [
  'search',
  'contractId',
  'companyId',
  'customerId',
  'contractHasnt',
  'startDate',
  'payDate',
  'endDate'
];

export const FILTER_PARAMS_CONTRACT = [
  'isExpired',
  'closeDate',
  'repaymentDate',
  'startStartDate',
  'endStartDate',
  'startCloseDate',
  'endCloseDate',
  'contractTypeId',
  'customerId',
  'companyId',
  'leaseAmount',
  'interestRate',
  'tenor',
  'repayment',
  'branchId'
];

export const WEEKENDS = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
};
