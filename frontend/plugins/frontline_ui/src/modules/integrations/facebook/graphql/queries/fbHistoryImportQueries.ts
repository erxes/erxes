import { gql } from '~/gql';

export const FACEBOOK_MESSENGER_HISTORY_IMPORT_STATUS = gql(`
  query FacebookMessengerHistoryImportStatus($integrationId: String!) {
    facebookMessengerHistoryImportStatus(integrationId: $integrationId) {
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
