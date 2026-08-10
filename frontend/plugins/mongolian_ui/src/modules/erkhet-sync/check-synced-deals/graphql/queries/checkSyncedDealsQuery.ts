import { gql } from '@apollo/client';
import { GQL_CURSOR_PARAM_DEFS, GQL_CURSOR_PARAMS } from 'erxes-ui';

export const checkSyncedDealsQuery = gql`
  query Deals(
    ${GQL_CURSOR_PARAM_DEFS}
    $userIds: [String]
    $stageId: String
    $stageChangedStartDate: Date
    $stageChangedEndDate: Date
    $startDate: String
    $endDate: String
    $createdStartDate: Date
    $createdEndDate: Date
    $noSkipArchive: Boolean
    $productIds: [String]
    $search: String
    $number: String
  ) {
    deals(
      ${GQL_CURSOR_PARAMS}
      userIds: $userIds
      stageId: $stageId
      stageChangedStartDate: $stageChangedStartDate
      stageChangedEndDate: $stageChangedEndDate
      startDate: $startDate
      endDate: $endDate
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
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
