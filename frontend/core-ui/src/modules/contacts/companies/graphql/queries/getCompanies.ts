import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const GET_COMPANIES = gql`
  query companies(
    $segment: String
    $tagIds: [String]
    $ids: [String]
    $excludeIds: Boolean
    $searchValue: String
    $autoCompletion: Boolean
    $autoCompletionType: String
    $sortField: String
    $sortDirection: Int
    $dateFilters: String
    $segmentData: String
    $mainType: String
    $mainTypeId: String
    $relType: String
    $isRelated: Boolean
    $isSaved: Boolean
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    companies(
      segment: $segment
      tagIds: $tagIds
      ids: $ids
      excludeIds: $excludeIds
      searchValue: $searchValue
      autoCompletion: $autoCompletion
      autoCompletionType: $autoCompletionType
      sortField: $sortField
      sortDirection: $sortDirection
      dateFilters: $dateFilters
      segmentData: $segmentData
      conformityMainType: $mainType
      conformityMainTypeId: $mainTypeId
      conformityRelType: $relType
      conformityIsRelated: $isRelated
      conformityIsSaved: $isSaved
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        avatar
        primaryName
        names
        size
        industry
        plan
        location
        parentCompanyId
        emails
        primaryEmail
        ownerId
        phones
        primaryPhone
        businessType
        links
        ownerId
        tagIds
        score
      }
      ${GQL_PAGE_INFO}
    }
  }
`;
