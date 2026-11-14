import type { EventFailure } from '@erxes/core-contract';
import { IconAlertTriangle, IconPlugConnected, IconRefresh, IconTrash } from '@tabler/icons-react';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Empty,
  PageContainer,
  PageHeader,
  RelativeDateDisplay,
  ScrollArea,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '~/lib/api';
import { pluginLabel } from '~/lib/members';
import { useCan } from '~/modules/auth/session';

/** What each consumer does, in words. */
const CONSUMERS: Record<string, string> = {
  'core.timeline': 'Timeline',
  'core.notifications': 'Notifications',
};

const STATUSES = ['all', 'retrying', 'dead'] as const;

const refOf = (failure: EventFailure) => ({
  consumer: failure.consumer,
  eventId: failure.event.id,
});

const useFailureActions = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'event-delivery' });
  const { toast } = useToast();
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: orpc.events.failures.key() });

  const onError = (error: Error) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Something went wrong'),
      description: messageOf(error),
    });

  const retry = useMutation(
    orpc.events.retryFailures.mutationOptions({
      onSuccess: ({ retried }) => {
        toast({
          title: t('retried', { count: retried, defaultValue: `Retrying ${retried} events` }),
        });
        // The retry runs in the background; look again once it has had a moment.
        setTimeout(() => void refresh(), 1500);
      },
      onError,
    }),
  );

  const dismiss = useMutation(
    orpc.events.dismissFailures.mutationOptions({ onSuccess: refresh, onError }),
  );

  return { retry, dismiss };
};

const When = ({ value }: { value: string }) => (
  <RelativeDateDisplay value={value} render={<span />}>
    <RelativeDateDisplay.Value value={value} />
  </RelativeDateDisplay>
);

const FailureRow = ({
  failure,
  actions,
}: {
  failure: EventFailure;
  actions: ReturnType<typeof useFailureActions>;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'event-delivery' });
  const { retry, dismiss } = actions;

  return (
    <li className="flex gap-3 px-4 py-3">
      <IconAlertTriangle
        className={
          failure.status === 'dead'
            ? 'mt-0.5 size-4 shrink-0 text-destructive'
            : 'mt-0.5 size-4 shrink-0 text-warning'
        }
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-mono font-medium">{failure.event.type}</span>
          <Badge variant="secondary">
            {failure.event.source === 'core' ? 'Core' : pluginLabel(failure.event.source)}
          </Badge>
          <span className="text-muted-foreground">
            → {CONSUMERS[failure.consumer] ?? failure.consumer}
          </span>
          {failure.event.summary && (
            <span className="truncate text-muted-foreground">“{failure.event.summary}”</span>
          )}
        </div>
        <p className="break-words font-mono text-xs text-destructive/90">{failure.lastError}</p>
        <p className="text-xs text-muted-foreground">
          {t('attempts', { count: failure.attempts, defaultValue: `${failure.attempts} attempts` })}{' '}
          · {t('first-failed', 'first failed')} <When value={failure.firstFailedAt} />
          {failure.nextAttemptAt && (
            <>
              {' · '}
              {t('next-attempt', 'next attempt')} <When value={failure.nextAttemptAt} />
            </>
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={retry.isPending}
          onClick={() => retry.mutate({ failures: [refOf(failure)] })}
        >
          <IconRefresh />
          {t('retry', 'Retry now')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-label={t('dismiss', 'Dismiss')}
          disabled={dismiss.isPending}
          onClick={() => dismiss.mutate({ failures: [refOf(failure)] })}
        >
          <IconTrash />
        </Button>
      </div>
    </li>
  );
};

const NoFailures = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'event-delivery' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconPlugConnected />
        </Empty.Media>
        <Empty.Title>{t('empty', 'Every event was delivered')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Timelines and notifications handled every event from core and plugins.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

const StatusFilter = ({
  value,
  counts,
  onChange,
}: {
  value: (typeof STATUSES)[number];
  counts: { retrying: number; dead: number };
  onChange: (status: (typeof STATUSES)[number]) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'event-delivery' });

  const labels = {
    all: t('all', 'All'),
    retrying: t('retrying', {
      count: counts.retrying,
      defaultValue: `Retrying (${counts.retrying})`,
    }),
    dead: t('dead', { count: counts.dead, defaultValue: `Stopped (${counts.dead})` }),
  };

  return (
    <div className="flex items-center gap-2 border-b px-4 py-2">
      {STATUSES.map((status) => (
        <Button
          key={status}
          size="sm"
          variant={value === status ? 'secondary' : 'ghost'}
          onClick={() => onChange(status)}
        >
          {labels[status]}
        </Button>
      ))}
      <p className="ml-auto text-xs text-muted-foreground">
        {t(
          'explain',
          'Failed events are retried after 1 min, 5 min, 30 min, 2 h and 12 h, then stop here.',
        )}
      </p>
    </div>
  );
};

/**
 * Settings › Event delivery: events that timelines, notifications (and later
 * automations and webhooks) could not handle. They are retried with backoff
 * (1 min → 12 h); after the last attempt they wait here to be retried or dismissed.
 */
export const EventDeliveryPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'event-delivery' });
  const canSee = useCan()('events.view');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('all');
  const actions = useFailureActions();

  const failures = useQuery(
    orpc.events.failures.queryOptions({
      input: canSee ? { status: status === 'all' ? undefined : status } : skipToken,
      refetchInterval: 30_000,
    }),
  );

  if (!canSee) return <Navigate to="/settings" replace />;

  const counts = failures.data?.counts ?? { retrying: 0, dead: 0 };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Event delivery'),
                to: '/settings/event-delivery',
                icon: IconPlugConnected,
              },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <Button
            variant="outline"
            disabled={!counts.dead || actions.retry.isPending}
            onClick={() => actions.retry.mutate({ allDead: true })}
          >
            <IconRefresh />
            {t('retry-all', 'Retry all stopped')}
          </Button>
        </PageHeader.End>
      </PageHeader>
      <StatusFilter value={status} counts={counts} onChange={setStatus} />
      <ScrollArea className="flex-1">
        <QueryState
          query={failures}
          className="py-12"
          isEmpty={({ data }) => !data.length}
          empty={<NoFailures />}
        >
          {({ data }) => (
            <ul className="divide-y">
              {data.map((failure) => (
                <FailureRow
                  key={`${failure.consumer}:${failure.event.id}`}
                  failure={failure}
                  actions={actions}
                />
              ))}
            </ul>
          )}
        </QueryState>
      </ScrollArea>
    </PageContainer>
  );
};
