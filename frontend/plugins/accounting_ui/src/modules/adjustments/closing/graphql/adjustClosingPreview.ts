import { gql } from '@apollo/client';

export const PREVIEW_ADJUST_CLOSING = gql`
  query PreviewAdjustClosing(
    $beginDate: Date!
    $date: Date!
    $accountIds: [String!]!
  ) {
    previewAdjustClosingEntries(
      beginDate: $beginDate
      date: $date
      accountIds: $accountIds
    ) {
      accountId
      side
      amount
    }
  }
`;
