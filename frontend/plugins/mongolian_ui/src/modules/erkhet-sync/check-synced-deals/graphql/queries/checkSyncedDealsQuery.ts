import { gql } from '@apollo/client';

export const checkSyncedDealsQuery = gql`
  query Deals(
    $limit: Int
    $userIds: [String]
    $pipelineId: String
    $stageId: String
    $stageChangedStartDate: Date
    $stageChangedEndDate: Date
    $startDate: String
    $endDate: String
    $noSkipArchive: Boolean
    $productIds: [String]
    $search: String
    $number: String
  ) {
    deals(
      limit: $limit
      userIds: $userIds
      pipelineId: $pipelineId
      stageId: $stageId
      stageChangedStartDate: $stageChangedStartDate
      stageChangedEndDate: $stageChangedEndDate
      startDate: $startDate
      endDate: $endDate
      noSkipArchive: $noSkipArchive
      productIds: $productIds
      search: $search
      number: $number
    ) {
      list {
        _id
        name
        amount
        number
        createdAt
        stageChangedDate
        __typename
        modifiedAt
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;
