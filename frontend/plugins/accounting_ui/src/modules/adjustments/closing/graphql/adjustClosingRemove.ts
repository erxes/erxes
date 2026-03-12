import { gql } from '@apollo/client';

export const ADJUST_CLOSING_ENTRY_REMOVE = gql`
  mutation AdjustClosingEntriesRemove($_id: String!) {
    adjustClosingEntriesRemove(_id: $_id)
  }
`;
