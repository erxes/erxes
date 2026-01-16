import { gql } from '@apollo/client';

export const ADJUST_CLOSING_ENTRY_REMOVE = gql`
  mutation AdjustClosingEntryRemove($adjustId: String!) {
    adjustClosingEntriesRemove(adjustId: $adjustId)
  }
`;
