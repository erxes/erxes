import { gql } from '@apollo/client';

export const QUERY_DONATE_CAMPAIGN = gql`
  query GetDonateCampaign($id: String!) {
    donateCampaignDetail(_id: $id) {
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
  }
`;
