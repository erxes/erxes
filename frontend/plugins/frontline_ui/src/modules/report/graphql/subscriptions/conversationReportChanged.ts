import { gql } from '~/gql';

export const CONVERSATION_REPORT_CHANGED = gql(`
  subscription frontlineConversationReportChanged {
    frontlineConversationReportChanged
  }
`);
