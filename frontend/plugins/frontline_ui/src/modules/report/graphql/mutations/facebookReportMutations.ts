import { gql } from '@apollo/client';

export const SYNC_FACEBOOK_POST_STATS = gql`
  mutation ReportFacebookSyncPostStats($pageIds: [String], $limit: Int) {
    reportFacebookSyncPostStats(pageIds: $pageIds, limit: $limit) {
      pages
      fetched
      updated
      missingInErxes
      syncedAt
      errors {
        pageId
        message
      }
    }
  }
`;
