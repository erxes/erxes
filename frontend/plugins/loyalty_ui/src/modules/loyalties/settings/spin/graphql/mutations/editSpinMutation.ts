import { gql } from '@apollo/client';

export const editSpinMutation = gql`
  mutation UpdateCampaign(
    $_id: String!
    $name: String
    $kind: String!
    $description: String
    $startDate: Date
    $endDate: Date
    $status: String
    $type: String
    $amount: Float
    $conditions: JSON
  ) {
    updateCampaign(
      _id: $_id
      name: $name
      kind: $kind
      description: $description
      startDate: $startDate
      endDate: $endDate
      status: $status
      type: $type
      amount: $amount
      conditions: $conditions
    ) {
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
          middleName
          position
        }
      }
      conditions
      kind
    }
  }
`;
