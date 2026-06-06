import { gql } from '@apollo/client';
export const QUERY_LOTTERY_CAMPAIGNS = gql`
  query LotteryCampaigns(
    $status: String
    $searchValue: String
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
  ) {
    lotteryCampaigns(
      status: $status
      searchValue: $searchValue
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
        createdBy
        modifiedAt
        modifiedBy
        title
        description
        startDate
        endDate
        finishDateOfUse

        status
        numberFormat
        buyScore
        awards
        lotteriesCount
        updatedAt
      }

      totalCount
    }
  }
`;
