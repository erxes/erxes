import { gql } from '~/gql';

export const FACEBOOK_IMPORT_MESSENGER_HISTORY = gql(`
  mutation FacebookImportMessengerHistory($integrationId: String!) {
    facebookImportMessengerHistory(integrationId: $integrationId) {
      status
      startedAt
      finishedAt
      conversations
      messages
      skippedConversations
      error
    }
  }
`);
