import { gql } from '@apollo/client';

export const FIXED_ASSETS_QUERY = gql`
  query FixedAssets($searchValue: String, $ids: [String], $limit: Int) {
    fixedAssets(searchValue: $searchValue, ids: $ids, limit: $limit) {
      _id
      code
      name
      categoryId
      depreciationMethod
      usefulLife
      salvageValue
      taxDepreciationMethod
      taxUsefulLife
      taxSalvageValue
    }
  }
`;

export const FXA_INSTANCES_QUERY = gql`
  query FxaInstances(
    $ids: [String]
    $fixedAssetIds: [String]
    $status: String
  ) {
    fxaInstances(ids: $ids, fixedAssetIds: $fixedAssetIds, status: $status) {
      _id
      fixedAssetId
      code
      sequence
      originalCost
      accumulatedDepreciation
      bookValue
      branchId
      departmentId
      responsibleUserId
    }
  }
`;
