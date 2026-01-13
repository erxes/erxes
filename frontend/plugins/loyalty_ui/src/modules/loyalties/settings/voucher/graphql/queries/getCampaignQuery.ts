import { gql } from '@apollo/client';

export const getCampaignQuery = gql`
  query GetCampaign($id: String!) {
    getCampaign(_id: $id) {
      _id
      name
      description
      startDate
      endDate
      status
      type
      amount
      createdBy {
        email
        details {
          avatar
          firstName
          fullName
          lastName
          middleName
          position
        }
      }
      updatedBy {
        email
        details {
          avatar
          firstName
          fullName
          lastName
          position
          shortName
        }
      }
      conditions
      kind
    }
  }
`;
