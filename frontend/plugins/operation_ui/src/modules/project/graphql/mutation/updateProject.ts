import { gql } from '~/gql';

export const UPDATE_PROJECT_MUTATION = gql(`
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
    $memberIds: [String]
    $tagIds: [String]
    $propertiesData: JSON
    $customerId: String
    $companyId: String
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
      memberIds: $memberIds
      tagIds: $tagIds
      propertiesData: $propertiesData
      customerId: $customerId
      companyId: $companyId
    ) {
      _id
      name
      icon
      description
      status
      priority
      teamIds
      startDate
      targetDate
      leadId
      memberIds
      tagIds
      createdBy
      createdAt
      updatedAt
      convertedFromId
      propertiesData
      customerId
      companyId
    }
  }
`);
