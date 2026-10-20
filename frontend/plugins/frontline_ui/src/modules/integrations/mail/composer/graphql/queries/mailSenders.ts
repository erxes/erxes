import { gql } from '~/gql';

export const MAIL_SENDERS_QUERY = gql(`
  query frontlineMailSenders {
    mailSenders {
      integrationId
      channelScope
      name
      address
    }
  }
`);
