import { gql } from '@apollo/client';

export const removeVoucherMutation = gql`
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
