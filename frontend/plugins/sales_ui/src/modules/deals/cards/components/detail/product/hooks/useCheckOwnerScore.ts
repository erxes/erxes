import { QueryHookOptions, useQuery } from '@apollo/client';
import { CHECK_OWNER_SCORE } from '../graphql/queries/ScoreCampaignQueries';

export const useCheckOwnerScore = (options: QueryHookOptions) => {
  const { data, refetch, loading } = useQuery(CHECK_OWNER_SCORE, {
    ...options,
  });
  return {
    checkOwnerScore: data?.checkOwnerScore,
    refetch,
    loading,
  };
};
