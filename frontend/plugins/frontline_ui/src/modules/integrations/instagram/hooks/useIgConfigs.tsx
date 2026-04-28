import { useQuery } from '@apollo/client';
import { GET_CONFIGS } from '../graphql/queries/igConfigQueries';

export function useIgConfigs() {
  const { data, loading } = useQuery(GET_CONFIGS);

  return {
    configs: data?.instagramGetConfigs,
    loading,
  };
}
