import { useQuery } from '@apollo/client';
import { GET_CONFIGS } from '../graphql/queries/igConfigQueries';

export const useInstagramGetConfigs = () => {
  const { data, loading } = useQuery<{
    instagramGetConfigs: { _id: string; code: string; value: string }[];
  }>(GET_CONFIGS);

  const { instagramGetConfigs } = data || {};

  const instagramConfigs: Record<string, string> = {};

  ( instagramGetConfigs || []).forEach(
    (conf) => (instagramConfigs[conf.code] = conf.value),
  );

  return { loading, instagramConfigs };
};
