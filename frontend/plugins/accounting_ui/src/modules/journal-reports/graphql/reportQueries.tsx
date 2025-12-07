import { gql } from '@apollo/client';

const trsFilterParamDefs = `
  $status: String,
  $searchValue: String,
  $number: String,

  $accountIds: [String],
  $accountKind: String,
  $accountExcludeIds: Boolean,
  $accountStatus: String,
  $accountCategoryId: String,
  $accountIsOutBalance: Boolean,
  $accountBranchId: String,
  $accountDepartmentId: String,
  $accountCurrency: String,
  $accountJournal: String,

  $brandId: String,
  $isOutBalance: Boolean,
  $branchId: String,
  $departmentId: String,
  $currency: String,
  $journal: String,
  $journals: [String],
  $statuses: [String],

  $createdUserId: String,
  $modifiedUserId: String,
  $fromDate: Date,
  $toDate: Date,

  $report: String!,
  $groupRule: JSON,
`;

const trsFilterParams = `
  status: $status,
  searchValue: $searchValue,
  number: $number,

  accountIds: $accountIds,
  accountKind: $accountKind,
  accountExcludeIds: $accountExcludeIds,
  accountStatus: $accountStatus,
  accountCategoryId: $accountCategoryId,
  accountIsOutBalance: $accountIsOutBalance,
  accountBranchId: $accountBranchId,
  accountDepartmentId: $accountDepartmentId,
  accountCurrency: $accountCurrency,
  accountJournal: $accountJournal,

  brandId: $brandId,
  isOutBalance: $isOutBalance,
  branchId: $branchId,
  departmentId: $departmentId,
  currency: $currency,
  journal: $journal,
  journals: $journals
  statuses: $statuses,

  createdUserId: $createdUserId,
  modifiedUserId: $modifiedUserId,
  fromDate: $fromDate,
  toDate: $toDate,

  report: $report,
  groupRule: $groupRule,
`;

export const JOURNAL_REPORT_QUERY = gql`
  query JournalReportData(${trsFilterParamDefs}) {
    journalReportData(${trsFilterParams}) {
      records
    }
  }
`;
