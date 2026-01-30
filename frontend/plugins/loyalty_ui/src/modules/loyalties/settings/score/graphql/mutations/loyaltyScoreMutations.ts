import { gql } from '@apollo/client';

export const UPDATE_LOYALTY_SCORE = gql`
  mutation CreateCampaign(
    $name: String!
    $kind: String!
    $description: String
    $status: String
    $startDate: String
    $endDate: String
    $type: String
    $amount: Float
    $conditions: JSON
  ) {
    createCampaign(
      name: $name
      kind: $kind
      description: $description
      status: $status
      startDate: $startDate
      endDate: $endDate
      type: $type
      amount: $amount
      conditions: $conditions
    ) {
      _id
      name
      description
      status
      startDate
      endDate
      type
      amount
      createdBy {
        email
        details {
          avatar

          fullName
          shortName
          birthDate
          firstName
          middleName
          lastName
        }
      }
      updatedBy {
        email
        details {
          avatar
          firstName
          fullName
          lastName
          shortName
          middleName
        }
      }
      conditions
      kind
    }
  }
`;
