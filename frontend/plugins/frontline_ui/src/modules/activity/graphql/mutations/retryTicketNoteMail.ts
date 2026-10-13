import { gql } from '@apollo/client';

export const RETRY_TICKET_NOTE_MAIL = gql`
  mutation MailTicketNoteRetry($noteId: String!) {
    mailTicketNoteRetry(noteId: $noteId) {
      _id
      mailMessageId
      mailDelivery {
        status
        error
        to
        bouncedRecipients
        retryable
        canRetry
      }
    }
  }
`;
