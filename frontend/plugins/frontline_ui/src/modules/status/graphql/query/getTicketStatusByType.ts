import { gql } from '@apollo/client';

export const GET_TICKET_STATUS_BY_TYPE = gql`
  query GetTicketStatusesByType($pipelineId: String!, $type: Int!) {
    getTicketStatusesByType(pipelineId: $pipelineId, type: $type) {
      _id
      name
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

export const GET_TICKET_STATUS_BY_ID = gql`
  query GetTicketStatus($_id: String!) {
    getTicketStatus(_id: $_id) {
      _id
      name
      pipelineId
      visibilityType
      memberIds
      canMoveMemberIds
      canEditMemberIds
    }
  }
`;
