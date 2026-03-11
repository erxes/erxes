import { gql } from '@apollo/client';

export const LOYALTY_SCORE_ROW_REMOVE = gql`
  mutation RemoveCampaign($_ids: [String]!) {
    removeCampaign(_ids: $_ids) {
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
