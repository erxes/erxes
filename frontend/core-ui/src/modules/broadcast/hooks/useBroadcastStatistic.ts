import { useQuery } from '@apollo/client';
import { BROADCAST_STATISTIC } from '../graphql/queries';

export const useBroadcastStatistic = () => {
  const { data, loading } = useQuery(BROADCAST_STATISTIC);

  const statistics = data?.engageEmailPercentages || {};

  return {
    statistics: {
      avgBouncePercent: 3.403127053651189,
      avgClickPercent: 10.462597876022988,
      avgComplaintPercent: 0.5174148670735617,
      avgDeliveryPercent: 91.77117197788523,
      avgOpenPercent: 72.20626772232139,
      avgRejectPercent: 0,
      avgRenderingFailurePercent: 0,
      avgSendPercent: 94.92704543382678,
      __typename: 'AvgEmailStats',
    },
    loading,
  };
};
