import { useQuery } from '@apollo/client';
import { SEGMENT_GROWTH } from '../graphql/queries';
import { ISegmentDay } from '../types';

export const useSegmentGrowth = (segmentId?: string, days = 30) => {
  const { data, loading, error, refetch } = useQuery<{
    segmentGrowth: ISegmentDay[];
  }>(SEGMENT_GROWTH, { variables: { segmentId, days }, skip: !segmentId });

  const series = data?.segmentGrowth || [];

  const hourly =
    series.length > 1 &&
    new Date(series[1].at).getTime() - new Date(series[0].at).getTime() <
      86_400_000;

  const span = series.length
    ? Math.max(
        1,
        Math.round(
          (new Date(series[series.length - 1].at).getTime() -
            new Date(series[0].at).getTime()) /
            86_400_000,
        ),
      )
    : 0;

  const levels = series
    .map((day) => day.count)
    .filter((count): count is number => count !== null && count !== undefined);

  const first = levels[0];
  const last = levels[levels.length - 1];

  return {
    series,
    measuredSince: series.find((day) => day.count !== null)?.date,
    hourly,
    span,
    hasTrend: levels.length > 1,
    joined: series.reduce((total, day) => total + day.joined, 0),
    left: series.reduce((total, day) => total + day.left, 0),
    growth:
      first === undefined || last === undefined || first === 0
        ? null
        : Math.round(((last - first) / first) * 100),
    loading,
    error,
    refetch,
  };
};
