import { gql } from '~/gql';

export const FIXED_ASSET_CHOOSER = gql(`
  query accountingFixedAssetChooser($journal: String!, $date: Date!, $searchValue: String, $categoryId: String, $branchId: String, $departmentId: String, $ownerId: String, $excludeTransactionId: String, $page: Int) {
    accountingFixedAssetChooser(journal: $journal, date: $date, searchValue: $searchValue, categoryId: $categoryId, branchId: $branchId, departmentId: $departmentId, ownerId: $ownerId, excludeTransactionId: $excludeTransactionId, page: $page, perPage: 20) {
      totalCount
      hasMore
      items {
        asset { _id code name description categoryId accountId originalCost annualDepreciationRate depreciationMethod salvageValue }
        locations { branchId departmentId remainder owners { ownerId code count } }
        unlocatedOwners { ownerId code count }
      }
    }
  }
`);
