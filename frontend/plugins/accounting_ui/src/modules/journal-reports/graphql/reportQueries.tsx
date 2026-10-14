import { gql } from '~/gql';

export const JOURNAL_REPORT_QUERY = gql(`
query accountingJournalReportData($status: String, $searchValue: String, $number: String, $ptrId: String, $accountId: String, $accountIds: [String], $accountKind: String, $accountExcludeIds: Boolean, $accountStatus: String, $accountCategoryId: String, $accountIsTemp: Boolean, $accountIsOutBalance: Boolean, $accountBranchId: String, $accountDepartmentId: String, $accountCurrency: String, $accountJournal: String, $brandId: String, $isOutBalance: Boolean, $productId: String, $productIds: [String], $productCategoryId: String, $productSearchValue: String, $fixedAssetId: String, $fixedAssetIds: [String], $fixedAssetCategoryId: String, $fixedAssetSearchValue: String, $customerId: String, $customerIds: [String], $customerTagIds: [String], $companyTagIds: [String], $contentType: String, $contentId: String, $branchId: String, $departmentId: String, $currency: String, $journal: String, $journals: [String], $trKind: String, $trKinds: [String], $getTrKind: String, $statuses: [String], $createdUserId: String, $modifiedUserId: String, $assignedUserId: String, $fromDate: Date, $toDate: Date, $report: String!, $groupRule: JSON) {
  journalReportData(
    status: $status
    searchValue: $searchValue
    number: $number
    ptrId: $ptrId
    accountId: $accountId
    accountIds: $accountIds
    accountKind: $accountKind
    accountExcludeIds: $accountExcludeIds
    accountStatus: $accountStatus
    accountCategoryId: $accountCategoryId
    accountIsTemp: $accountIsTemp
    accountIsOutBalance: $accountIsOutBalance
    accountBranchId: $accountBranchId
    accountDepartmentId: $accountDepartmentId
    accountCurrency: $accountCurrency
    accountJournal: $accountJournal
    brandId: $brandId
    isOutBalance: $isOutBalance
    productId: $productId
    productIds: $productIds
    productCategoryId: $productCategoryId
    productSearchValue: $productSearchValue
    fixedAssetId: $fixedAssetId
    fixedAssetIds: $fixedAssetIds
    fixedAssetCategoryId: $fixedAssetCategoryId
    fixedAssetSearchValue: $fixedAssetSearchValue
    customerId: $customerId
    customerIds: $customerIds
    customerTagIds: $customerTagIds
    companyTagIds: $companyTagIds
    contentType: $contentType
    contentId: $contentId
    branchId: $branchId
    departmentId: $departmentId
    currency: $currency
    journal: $journal
    journals: $journals
    trKind: $trKind
    trKinds: $trKinds
    getTrKind: $getTrKind
    statuses: $statuses
    createdUserId: $createdUserId
    modifiedUserId: $modifiedUserId
    assignedUserId: $assignedUserId
    fromDate: $fromDate
    toDate: $toDate
    report: $report
    groupRule: $groupRule
  ) {
    records
  }
}
`);

export const JOURNAL_REPORT_MORE_QUERY = gql(`
query accountingJournalReportMore($status: String, $searchValue: String, $number: String, $ptrId: String, $accountId: String, $accountIds: [String], $accountKind: String, $accountExcludeIds: Boolean, $accountStatus: String, $accountCategoryId: String, $accountIsTemp: Boolean, $accountIsOutBalance: Boolean, $accountBranchId: String, $accountDepartmentId: String, $accountCurrency: String, $accountJournal: String, $brandId: String, $isOutBalance: Boolean, $productId: String, $productIds: [String], $productCategoryId: String, $productSearchValue: String, $fixedAssetId: String, $fixedAssetIds: [String], $fixedAssetCategoryId: String, $fixedAssetSearchValue: String, $customerId: String, $customerIds: [String], $customerTagIds: [String], $companyTagIds: [String], $contentType: String, $contentId: String, $branchId: String, $departmentId: String, $currency: String, $journal: String, $journals: [String], $trKind: String, $trKinds: [String], $getTrKind: String, $statuses: [String], $createdUserId: String, $modifiedUserId: String, $assignedUserId: String, $fromDate: Date, $toDate: Date, $report: String!, $groupRule: JSON) {
  journalReportMore(
    status: $status
    searchValue: $searchValue
    number: $number
    ptrId: $ptrId
    accountId: $accountId
    accountIds: $accountIds
    accountKind: $accountKind
    accountExcludeIds: $accountExcludeIds
    accountStatus: $accountStatus
    accountCategoryId: $accountCategoryId
    accountIsTemp: $accountIsTemp
    accountIsOutBalance: $accountIsOutBalance
    accountBranchId: $accountBranchId
    accountDepartmentId: $accountDepartmentId
    accountCurrency: $accountCurrency
    accountJournal: $accountJournal
    brandId: $brandId
    isOutBalance: $isOutBalance
    productId: $productId
    productIds: $productIds
    productCategoryId: $productCategoryId
    productSearchValue: $productSearchValue
    fixedAssetId: $fixedAssetId
    fixedAssetIds: $fixedAssetIds
    fixedAssetCategoryId: $fixedAssetCategoryId
    fixedAssetSearchValue: $fixedAssetSearchValue
    customerId: $customerId
    customerIds: $customerIds
    customerTagIds: $customerTagIds
    companyTagIds: $companyTagIds
    contentType: $contentType
    contentId: $contentId
    branchId: $branchId
    departmentId: $departmentId
    currency: $currency
    journal: $journal
    journals: $journals
    trKind: $trKind
    trKinds: $trKinds
    getTrKind: $getTrKind
    statuses: $statuses
    createdUserId: $createdUserId
    modifiedUserId: $modifiedUserId
    assignedUserId: $assignedUserId
    fromDate: $fromDate
    toDate: $toDate
    report: $report
    groupRule: $groupRule
  ) {
    trDetails
  }
}
`);
