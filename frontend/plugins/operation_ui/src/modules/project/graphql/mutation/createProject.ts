import { gql } from '@apollo/client';

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject(
    $name: String!
    $teamIds: [String!]!
    $leadId: String
    $icon: String
    $description: String
    $status: Int
    $priority: Int
    $startDate: Date
    $targetDate: Date
    $tagIds: [String]
  ) {
    createProject(
      name: $name
      teamIds: $teamIds
      leadId: $leadId
      icon: $icon
      description: $description
      status: $status
      priority: $priority
      startDate: $startDate
      targetDate: $targetDate
      tagIds: $tagIds
    ) {
      _id
      name
      icon
      description
      status
      priority
      teamIds
      leadId
      startDate
      targetDate
      tagIds
      createdAt
      updatedAt
    }
  }
`;
