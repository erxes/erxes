import { useQuery } from '@apollo/client';
import { GET_CONFIGS } from '../graphql/queries/fbConfigQueries';

export function useFbConfigs() {
  const { data, loading } = useQuery(GET_CONFIGS);

  return {
    configs: data?.facebookGetConfigs,
    loading,
  };
}
