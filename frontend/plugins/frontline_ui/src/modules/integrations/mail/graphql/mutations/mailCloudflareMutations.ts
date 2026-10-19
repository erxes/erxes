import { gql } from '~/gql';

export const MAIL_CLOUDFLARE_CONNECT_MUTATION = gql(`
  mutation mailCloudflareConnect($token: String!, $zoneId: String!) {
    mailCloudflareConnect(token: $token, zoneId: $zoneId) {
      ...MailCloudflareConnectionFields
    }
  }
`);

export const MAIL_CLOUDFLARE_PROVISION_MUTATION = gql(`
  mutation mailCloudflareProvision {
    mailCloudflareProvision {
      ...MailCloudflareConnectionFields
    }
  }
`);

export const MAIL_CLOUDFLARE_DISCONNECT_MUTATION = gql(`
  mutation mailCloudflareDisconnect {
    mailCloudflareDisconnect
  }
`);
