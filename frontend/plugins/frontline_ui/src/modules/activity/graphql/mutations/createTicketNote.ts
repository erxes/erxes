import { gql } from '@apollo/client';
export const CREATE_TICKET_NOTE = gql`
  mutation TicketCreateNote(
    $content: String
    $contentId: String
    $mentions: [String]
    $type: String
  ) {
    ticketCreateNote(
      content: $content
      contentId: $contentId
      mentions: $mentions
      type: $type
    ) {
      _id
      content
      contentId
      createdBy
      mentions
      type
      createdAt
      updatedAt
    }
  }
`;
