import type { AutomationRun } from '@erxes/core-contract';
import { IconPlayerStop, IconRefresh } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, cn, Empty, RelativeDateDisplay, ScrollArea, Spinner, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { api, messageOf } from '~/lib/api';
import { useCan } from '~/modules/auth/session';

const STATUS_VARIANT = {
  running: 'info',
  waiting: 'warning',
  succeeded: 'success',
  failed: 'destructive',
  cancelled: 'secondary',
} as const;

const When = ({ value }: { value: string }) => (
  <RelativeDateDisplay value={value} asChild>
    <span>
      <RelativeDateDisplay.Value value={value} />
    </span>
  </RelativeDateDisplay>
);

const RunDetail = ({ run }: { run: AutomationRun }) => {
  const { t } = useTranslation('automations');
  const { toast } = useToast();
  const client = useQueryClient();
  const can = useCan();
  const { data, isLoading } = useQuery({
    queryKey: ['automations', 'run', run.id],
    queryFn: () => api.automations.run({ runId: run.id }),
    refetchInterval: run.status === 'running' || run.status === 'waiting' ? 3000 : false,
  });
  const refresh = () => void client.invalidateQueries({ queryKey: ['automations'] });
  const onError = (error: unknown) => toast({ variant: 'destructive', title: t('failed', 'Something went wrong'), description: messageOf(error) });
  const retry = useMutation({ mutationFn: () => api.automations.retryRun({ runId: run.id }), onSuccess: refresh, onError });
  const cancel = useMutation({ mutationFn: () => api.automations.cancelRun({ runId: run.id }), onSuccess: refresh, onError });

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Badge variant={STATUS_VARIANT[run.status]}>{t(`status.${run.status}`, run.status)}</Badge>
        {run.goalReached && <Badge variant="info">{t('goal-reached', 'Goal reached')}</Badge>}
        {run.subject && (
          <Link className="text-sm underline" to={`/contacts/${run.subject.type === 'customer' ? 'customers' : 'companies'}/${run.subject.id}`}>
            {t('open-subject', 'Open the {{type}}', { type: run.subject.type })}
          </Link>
        )}
        <span className="text-xs text-muted-foreground">
          {t('version', 'version {{version}}', { version: run.version })} · {run.eventType}
        </span>
        <span className="ml-auto flex gap-2">
          {run.status === 'failed' && can('automations.manage') && (
            <Button size="sm" variant="outline" disabled={retry.isPending} onClick={() => retry.mutate()}>
              <IconRefresh />
              {t('retry', 'Continue from the failed step')}
            </Button>
          )}
          {(run.status === 'running' || run.status === 'waiting') && can('automations.manage') && (
            <Button size="sm" variant="outline" disabled={cancel.isPending} onClick={() => cancel.mutate()}>
              <IconPlayerStop />
              {t('cancel', 'Cancel')}
            </Button>
          )}
        </span>
      </div>
      {run.error && <p className="rounded-md bg-destructive/10 p-2 font-mono text-xs text-destructive">{run.error}</p>}
      {run.waitingUntil && (
        <p className="text-sm text-muted-foreground">
          {t('waiting-until', 'Waiting until')} {new Date(run.waitingUntil).toLocaleString()}
        </p>
      )}
      {isLoading ? (
        <Spinner containerClassName="py-4" />
      ) : (
        <ol className="space-y-2">
          {data?.steps.map((step) => (
            <li key={step.id} className="rounded-md border p-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={step.status === 'succeeded' ? 'success' : step.status === 'failed' ? 'destructive' : 'secondary'}>
                  {step.status}
                </Badge>
                <span className="font-mono text-xs">{step.type}</span>
                <span className="text-xs text-muted-foreground">#{step.stepId}</span>
                {step.attempt > 1 && <span className="text-xs text-muted-foreground">· {t('attempt', 'attempt {{n}}', { n: step.attempt })}</span>}
                <span className="ml-auto text-xs text-muted-foreground">
                  <When value={step.finishedAt} />
                </span>
              </div>
              {step.error && <p className="mt-1 font-mono text-xs text-destructive">{step.error}</p>}
              {(step.input !== null || step.output !== null) && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs text-muted-foreground">{t('details', 'Input and output')}</summary>
                  <pre className="mt-1 max-h-60 overflow-auto rounded bg-muted p-2 text-[11px]">
                    {JSON.stringify({ input: step.input, output: step.output }, null, 2)}
                  </pre>
                </details>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

/** Runs of an automation, newest first; each opens its step-by-step log. */
export const RunsPanel = ({ automationId }: { automationId: string }) => {
  const { t } = useTranslation('automations');
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['automations', automationId, 'runs'],
    queryFn: () => api.automations.runs({ id: automationId, limit: 50 }),
    refetchInterval: 5000,
  });
  const runs = data?.data ?? [];
  const current = runs.find((run) => run.id === selected) ?? runs[0];

  if (isLoading) return <Spinner containerClassName="py-12" />;

  if (!runs.length) {
    return (
      <Empty className="py-16">
        <Empty.Header>
          <Empty.Title>{t('no-runs', 'No runs yet')}</Empty.Title>
          <Empty.Description>{t('no-runs-description', 'Runs appear here when the trigger event happens and its conditions hold.')}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <div className="flex min-h-0 flex-1">
      <ScrollArea className="w-80 shrink-0 border-r">
        <ul>
          {runs.map((run) => (
            <li key={run.id}>
              <button
                type="button"
                onClick={() => setSelected(run.id)}
                className={cn('flex w-full items-center gap-2 border-b px-3 py-2 text-left text-sm hover:bg-muted', current?.id === run.id && 'bg-muted')}
              >
                <Badge variant={STATUS_VARIANT[run.status]}>{t(`status.${run.status}`, run.status)}</Badge>
                <span className="truncate text-xs text-muted-foreground">{run.subject?.id ?? run.eventType}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  <When value={run.startedAt} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <ScrollArea className="flex-1">{current && <RunDetail key={current.id} run={current} />}</ScrollArea>
    </div>
  );
};
