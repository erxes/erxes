import { __ } from 'coreui/utils';
export const menuContracts = [
  {
    title: __('Contracts'),
    link: '/erxes-plugin-saving/contract-list',
    permission: 'showContracts'
  },
  {
    title: __('Transactions'),
    link: '/erxes-plugin-saving/transaction-list',
    permission: 'showTransactions'
  },
  {
    title: __('PeriodLocks'),
    link: '/erxes-plugin-saving/periodLock-list',
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
  'startStartDate',
  'endStartDate',
  'startCloseDate',
  'endCloseDate',
  'contractTypeId',
  'customerId',
  'companyId',
  'savingAmount',
  'interestRate',
  'branchId',
  'ids'
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
