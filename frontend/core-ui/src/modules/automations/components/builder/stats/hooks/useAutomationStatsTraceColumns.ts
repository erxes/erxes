import { TAutomationTraceBucket } from '@/automations/types';
import { useMemo } from 'react';

export type TTraceCell = 'complete' | 'waiting' | 'error' | 'empty';

const TRACE_ROWS = 12;

// Keeps 0% and 100% off the very edge so the stroke is not clipped
const toLineY = (rate: number) => 98 - rate * 96;

/**
 * Error rate as polyline segments in a viewBox of one unit per bucket by 100.
 * Buckets without runs have no rate, so the line breaks there; a lone point
 * becomes a short tick across its column.
 */
const toErrorSegments = (traces: TAutomationTraceBucket[]) => {
  const segments: string[] = [];
  let current: [number, number][] = [];

  const flush = () => {
    if (current.length === 1) {
      const [[x, y]] = current;
      current = [
        [x - 0.3, y],
        [x + 0.3, y],
      ];
    }

    if (current.length) {
      segments.push(current.map(([x, y]) => `${x},${y}`).join(' '));
    }

    current = [];
  };

  traces.forEach(({ total, error }, index) => {
    if (!total) {
      flush();
      return;
    }

    current.push([index + 0.5, toLineY(error / total)]);
  });
  flush();

  return segments;
};

export const getErrorRate = ({ total, error }: TAutomationTraceBucket) =>
  total ? Math.round((error / total) * 100) : 0;

// Any failure stays visible as at least one cell, however busy the bucket
const cellsFor = (count: number, total: number, filled: number) =>
  count ? Math.max(1, Math.round((count / total) * filled)) : 0;

/**
 * Each bucket becomes a column of cells, its height scaled to the busiest
 * bucket and stacked error, waiting, then complete from the bottom.
 */
export const useAutomationStatsTraceColumns = (
  traces: TAutomationTraceBucket[],
) =>
  useMemo(() => {
    const max = Math.max(0, ...traces.map(({ total }) => total));

    const columns = traces.map((bucket) => {
      const { total, error, waiting } = bucket;
      const filled = total
        ? Math.max(1, Math.round((total / max) * TRACE_ROWS))
        : 0;
      const errorCells = Math.min(cellsFor(error, total, filled), filled);
      const waitingCells = Math.min(
        cellsFor(waiting, total, filled),
        filled - errorCells,
      );
      const cells: TTraceCell[] = Array.from(
        { length: TRACE_ROWS },
        (_, row) => {
          if (row >= filled) {
            return 'empty';
          }

          if (row < errorCells) {
            return 'error';
          }

          return row < errorCells + waitingCells ? 'waiting' : 'complete';
        },
      );

      return { bucket, cells };
    });

    return { columns, errorSegments: toErrorSegments(traces) };
  }, [traces]);
