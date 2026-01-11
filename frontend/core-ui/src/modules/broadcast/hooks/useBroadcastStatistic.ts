import { useQuery } from '@apollo/client';
import { BROADCAST_STATISTIC } from '../graphql/queries';

export const useBroadcastStatistic = () => {
  const { data, loading } = useQuery(BROADCAST_STATISTIC);

  const statistics = data?.engageEmailPercentages || {};

  return {
    statistics,
    loading,
  };
};
