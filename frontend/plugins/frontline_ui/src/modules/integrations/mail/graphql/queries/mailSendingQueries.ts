import { gql } from '@apollo/client';

export const MAIL_SENDING_READINESS_QUERY = gql`
  query mailSendingReadiness {
    mailSendingReadiness {
      ready
      cloudflare {
        ready
        domain
        reason
        __typename
      }
      platform {
        ready
        domain
        __typename
      }
      __typename
    }
  }
`;
