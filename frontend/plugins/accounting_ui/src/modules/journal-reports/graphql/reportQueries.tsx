import { gql } from '@apollo/client';

const trsFilterParamDefs = `
  $status: String,
  $searchValue: String,
  $number: String,
  
  $accountId: String,
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
  $productId: String,
  $productIds: [String],
  $fixedAssetId: String,
  $fixedAssetIds: [String],
  $customerId: String,
  $customerIds: [String],
  $contentType: String,
  $contentId: String,
  $branchId: String,
  $departmentId: String,
  $currency: String,
  $journal: String,
  $journals: [String],
  $trKind: String,
  $trKinds: [String],
  $getTrKind: String,
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

  accountId: $accountId,
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
  productId: $productId,
  productIds: $productIds,
  fixedAssetId: $fixedAssetId,
  fixedAssetIds: $fixedAssetIds,
  customerId: $customerId,
  customerIds: $customerIds,
  contentType: $contentType,
  contentId: $contentId,
  branchId: $branchId,
  departmentId: $departmentId,
  currency: $currency,
  journal: $journal,
  journals: $journals,
  trKind: $trKind,
  trKinds: $trKinds,
  getTrKind: $getTrKind,
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

export const JOURNAL_REPORT_MORE_QUERY = gql`
  query JournalReportMore(${trsFilterParamDefs}) {
    journalReportMore(${trsFilterParams}) {
      trDetails
    }
  }
`;
