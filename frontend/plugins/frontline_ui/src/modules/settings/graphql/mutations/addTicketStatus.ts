import { gql } from '@apollo/client';

export const ADD_TICKET_STATUS = gql`
  mutation AddTicketStatus(
    $name: String!
    $pipelineId: String
    $channelId: String!
    $description: String
    $color: String
    $order: Int
    $type: Int
  ) {
    addTicketStatus(
      name: $name
      pipelineId: $pipelineId
      channelId: $channelId
      description: $description
      color: $color
      order: $order
      type: $type
    ) {
      _id
    }
  }
`;
