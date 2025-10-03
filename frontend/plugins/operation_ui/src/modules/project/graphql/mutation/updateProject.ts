import { gql } from '@apollo/client';

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject(
    $_id: String!
    $name: String
    $icon: String
    $description: String
    $status: Int
    $priority: Int
    $teamIds: [String]
    $startDate: Date
    $targetDate: Date
    $leadId: String
  ) {
    updateProject(
      _id: $_id
      name: $name
      icon: $icon
      description: $description
      status: $status
      priority: $priority
      teamIds: $teamIds
      startDate: $startDate
      targetDate: $targetDate
      leadId: $leadId
    ) {
      _id
    }
  }
`;
