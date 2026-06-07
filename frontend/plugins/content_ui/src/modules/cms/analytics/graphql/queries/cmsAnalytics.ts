import { gql } from '@apollo/client';

export const CMS_ANALYTICS = gql`
  query CmsAnalytics(
    $clientPortalId: String!
    $dateRange: CmsAnalyticsDateRange!
  ) {
    cmsAnalytics(clientPortalId: $clientPortalId, dateRange: $dateRange) {
      dateRange
      startedAt
      endedAt
      configuration {
        propertyIdConfigured
        propertyIdMasked
      }
      totals {
        activeUsers
        newUsers
        sessions
        screenPageViews
        averageEngagementTime
        engagementRate
        eventCount
      }
      timeSeries {
        date
        activeUsers
        sessions
        screenPageViews
      }
      topPages {
        pagePath
        pageTitle
        screenPageViews
        activeUsers
        averageEngagementTime
      }
      trafficChannels {
        name
        activeUsers
        sessions
      }
      devices {
        name
        activeUsers
        sessions
      }
      countries {
        name
        activeUsers
        sessions
      }
      quota {
        tokensConsumed
        tokensRemaining
      }
    }
  }
`;
