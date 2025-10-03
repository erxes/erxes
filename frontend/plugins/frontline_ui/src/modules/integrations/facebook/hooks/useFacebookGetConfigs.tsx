import { useQuery } from '@apollo/client';
import { GET_CONFIGS } from '../graphql/queries/fbConfigQueries';

export const useFacebookGetConfigs = () => {
  const { data, loading } = useQuery<{
    facebookGetConfigs: { _id: string; code: string; value: string }[];
  }>(GET_CONFIGS);

  const { facebookGetConfigs } = data || {};

  const facebookConfigs: Record<string, string> = {};

  (facebookGetConfigs || []).forEach(
    (conf) => (facebookConfigs[conf.code] = conf.value),
  );

  return { loading, facebookConfigs };
};
