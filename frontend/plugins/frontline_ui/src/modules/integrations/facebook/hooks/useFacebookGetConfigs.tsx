import { useQuery } from '@apollo/client';
import { GET_CONFIGS } from '../graphql/queries/fbConfigQueries';

export const useFacebookGetConfigs = () => {
  const { data, loading } = useQuery(GET_CONFIGS);

  const { facebookGetConfigs } = data || {};

  const facebookConfigs: Record<string, string> = {};

  (facebookGetConfigs || []).forEach((conf) => {
    if (conf?.code && typeof conf.value === 'string') {
      facebookConfigs[conf.code] = conf.value;
    }
  });

  return { loading, facebookConfigs };
};
