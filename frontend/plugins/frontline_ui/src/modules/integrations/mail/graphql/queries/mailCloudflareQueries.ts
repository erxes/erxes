import { gql } from '@apollo/client';

export const MAIL_CLOUDFLARE_CONNECTION_FIELDS = gql`
  fragment MailCloudflareConnectionFields on MailCloudflareConnection {
    zoneName
    accountName
    workerOrigin
    scriptVersion
    currentScriptVersion
    sendingEnabled
    status
    error
    connectedAt
    steps {
      name
      state
      error
      __typename
    }
    __typename
  }
`;

export const MAIL_CLOUDFLARE_CONNECTION_QUERY = gql`
  query mailCloudflareConnection {
    mailCloudflareConnection {
      ...MailCloudflareConnectionFields
    }
  }
  ${MAIL_CLOUDFLARE_CONNECTION_FIELDS}
`;

export const MAIL_CLOUDFLARE_ZONES_QUERY = gql`
  query mailCloudflareZones($token: String!) {
    mailCloudflareZones(token: $token) {
      id
      name
      status
      accountName
      __typename
    }
  }
`;

export const MAIL_CLOUDFLARE_SENDING_QUOTA_QUERY = gql`
  query mailCloudflareSendingQuota {
    mailCloudflareSendingQuota {
      value
      unit
      __typename
    }
  }
`;
