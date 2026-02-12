import { gql } from '@apollo/client';

export const QUERY_ASSIGNMENT_CAMPAIGN = gql`
  query GetAssignmentCampaign($_id: String!) {
    assignmentCampaignDetail(_id: $_id) {
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
  }
`;
