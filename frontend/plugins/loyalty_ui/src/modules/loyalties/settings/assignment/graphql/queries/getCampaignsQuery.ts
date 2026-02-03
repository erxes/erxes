import { gql } from '@apollo/client';
import { GQL_CURSOR_PARAM_DEFS, GQL_CURSOR_PARAMS } from 'erxes-ui';

export const QUERY_ASSIGNMENT_CAMPAIGNS = gql`
  query GetCampaigns(
    $searchValue: String
    $status: String
   
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    assignmentCampaigns(
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
        fieldId
        allowMultiWin
        segmentIds
        voucherCampaignId
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
