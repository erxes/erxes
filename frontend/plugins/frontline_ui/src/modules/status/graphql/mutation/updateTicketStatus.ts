import { gql } from '@apollo/client';

export const UPDATE_TICKET_STATUS = gql`
  mutation UpdateTicketStatus(
    $id: String!
    $name: String
    $description: String
    $color: String
    $order: Int
    $type: Int
    $visibilityType: String
    $memberIds: [String]
    $canMoveMemberIds: [String]
    $canEditMemberIds: [String]
    $departmentIds: [String]
    $state: String
    $probability: Float
  ) {
    updateTicketStatus(
      _id: $id
      name: $name
      description: $description
      color: $color
      order: $order
      type: $type
      visibilityType: $visibilityType
      memberIds: $memberIds
      canMoveMemberIds: $canMoveMemberIds
      canEditMemberIds: $canEditMemberIds
      departmentIds: $departmentIds
      state: $state
      probability: $probability
    ) {
      _id
      color
      createdAt
      description
      name
      order
      pipelineId
      type
      updatedAt
      visibilityType
      memberIds
      canMoveMemberIds
      canEditMemberIds
      departmentIds
      state
      probability
    }
  }
`;
