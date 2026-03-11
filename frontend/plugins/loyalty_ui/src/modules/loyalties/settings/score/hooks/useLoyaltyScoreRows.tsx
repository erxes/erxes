import { OperationVariables, useQuery } from '@apollo/client';
import { LOYALTY_SCORE_CAMPAIGN_QUERY } from '../graphql/queries/loyaltyScoreCampaignQuery';

export const useLoyaltyScoreRows = (options?: OperationVariables) => {
  const { data, loading, fetchMore, error } = useQuery(
    LOYALTY_SCORE_CAMPAIGN_QUERY,
    {
      ...options,
      variables: {
        kind: 'loyalty_score',
        ...options?.variables,
      },
    },
  );

  const loyaltyScoreRows = data?.getCampaigns?.list || [];
  const loyaltyScoreRowsCount = data?.getCampaigns?.totalCount || 0;

  const handleFetchMore = () => {
    if (!loyaltyScoreRows.length) return;

    fetchMore({
      variables: {
        cursor: data?.getCampaigns?.pageInfo?.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.getCampaigns?.list?.length) return prev;
        return {
          getCampaigns: {
            ...prev.getCampaigns,
            list: [
              ...prev.getCampaigns.list,
              ...fetchMoreResult.getCampaigns.list,
            ],
            pageInfo: fetchMoreResult.getCampaigns.pageInfo,
          },
        };
      },
    });
  };

  return {
    loyaltyScoreRows,
    totalCount: loyaltyScoreRowsCount,
    loading,
    error,
    handleFetchMore,
  };
};
