import { gql } from '@apollo/client';

export const GET_TICKET_COMMENTS = gql`
  query TicketGetComments($contentId: String!) {
    ticketGetNotes(contentId: $contentId, type: "comment") {
      _id
      content
      contentId
      createdBy
      type
      createdAt
      updatedAt
      clientPortalAuthor {
        _id
        fullName
        email
        avatar
      }
    }
  }
`;
