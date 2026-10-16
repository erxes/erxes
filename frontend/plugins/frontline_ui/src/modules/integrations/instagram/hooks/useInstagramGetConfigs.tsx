import { useQuery } from '@apollo/client';
import { GET_CONFIGS } from '../graphql/queries/igConfigQueries';

export const useInstagramGetConfigs = () => {
  const { data, loading } = useQuery(GET_CONFIGS);

  const { instagramGetConfigs } = data || {};

  const instagramConfigs: Record<string, string> = {};

  (instagramGetConfigs || []).forEach((conf) => {
    if (conf?.code && typeof conf.value === 'string') {
      instagramConfigs[conf.code] = conf.value;
    }
  });

  return { loading, instagramConfigs };
};
