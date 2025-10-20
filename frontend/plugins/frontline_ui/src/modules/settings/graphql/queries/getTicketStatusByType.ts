import { gql } from '@apollo/client';

export const GET_TICKET_STATUS_BY_TYPE = gql`
 query GetTicketStatusesByType($pipelineId: String!, $type: Int!) {
  getTicketStatusesByType(pipelineId: $pipelineId, type: $type) {
    _id
    name
    channelId
    pipelineId
    description
    color
    order
    type
    createdAt
    updatedAt
  }
}
`;