import { gql } from '@apollo/client';

export const LOYALTY_SCORE_ADD_MUTATION = gql`
  mutation CreateCampaign(
    $name: String!
    $kind: String!
    $description: String
    $status: String
    $type: String
    $startDate: Date
    $endDate: Date
    $amount: Float
    $conditions: JSON
  ) {
    createCampaign(
      name: $name
      kind: $kind
      description: $description
      status: $status
      type: $type
      startDate: $startDate
      endDate: $endDate
      amount: $amount
      conditions: $conditions
    ) {
      _id
      name
      description
      status
      type
      startDate
      endDate
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
