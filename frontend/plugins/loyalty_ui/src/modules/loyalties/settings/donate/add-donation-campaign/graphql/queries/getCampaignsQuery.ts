import { gql } from '@apollo/client';
import { GQL_CURSOR_PARAM_DEFS, GQL_CURSOR_PARAMS } from 'erxes-ui';

export const QUERY_DONATE_CAMPAIGNS = gql`
  query GetDonateCampaigns(
    $searchValue: String
    $status: String

    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    donateCampaigns(
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
        maxScore
        awards
        donatesCount
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
