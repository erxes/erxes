import { gql } from '@apollo/client';
export const CREATE_TICKET_NOTE = gql`
  mutation TicketCreateNote(
    $content: String
    $contentId: String
    $mentions: [String]
    $attachments: [AttachmentInput]
  ) {
    ticketCreateNote(
      content: $content
      contentId: $contentId
      mentions: $mentions
      attachments: $attachments
    ) {
      _id
      content
      contentId
      createdBy
      mentions
      attachments {
        name
        url
        type
        size
      }
      createdAt
      updatedAt
    }
  }
`;
