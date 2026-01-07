import { OperationVariables, useQuery } from '@apollo/client';
import { LOYALTY_SCORE_ROW_DEFAULT_VARIABLES } from '../constants/loyaltyScoreDefaultVariables';
import { LOYALTY_SCORE_CAMPAIGN_QUERY } from '../graphql/queries/loyaltyScoreCampaignQuery';

export const useLoyaltyScoreRows = (options?: OperationVariables) => {
  const { data, loading, fetchMore, error } = useQuery(
    LOYALTY_SCORE_CAMPAIGN_QUERY,
    {
      ...options,
      variables: {
        ...LOYALTY_SCORE_ROW_DEFAULT_VARIABLES,
        ...options?.variables,
      },
    },
  );

  const loyaltyScoreRows = data?.scoreCampaignAdd || [];
  const loyaltyScoreRowsCount = data?.scoreCampaignsTotalCount || 0;

  const handleFetchMore = () => {
    if (!loyaltyScoreRows.length) return;

    fetchMore({
      variables: {
        page:
          Math.ceil(
            loyaltyScoreRows.length /
              LOYALTY_SCORE_ROW_DEFAULT_VARIABLES.perPage,
          ) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.scoreCampaignAdd) return prev;
        return {
          scoreCampaignAdd: {
            ...prev.scoreCampaignAdd,
            list: [...prev.scoreCampaignAdd, ...fetchMoreResult.scoreCampaignAdd],
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
