import { gql } from '@apollo/client';

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject(
    $name: String!
    $teamIds: [String!]!
    $leadId: String
    $memberIds: [String]
    $icon: String
    $description: String
    $status: Int
    $priority: Int
    $startDate: Date
    $targetDate: Date
    $convertedFromId: String
    $tagIds: [String]
  ) {
    createProject(
      name: $name
      teamIds: $teamIds
      leadId: $leadId
      memberIds: $memberIds
      icon: $icon
      description: $description
      status: $status
      priority: $priority
      startDate: $startDate
      targetDate: $targetDate
      convertedFromId: $convertedFromId
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
      memberIds
      startDate
      targetDate
      tagIds
      createdAt
      updatedAt
      convertedFromId
    }
  }
`;
