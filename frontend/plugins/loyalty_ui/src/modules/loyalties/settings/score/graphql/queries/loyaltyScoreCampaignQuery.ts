import { gql } from '@apollo/client';
import { GQL_CURSOR_PARAM_DEFS, GQL_CURSOR_PARAMS } from 'erxes-ui';

export const LOYALTY_SCORE_CAMPAIGN_QUERY = gql`
  query GetScoreCampaigns(
    $searchValue: String
    $status: String
    
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    scoreCampaigns(
      searchValue: $searchValue
      status: $status
      
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        title
        description
        order
        add
        subtract
        createdAt
        createdUserId
        status
        ownerType
        accountTypeId
        accountType {
          _id
          name
          status
        }
        fieldId
        serviceName
        additionalConfig
        restrictions
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
