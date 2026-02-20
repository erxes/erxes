import { gql } from '@apollo/client';
import { GQL_CURSOR_PARAM_DEFS, GQL_CURSOR_PARAMS } from 'erxes-ui';

export const QUERY_SPIN_CAMPAIGNS = gql`
  query GetSpinCampaigns(
    $searchValue: String
    $status: String

  ${GQL_CURSOR_PARAM_DEFS}
  ) {
    spinCampaigns(
      searchValue: $searchValue
      status: $status

      ${GQL_CURSOR_PARAMS}
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
        attachment {
          url
          name
          size
          type
          __typename
        }
        status
        buyScore
        awards
        spinsCount
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
