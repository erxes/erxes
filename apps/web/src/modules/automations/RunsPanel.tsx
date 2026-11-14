import type { AutomationRun, RunStep } from '@erxes/core-contract';
import { IconPlayerStop, IconRefresh } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, cn, Empty, RelativeDateDisplay, ScrollArea, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '~/lib/api';
import { useCan } from '~/modules/auth/session';
import { runsQuery } from './automationQueries';

const STATUS_VARIANT = {
  running: 'info',
  waiting: 'warning',
  succeeded: 'success',
  failed: 'destructive',
  cancelled: 'secondary',
} as const;

const STEP_VARIANT = { succeeded: 'success', failed: 'destructive' } as const;

const When = ({ value }: { value: string }) => (
  <RelativeDateDisplay value={value} render={<span />}>
    <RelativeDateDisplay.Value value={value} />
  </RelativeDateDisplay>
);

const StepEntry = ({ step }: { step: RunStep }) => {
  const { t } = useTranslation('automations');

  return (
    <li className="rounded-md border p-2 text-sm">
      <div className="flex items-center gap-2">
        <Badge
          variant={
            step.status === 'succeeded' || step.status === 'failed'
              ? STEP_VARIANT[step.status]
              : 'secondary'
          }
        >
          {step.status}
        </Badge>
        <span className="font-mono text-xs">{step.type}</span>
        <span className="text-xs text-muted-foreground">#{step.stepId}</span>
        {step.attempt > 1 && (
          <span className="text-xs text-muted-foreground">
            · {t('attempt', 'attempt {{n}}', { n: step.attempt })}
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          <When value={step.finishedAt} />
        </span>
      </div>
      {step.error && <p className="mt-1 font-mono text-xs text-destructive">{step.error}</p>}
      {(step.input !== null || step.output !== null) && (
        <details className="mt-1">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            {t('details', 'Input and output')}
          </summary>
          <pre className="mt-1 max-h-60 overflow-auto rounded bg-muted p-2 text-2xs">
            {JSON.stringify({ input: step.input, output: step.output }, null, 2)}
          </pre>
        </details>
      )}
    </li>
  );
};

/** Continue a failed run, or cancel one in progress. */
const RunActions = ({ run }: { run: AutomationRun }) => {
  const { t } = useTranslation('automations');
  const { toast } = useToast();
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: orpc.automations.key() });

  const onError = (error: Error) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Something went wrong'),
      description: messageOf(error),
    });

  const retry = useMutation(
    orpc.automations.retryRun.mutationOptions({ onSuccess: refresh, onError }),
  );

  const cancel = useMutation(
    orpc.automations.cancelRun.mutationOptions({ onSuccess: refresh, onError }),
  );

  return (
    <span className="ml-auto flex gap-2">
      {run.status === 'failed' && (
        <Button
          size="sm"
          variant="outline"
          disabled={retry.isPending}
          onClick={() => retry.mutate({ runId: run.id })}
        >
          <IconRefresh />
          {t('retry', 'Continue from the failed step')}
        </Button>
      )}
      {(run.status === 'running' || run.status === 'waiting') && (
        <Button
          size="sm"
          variant="outline"
          disabled={cancel.isPending}
          onClick={() => cancel.mutate({ runId: run.id })}
        >
          <IconPlayerStop />
          {t('cancel', 'Cancel')}
        </Button>
      )}
    </span>
  );
};

const RunDetail = ({ run }: { run: AutomationRun }) => {
  const { t } = useTranslation('automations');
  const canManage = useCan()('automations.manage');

  const detail = useQuery(
    orpc.automations.run.queryOptions({
      input: { runId: run.id },
      refetchInterval: run.status === 'running' || run.status === 'waiting' ? 3000 : false,
    }),
  );

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Badge variant={STATUS_VARIANT[run.status]}>{t(`status.${run.status}`, run.status)}</Badge>
        {run.goalReached && <Badge variant="info">{t('goal-reached', 'Goal reached')}</Badge>}
        {run.subject && (
          <Link
            className="text-sm underline"
            to={`/contacts/${run.subject.type === 'customer' ? 'customers' : 'companies'}/${run.subject.id}`}
          >
            {t('open-subject', 'Open the {{type}}', { type: run.subject.type })}
          </Link>
        )}
        <span className="text-xs text-muted-foreground">
          {t('version', 'version {{version}}', { version: run.version })} · {run.eventType}
        </span>
        {canManage && <RunActions run={run} />}
      </div>
      {run.error && (
        <p className="rounded-md bg-destructive/10 p-2 font-mono text-xs text-destructive">
          {run.error}
        </p>
      )}
      {run.waitingUntil && (
        <p className="text-sm text-muted-foreground">
          {t('waiting-until', 'Waiting until')} {new Date(run.waitingUntil).toLocaleString()}
        </p>
      )}
      <QueryState query={detail} className="py-4">
        {({ steps }) => (
          <ol className="space-y-2">
            {steps.map((step) => (
              <StepEntry key={step.id} step={step} />
            ))}
          </ol>
        )}
      </QueryState>
    </div>
  );
};

const NoRuns = () => {
  const { t } = useTranslation('automations');

  return (
    <Empty>
      <Empty.Header>
        <Empty.Title>{t('no-runs', 'No runs yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'no-runs-description',
            'Runs appear here when the trigger event happens and its conditions hold.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

const RunList = ({ runs }: { runs: AutomationRun[] }) => {
  const { t } = useTranslation('automations');
  const [selected, setSelected] = useState<string | null>(null);
  const current = runs.find((run) => run.id === selected) ?? runs[0];

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex w-80 shrink-0 flex-col border-r">
        <ScrollArea className="min-h-0 flex-1">
          <ul>
            {runs.map((run) => (
              <li key={run.id}>
                <button
                  type="button"
                  onClick={() => setSelected(run.id)}
                  className={cn(
                    'flex w-full items-center gap-2 border-b px-3 py-2 text-left text-sm hover:bg-muted',
                    current?.id === run.id && 'bg-muted',
                  )}
                >
                  <Badge variant={STATUS_VARIANT[run.status]}>
                    {t(`status.${run.status}`, run.status)}
                  </Badge>
                  <span className="truncate text-xs text-muted-foreground">
                    {run.subject
                      ? (run.subject.name ??
                        t('deleted-subject', 'A deleted {{type}}', { type: run.subject.type }))
                      : run.eventType}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    <When value={run.startedAt} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
      <ScrollArea className="flex-1">
        {current && <RunDetail key={current.id} run={current} />}
      </ScrollArea>
    </div>
  );
};

/** Runs of an automation, newest first; each opens its step-by-step log. */
export const RunsPanel = ({ automationId }: { automationId: string }) => {
  const runs = useQuery(runsQuery(automationId));

  return (
    <QueryState
      query={runs}
      className="py-12"
      isEmpty={({ data }) => !data.length}
      empty={<NoRuns />}
    >
      {({ data }) => <RunList runs={data} />}
    </QueryState>
  );
};
