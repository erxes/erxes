import { gql } from '~/gql';

export const FIXED_ASSETS_QUERY = gql(`
query AccountingFixedAssets($searchValue: String, $ids: [String], $limit: Int, $date: Date, $excludeTransactionId: String) {
  fixedAssets(searchValue: $searchValue, ids: $ids, limit: $limit, date: $date, excludeTransactionId: $excludeTransactionId) {
    _id
    code
    name
    categoryId
    accountId
    count
    currentCount
    originalCost
    accumulatedDepreciation
    bookValue
    acquisitionDate
    depreciationStartDate
    depreciationMethod
    annualDepreciationRate
    salvageValue
    taxDepreciationMethod
    taxAnnualDepreciationRate
    taxSalvageValue
  }
}
`);

export const FXA_OWNER_RECORDS_QUERY = gql(`
query AccountingFxaOwnerRecords($ids: [String], $fixedAssetIds: [String], $status: String, $transactionId: String, $balanceOnly: Boolean, $excludeTransactionId: String) {
  fxaOwnerRecords(
    ids: $ids
    fixedAssetIds: $fixedAssetIds
    status: $status
    transactionId: $transactionId
    balanceOnly: $balanceOnly
    excludeTransactionId: $excludeTransactionId
  ) {
    _id
    fixedAssetId
    code
    sequence
    count
    action
    status
    ownerId
  }
}
`);
