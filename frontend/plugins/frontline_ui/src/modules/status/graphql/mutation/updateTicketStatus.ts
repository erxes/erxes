import { gql } from '@apollo/client';

export const UPDATE_TICKET_STATUS = gql`
  mutation UpdateTicketStatus(
    $id: String!
    $name: String
    $description: String
    $color: String
    $order: Int
    $type: Int
  ) {
    updateTicketStatus(
      _id: $id
      name: $name
      description: $description
      color: $color
      order: $order
      type: $type
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
    }
  }
`;
