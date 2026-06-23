import { Badge } from 'erxes-ui';

/** Maps a workflow run status to a Badge variant. */
const RUN_STATUS_VARIANT: Record<
  string,
  'info' | 'warning' | 'success' | 'destructive' | 'secondary'
> = {
  running: 'info',
  suspended: 'warning',
  success: 'success',
  failed: 'destructive',
  canceled: 'secondary',
};

export const RunStatusBadge = ({ status }: { status?: string }) => (
  <Badge variant={RUN_STATUS_VARIANT[status || ''] || 'secondary'}>
    {status || 'unknown'}
  </Badge>
);

/** Human label for a workflow's trigger, e.g. "Schedule (0 9 * * *)". */
export const triggerLabel = (definition: any): string => {
  const trigger = definition?.trigger;
  if (!trigger?.type) return 'Manual';
  if (trigger.type === 'schedule' && trigger.config?.cron) {
    return `Schedule (${trigger.config.cron})`;
  }
  return trigger.type.charAt(0).toUpperCase() + trigger.type.slice(1);
};

export const stepCount = (definition: any): number =>
  Array.isArray(definition?.steps) ? definition.steps.length : 0;

export const formatDuration = (startedAt?: string, finishedAt?: string) => {
  if (!startedAt) return '—';
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  const ms = end - new Date(startedAt).getTime();
  if (ms < 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
};
