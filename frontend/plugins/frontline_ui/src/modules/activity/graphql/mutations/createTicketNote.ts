import { gql } from '@apollo/client';
export const CREATE_TICKET_NOTE = gql`
  mutation TicketCreateNote(
    $content: String
    $contentId: String
    $mentions: [String]
  ) {
    ticketCreateNote(
      content: $content
      contentId: $contentId
      mentions: $mentions
    ) {
      _id
      content
      contentId
      createdBy
      mentions
      createdAt
      updatedAt
    }
  }
`;
