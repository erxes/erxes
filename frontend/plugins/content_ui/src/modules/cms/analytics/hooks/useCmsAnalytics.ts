import { ApolloError, useQuery } from '@apollo/client';
import { CMS_ANALYTICS } from '../graphql/queries/cmsAnalytics';
import {
  CmsAnalyticsDateRange,
  CmsAnalyticsQueryResponse,
  CmsAnalyticsQueryVariables,
  CmsAnalyticsReport,
} from '../types';

type UseCmsAnalyticsParams = {
  clientPortalId?: string;
  dateRange: CmsAnalyticsDateRange;
};

type UseCmsAnalyticsResult = {
  error?: ApolloError;
  loading: boolean;
  refetch: () => void;
  report: CmsAnalyticsReport | null;
};

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
      refetch();
    },
    report: data?.cmsAnalytics || null,
  };
};
