import { gql } from '@apollo/client';

export const FIXED_ASSETS_QUERY = gql`
  query AccountingFixedAssets(
    $searchValue: String
    $ids: [String]
    $limit: Int
  ) {
    fixedAssets(searchValue: $searchValue, ids: $ids, limit: $limit) {
      _id
      code
      name
      categoryId
      accountId
      count
      currentCount
      originalCost
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
`;

export const FXA_OWNER_RECORDS_QUERY = gql`
  query AccountingFxaOwnerRecords(
    $ids: [String]
    $fixedAssetIds: [String]
    $status: String
    $transactionId: String
    $balanceOnly: Boolean
  ) {
    fxaOwnerRecords(
      ids: $ids
      fixedAssetIds: $fixedAssetIds
      status: $status
      transactionId: $transactionId
      balanceOnly: $balanceOnly
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
`;
