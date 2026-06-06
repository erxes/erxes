import { useQuery } from '@apollo/client';
import { CMS_ANALYTICS } from '../graphql/queries/cmsAnalytics';
import {
  type CmsAnalyticsQueryResponse,
  type CmsAnalyticsQueryVariables,
  type UseCmsAnalyticsParams,
  type UseCmsAnalyticsResult,
} from '../types';

export const useCmsAnalytics = ({
  clientPortalId,
  dateRange,
}: UseCmsAnalyticsParams): UseCmsAnalyticsResult => {
  const { data, error, loading, refetch } = useQuery<
    CmsAnalyticsQueryResponse,
    CmsAnalyticsQueryVariables
  >(CMS_ANALYTICS, {
    variables: {
      clientPortalId: clientPortalId || '',
      dateRange,
    },
    skip: !clientPortalId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  return {
    error,
    loading,
    refetch: () => {
      if (!clientPortalId) {
        return;
      }

      refetch();
    },
    report: data?.cmsAnalytics || null,
  };
};
