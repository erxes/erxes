import { gql } from '@apollo/client';

export const VOUCHER_COMPANIES_QUERY = gql`
  query Companies(
    $segment: String
    $tagIds: [String]
    $excludeTagIds: [String]
    $tagWithRelated: Boolean
    $ids: [String]
    $excludeIds: Boolean
    $searchValue: String
    $autoCompletion: Boolean
    $autoCompletionType: String
    $sortField: String
    $sortDirection: Int
    $dateFilters: String
    $segmentData: String
    $status: CONTACT_STATUS
    $conformityMainType: String
    $conformityMainTypeId: String
    $conformityRelType: String
    $conformityIsRelated: Boolean
    $conformityIsSaved: Boolean
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
  ) {
    companies(
      segment: $segment
      tagIds: $tagIds
      excludeTagIds: $excludeTagIds
      tagWithRelated: $tagWithRelated
      ids: $ids
      excludeIds: $excludeIds
      searchValue: $searchValue
      autoCompletion: $autoCompletion
      autoCompletionType: $autoCompletionType
      sortField: $sortField
      sortDirection: $sortDirection
      dateFilters: $dateFilters
      segmentData: $segmentData
      status: $status
      conformityMainType: $conformityMainType
      conformityMainTypeId: $conformityMainTypeId
      conformityRelType: $conformityRelType
      conformityIsRelated: $conformityIsRelated
      conformityIsSaved: $conformityIsSaved
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
    ) {
      list {
        _id
        createdAt
        updatedAt
        avatar
        size
        website
        industry
        parentCompanyId
        ownerId
        mergedIds
        names
        primaryName
        emails
        primaryEmail
        phones
        primaryPhone
        primaryAddress
        addresses
        status
        businessType
        description
        isSubscribed
        links
        owner {
          _id
          details {
            fullName
          }
        }
        parentCompany {
          _id
          primaryName
        }
        tagIds
        trackedData
        propertiesData
        getTags {
          _id
          colorCode
          name
        }
        code
        location
        score
        cursor
      }
      totalCount
    }
  }
`;
