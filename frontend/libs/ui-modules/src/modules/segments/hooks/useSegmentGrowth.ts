import { useQuery } from '@apollo/client';
import { SEGMENT_GROWTH } from '../graphql/queries';
import { ISegmentDay } from '../types';

/**
 * How a segment moved over a window.
 *
 * Both halves come from writes that only happen when something changed, so a
 * quiet segment returns few rows however often it was evaluated.
 */
export const useSegmentGrowth = (segmentId?: string, days = 30) => {
  const { data, loading, error } = useQuery<{ segmentGrowth: ISegmentDay[] }>(
    SEGMENT_GROWTH,
    { variables: { segmentId, days }, skip: !segmentId },
  );

  const series = data?.segmentGrowth || [];

  // Only the days that were actually settled bound the change; a day with no
  // count was never measured, not measured as nothing.
  const levels = series
    .map((day) => day.count)
    .filter((count): count is number => count !== null && count !== undefined);

  const first = levels[0];
  const last = levels[levels.length - 1];

  return {
    series,
    joined: series.reduce((total, day) => total + day.joined, 0),
    left: series.reduce((total, day) => total + day.left, 0),
    /**
     * Change over the window, or null when it cannot be put as a percentage -
     * a segment that started from nobody has nothing to grow by.
     */
    growth:
      first === undefined || last === undefined || first === 0
        ? null
        : Math.round(((last - first) / first) * 100),
    loading,
    error,
  };
};
