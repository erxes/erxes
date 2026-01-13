import { gql } from '@apollo/client';

export const LOYALTY_SCORE_ROW_REMOVE = gql`
  mutation RemoveCampaign($_id: String!) {
    removeCampaign(_id: $_id) {
      _id
      name
      description
      startDate
      endDate
      status
      type
      amount
      updatedBy {
        email
        details {
          avatar
          firstName
          fullName
          lastName
          middleName
          shortName
        }
      }
      conditions
      kind
      createdBy {
        email
        details {
          avatar
          firstName
          fullName
          lastName
          middleName
          shortName
        }
      }
    }
  }
`;
