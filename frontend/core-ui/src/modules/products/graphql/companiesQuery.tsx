import { gql } from '@apollo/client';

export const companiesLowDetailQuery = gql`
  query companies(
    $page: Int
    $perPage: Int
    $segment: String
    $tag: String
    $ids: [String]
    $excludeIds: Boolean
    $searchValue: String
    $autoCompletion: Boolean
    $autoCompletionType: String
    $brand: String
    $sortField: String
    $sortDirection: Int
    $dateFilters: String
    $mainType: String
    $mainTypeId: String
    $relType: String
    $isRelated: Boolean
    $isSaved: Boolean
  ) {
    companies(
      page: $page
      perPage: $perPage
      segment: $segment
      tag: $tag
      ids: $ids
      excludeIds: $excludeIds
      searchValue: $searchValue
      autoCompletion: $autoCompletion
      autoCompletionType: $autoCompletionType
      brand: $brand
      sortField: $sortField
      sortDirection: $sortDirection
      dateFilters: $dateFilters
      conformityMainType: $mainType
      conformityMainTypeId: $mainTypeId
      conformityRelType: $relType
      conformityIsRelated: $isRelated
      conformityIsSaved: $isSaved
    ) {
      _id
      primaryName
    }
  }
`;
