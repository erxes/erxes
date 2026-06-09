import { useDashboard } from '../../hooks/useDashboard';
import { useCallFilters } from '../../hooks/useCallFilters';
import { QueueCard } from './QueueCard';
import { SectionCard } from '../SectionCard';
import { useMemo } from 'react';
import type { SelectOption } from '../../types';

interface QueuesSectionProps {
  queueOptions: SelectOption[];
}

/** Queues tab: grid of QueueCards for all queue stats. */
export function QueuesSection({ queueOptions }: QueuesSectionProps) {
  const { queueStats, loading } = useDashboard();
  const { queueId } = useCallFilters();

  const labelMap = useMemo(
    () => Object.fromEntries(queueOptions.map((opt) => [opt.value, opt.label])),
    [queueOptions],
  );

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-44 rounded-xl border bg-muted/30 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!queueStats.length) {
    return (
      <div className="rounded-xl border-2 border-dashed p-10 text-center text-sm text-muted-foreground">
        No queue data for the selected range
      </div>
    );
  }

  return (
    <SectionCard
      title="Queue Snapshot"
      description="Per-queue answer rate, wait and talk times"
      accentClass="bg-[var(--chart-1)]"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {queueStats.map((stat) => (
          <QueueCard
            key={stat.queue}
            stat={stat}
            label={labelMap[stat.queue] ?? stat.queue}
          />
        ))}
      </div>
    </SectionCard>
  );
}
