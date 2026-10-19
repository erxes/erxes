import { AUTOMATION_ACTIVITY } from '@/automations/components/builder/stats/graphql/automationStatsQueries';
import {
  TAutomationActivity,
  TAutomationLatencyBucket,
  TAutomationTraceBucket,
} from '@/automations/types';
import { useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router';

export type TAutomationActivityRange = '24h' | '7d' | '30d';

// Buckets start on a local hour or midnight, so the backend needs no timezone
const ACTIVITY_RANGES: Record<
  TAutomationActivityRange,
  { unit: 'hour' | 'day'; span: number; buckets: number; format: string }
> = {
  '24h': { unit: 'hour', span: 24, buckets: 24, format: 'HH:mm' },
  '7d': { unit: 'day', span: 7, buckets: 28, format: 'MMM D HH:mm' },
  '30d': { unit: 'day', span: 30, buckets: 30, format: 'MMM D' },
};

export const ACTIVITY_RANGE_KEYS = Object.keys(
  ACTIVITY_RANGES,
) as TAutomationActivityRange[];

const fillBuckets = <T extends { start: string }>(
  rows: T[],
  beginDate: Date,
  bucketMs: number,
  buckets: number,
  empty: Omit<T, 'start'>,
): T[] => {
  const byStart = new Map(
    rows.map((row) => [new Date(row.start).getTime(), row]),
  );

  return Array.from({ length: buckets }, (_, index) => {
    const start = beginDate.getTime() + index * bucketMs;

    return (
      byStart.get(start) ??
      ({ ...empty, start: new Date(start).toISOString() } as T)
    );
  });
};

/**
 * Traces and latency always describe the latest range ending now; refresh
 * moves the range forward instead of re-asking for the old one.
 */
export const useAutomationStatsActivity = () => {
  const { id } = useParams();
  const [range, setRange] = useState<TAutomationActivityRange>('24h');
  const [actionId, setActionId] = useState<string | undefined>();
  const [anchor, setAnchor] = useState(() => Date.now());
  const { unit, span, buckets, format } = ACTIVITY_RANGES[range];

  const { beginDate, endDate } = useMemo(() => {
    const end = dayjs(anchor).startOf(unit).add(1, unit);

    return {
      beginDate: end.subtract(span, unit).toDate(),
      endDate: end.toDate(),
    };
  }, [anchor, unit, span]);

  const { data, loading, error } = useQuery<{
    automationActivity: TAutomationActivity;
  }>(AUTOMATION_ACTIVITY, {
    variables: { automationId: id, beginDate, endDate, buckets, actionId },
    skip: !id,
  });

  const activity = data?.automationActivity;
  const bucketMs = (endDate.getTime() - beginDate.getTime()) / buckets;

  const { traces, latency } = useMemo(
    () => ({
      traces: fillBuckets<TAutomationTraceBucket>(
        activity?.traces || [],
        beginDate,
        bucketMs,
        buckets,
        { total: 0, complete: 0, error: 0, waiting: 0 },
      ),
      latency: fillBuckets<TAutomationLatencyBucket>(
        activity?.latency || [],
        beginDate,
        bucketMs,
        buckets,
        { count: 0 },
      ),
    }),
    [activity, beginDate, bucketMs, buckets],
  );

  const totals = traces.reduce(
    (sum, { total, error }) => ({
      runs: sum.runs + total,
      errors: sum.errors + error,
    }),
    { runs: 0, errors: 0 },
  );

  return {
    range,
    setRange,
    actionId,
    setActionId,
    traces,
    latency,
    p50Ms: activity?.p50Ms,
    p95Ms: activity?.p95Ms,
    totals: {
      runs: totals.runs,
      errorRate: totals.runs
        ? Math.round((totals.errors / totals.runs) * 100)
        : 0,
    },
    formatBucket: (start: string) => dayjs(start).format(format),
    loading,
    error,
    refresh: () => setAnchor(Date.now()),
  };
};

export type TAutomationStatsActivity = ReturnType<
  typeof useAutomationStatsActivity
>;
