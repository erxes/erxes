import { gql } from '@apollo/client';

export const MAIL_SENDERS_QUERY = gql`
  query frontlineMailSenders {
    mailSenders {
      integrationId
      name
      address
    }
  }
`;
