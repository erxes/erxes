import { gql } from '@apollo/client';

export const TICKET_PORTAL_CREATE = gql`
  mutation ticketPortalCreate(
    $name: String!
    $description: String
    $channelId: String!
    $pipelineId: String!
    $statusId: String!
  ) {
    cpCreateTicket(
      name: $name
      description: $description
      channelId: $channelId
      pipelineId: $pipelineId
      statusId: $statusId
    ) {
      _id
      number
      name
    }
  }
`;

export const TICKET_PORTAL_ADD_NOTE = gql`
  mutation ticketPortalAddNote($contentId: String!, $content: String!) {
    cpTicketCreateNote(contentId: $contentId, content: $content) {
      _id
      content
      createdAt
      createdBy
    }
  }
`;
