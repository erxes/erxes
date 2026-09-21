import { gql } from '@apollo/client';
export const CREATE_TICKET_NOTE = gql`
  mutation TicketCreateNote(
    $content: String
    $contentId: String
    $mentions: [String]
    $attachments: [AttachmentInput]
    $isInternal: Boolean
  ) {
    ticketCreateNote(
      content: $content
      contentId: $contentId
      mentions: $mentions
      attachments: $attachments
      isInternal: $isInternal
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
      isInternal
      createdAt
      updatedAt
    }
  }
`;
