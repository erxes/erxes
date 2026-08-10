import { QueryHookOptions, useQuery } from '@apollo/client';
import { SCORE_CAMPAIGNS_SIMPLE_QUERY } from '../graphql/queries/ScoreCampaignQuery';

export const useLoyaltyScoreCampaign = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery<{
    scoreCampaigns: { list: any[] };
  }>(SCORE_CAMPAIGNS_SIMPLE_QUERY, {
    ...options,
    variables: {
      limit: 50,
      ...options?.variables,
    },
  });

  return {
    scoreDetail: data?.scoreCampaigns?.list,
    loading,
    error,
  };
};
