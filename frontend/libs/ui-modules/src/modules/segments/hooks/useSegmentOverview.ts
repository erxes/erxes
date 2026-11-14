import { useCallback, useState } from 'react';
import { ISegment } from '../types';
import { useSegmentGrowth } from './useSegmentGrowth';

const EMPTY_STAT = '—';

export const segmentTooltipLabel = (at: string) =>
  new Date(at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const tickLabel = (at: string, hourly: boolean) =>
  hourly
    ? new Date(at).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : at.slice(5, 10);

export const formatSegmentNumber = (value: number) => value.toLocaleString();

const membersLabelOf = (count?: number | null) =>
  count === undefined || count === null ? EMPTY_STAT : count.toLocaleString();

/** A rise or fall in members over the span, signed and with its tone. */
const changeOf = (growth: number | null) => {
  if (growth === null) {
    return null;
  }

  const rising = growth >= 0;

  return {
    rising,
    value: `${rising ? '+' : ''}${growth}%`,
    tone: rising ? ('up' as const) : ('down' as const),
  };
};

/**
 * A segment's overview: the member stats, the growth series and refreshing
 * both the series and the host's own data at once.
 */
export const useSegmentOverview = ({
  segment,
  days,
  onRefresh,
}: {
  segment?: ISegment;
  days: number;
  onRefresh?: () => Promise<unknown> | void;
}) => {
  const {
    joined,
    left,
    growth,
    hasTrend,
    hourly,
    span,
    measuredSince,
    series,
    loading,
    refetch,
  } = useSegmentGrowth(segment?._id, days);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([refetch(), onRefresh?.()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, onRefresh]);

  const tickFormatter = useCallback(
    (at: string) => tickLabel(at, hourly),
    [hourly],
  );

  return {
    loading,
    refreshing,
    handleRefresh,
    showRebuild: segment?.status !== 'building',
    membersLabel: membersLabelOf(segment?.membersCount),
    // Nothing has moved yet on a young segment; a coloured zero would read
    // as a measurement rather than as the absence of one
    showMovement: !!(joined || left),
    joinedLabel: `+${joined.toLocaleString()}`,
    leftLabel: `−${left.toLocaleString()}`,
    change: hasTrend ? changeOf(growth) : null,
    hasTrend,
    series,
    emptyMessage: measuredSince
      ? { key: 'measured-since', values: { date: measuredSince } }
      : { key: 'no-history', values: {} },
    levelLabel: hourly
      ? { key: 'level-recent', values: {} }
      : { key: 'level', values: { days: span } },
    movementLabel: hourly
      ? { key: 'movement-recent', values: {} }
      : { key: 'movement', values: { days: span } },
    tickFormatter,
  };
};
