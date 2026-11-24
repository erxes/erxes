import type { coreContract } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import type { InferContractRouterOutputs } from '@orpc/contract';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Badge, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';

type Conversation = InferContractRouterOutputs<
  typeof coreContract
>['agents']['runs']['data'][number];

type Run = Conversation['runs'][number];

/** One searchApi or callApi call: what it asked, and why it failed when it did. */
const Call = ({ call }: { call: Run['calls'][number] }) => (
  <li className="flex items-start gap-2 font-mono text-xs">
    {call.ok ? (
      <IconCheck className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-label="ok" />
    ) : (
      <IconX className="mt-0.5 size-3.5 shrink-0 text-destructive-text" aria-label="failed" />
    )}
    <span className="min-w-0 break-words">
      {call.procedure ?? `${call.tool} "${call.query ?? ''}"`}
      {!call.ok && (
        <span className="text-destructive-text">
          {' '}
          {[call.status, call.code].filter(Boolean).join(' ')}
          {call.message ? `: ${call.message}` : ''}
        </span>
      )}
    </span>
  </li>
);

const RunRow = ({ run }: { run: Run }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const fmt = useFormat();

  return (
    <li className="space-y-1.5 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{fmt.dateTime(run.at)}</span>
        {run.model && <span>{run.model}</span>}
        {run.status === 'failed' && (
          <Badge variant="destructive">{t('run-failed', 'No answer')}</Badge>
        )}
        {run.status === 'running' && <Badge variant="muted">{t('run-running', 'Running')}</Badge>}
        {run.handedOff && <Badge variant="destructive">{t('run-handed-off', 'Handed off')}</Badge>}
      </div>
      <p className="text-sm">{run.text}</p>
      {run.failure && <p className="text-xs text-destructive-text">{run.failure}</p>}
      {run.handedOff && (
        <p className="text-xs text-destructive-text">
          {t('handed-off', 'Handed to a person: {{reason}}', { reason: run.handedOff })}
        </p>
      )}
      {run.calls.length > 0 && (
        <ul className="space-y-1">
          {run.calls.map((call) => (
            <Call key={call.id} call={call} />
          ))}
        </ul>
      )}
    </li>
  );
};

/** Under Try it: the agent's latest conversations, each run's model and calls, failures marked. */
export const AgentRuns = ({ agentId }: { agentId: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const runs = useQuery(orpc.agents.runs.queryOptions({ input: { id: agentId } }));

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium">{t('runs-title', 'Latest conversations')}</h3>
      <QueryState query={runs}>
        {({ data }) =>
          data.length ? (
            data.map((conversation) => (
              <div key={conversation.key} className="rounded-lg border">
                <p className="border-b px-3 py-2 text-sm font-medium">
                  {conversation.plugin
                    ? `${conversation.plugin} · ${conversation.key}`
                    : t('runs-yours', 'Your Try it')}
                </p>
                <ol className="divide-y">
                  {conversation.runs.map((run) => (
                    <RunRow key={run.at} run={run} />
                  ))}
                </ol>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('runs-empty', 'No conversations yet.')}
            </p>
          )
        }
      </QueryState>
    </section>
  );
};
