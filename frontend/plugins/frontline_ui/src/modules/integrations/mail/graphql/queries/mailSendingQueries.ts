import { gql } from '@apollo/client';

export const MAIL_SENDING_ACCOUNT_FIELDS = gql`
  fragment MailSendingAccountFields on MailSendingAccount {
    _id
    name
    provider
    domain
    platformManaged
    status
    error
    verifiedAt
    dnsRecords {
      type
      host
      data
      valid
      __typename
    }
    __typename
  }
`;

export const MAIL_SENDING_ACCOUNTS_QUERY = gql`
  query mailSendingAccounts {
    mailSendingAccounts {
      ...MailSendingAccountFields
    }
  }
  ${MAIL_SENDING_ACCOUNT_FIELDS}
`;

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
      accounts {
        ...MailSendingAccountFields
      }
      __typename
    }
  }
  ${MAIL_SENDING_ACCOUNT_FIELDS}
`;
