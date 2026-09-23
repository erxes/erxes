import { gql } from '@apollo/client';

export const MAIL_INBOXES_QUERY = gql`
  query mailInboxes {
    mailInboxes {
      _id
      name
      address
    }
  }
`;
