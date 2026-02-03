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
        add
        subtract
        createdAt
        createdUserId
        status
        ownerType
        fieldGroupId
        fieldName
        fieldId
        serviceName
        additionalConfig
        restrictions
        onlyClientPortal
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
