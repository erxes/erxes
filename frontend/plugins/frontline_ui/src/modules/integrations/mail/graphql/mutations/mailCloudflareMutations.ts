import { gql } from '@apollo/client';
import { MAIL_CLOUDFLARE_CONNECTION_FIELDS } from '../queries/mailCloudflareQueries';

export const MAIL_CLOUDFLARE_CONNECT_MUTATION = gql`
  mutation mailCloudflareConnect($token: String!, $zoneId: String!) {
    mailCloudflareConnect(token: $token, zoneId: $zoneId) {
      ...MailCloudflareConnectionFields
    }
  }
  ${MAIL_CLOUDFLARE_CONNECTION_FIELDS}
`;

export const MAIL_CLOUDFLARE_PROVISION_MUTATION = gql`
  mutation mailCloudflareProvision {
    mailCloudflareProvision {
      ...MailCloudflareConnectionFields
    }
  }
  ${MAIL_CLOUDFLARE_CONNECTION_FIELDS}
`;

export const MAIL_CLOUDFLARE_DISCONNECT_MUTATION = gql`
  mutation mailCloudflareDisconnect {
    mailCloudflareDisconnect
  }
`;
