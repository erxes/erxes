import type { EventFailure } from '@erxes/core-contract';
import { IconAlertTriangle, IconPlugConnected, IconRefresh, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Empty,
  PageContainer,
  RelativeDateDisplay,
  ScrollArea,
  Spinner,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, messageOf } from '~/lib/api';
import { pluginLabel } from '~/lib/members';
import { useCan } from '~/modules/auth/session';

const KEY = ['events', 'failures'];

/** What each consumer does, in words. */
const CONSUMERS: Record<string, string> = {
  'core.timeline': 'Timeline',
  'core.notifications': 'Notifications',
};

const refOf = (failure: EventFailure) => ({
  consumer: failure.consumer,
  eventId: failure.event.id,
});

/**
 * Settings › Event delivery: events that timelines, notifications (and later
 * automations and webhooks) could not handle. They are retried with backoff
 * (1 min → 12 h); after the last attempt they wait here to be retried or dismissed.
 */
export const EventDeliveryPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'event-delivery' });
  const canSee = useCan()('events.view');
  const { toast } = useToast();
  const client = useQueryClient();
  const [status, setStatus] = useState<'all' | 'retrying' | 'dead'>('all');
  const { data, isLoading } = useQuery({
    queryKey: [...KEY, status],
    queryFn: () => api.events.failures({ status: status === 'all' ? undefined : status }),
    refetchInterval: 30_000,
    enabled: canSee,
  });
  const onError = (error: unknown) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Something went wrong'),
      description: messageOf(error),
    });
  const retry = useMutation({
    mutationFn: (input: { failures?: ReturnType<typeof refOf>[]; allDead?: boolean }) =>
      api.events.retryFailures(input),
    onSuccess: ({ retried }) => {
      toast({
        title: t('retried', { count: retried, defaultValue: `Retrying ${retried} events` }),
      });
      setTimeout(() => void client.invalidateQueries({ queryKey: KEY }), 1500);
    },
    onError,
  });
  const dismiss = useMutation({
    mutationFn: (failures: ReturnType<typeof refOf>[]) => api.events.dismissFailures({ failures }),
    onSuccess: () => void client.invalidateQueries({ queryKey: KEY }),
    onError,
  });

  if (!canSee) return <Navigate to="/settings" replace />;

  const counts = data?.counts ?? { retrying: 0, dead: 0 };

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
            disabled={!counts.dead || retry.isPending}
            onClick={() => retry.mutate({ allDead: true })}
          >
            <IconRefresh />
            {t('retry-all', 'Retry all stopped')}
          </Button>
        </PageHeader.End>
      </PageHeader>
      <div className="flex items-center gap-2 border-b px-4 py-2">
        {(['all', 'retrying', 'dead'] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={status === value ? 'secondary' : 'ghost'}
            onClick={() => setStatus(value)}
          >
            {value === 'all'
              ? t('all', 'All')
              : value === 'retrying'
                ? t('retrying', {
                    count: counts.retrying,
                    defaultValue: `Retrying (${counts.retrying})`,
                  })
                : t('dead', { count: counts.dead, defaultValue: `Stopped (${counts.dead})` })}
          </Button>
        ))}
        <p className="ml-auto text-xs text-muted-foreground">
          {t(
            'explain',
            'Failed events are retried after 1 min, 5 min, 30 min, 2 h and 12 h, then stop here.',
          )}
        </p>
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? (
          <Spinner containerClassName="py-12" />
        ) : !data?.data.length ? (
          <Empty className="py-16">
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
        ) : (
          <ul className="divide-y">
            {data.data.map((failure) => (
              <li key={`${failure.consumer}:${failure.event.id}`} className="flex gap-3 px-4 py-3">
                <IconAlertTriangle
                  className={
                    failure.status === 'dead'
                      ? 'mt-0.5 size-4 shrink-0 text-destructive'
                      : 'mt-0.5 size-4 shrink-0 text-amber-500'
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
                      <span className="truncate text-muted-foreground">
                        “{failure.event.summary}”
                      </span>
                    )}
                  </div>
                  <p className="break-words font-mono text-xs text-destructive/90">
                    {failure.lastError}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('attempts', {
                      count: failure.attempts,
                      defaultValue: `${failure.attempts} attempts`,
                    })}{' '}
                    · {t('first-failed', 'first failed')}{' '}
                    <RelativeDateDisplay value={failure.firstFailedAt} asChild>
                      <span>
                        <RelativeDateDisplay.Value value={failure.firstFailedAt} />
                      </span>
                    </RelativeDateDisplay>
                    {failure.nextAttemptAt && (
                      <>
                        {' · '}
                        {t('next-attempt', 'next attempt')}{' '}
                        <RelativeDateDisplay value={failure.nextAttemptAt} asChild>
                          <span>
                            <RelativeDateDisplay.Value value={failure.nextAttemptAt} />
                          </span>
                        </RelativeDateDisplay>
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
                    disabled={dismiss.isPending}
                    onClick={() => dismiss.mutate([refOf(failure)])}
                  >
                    <IconTrash />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </PageContainer>
  );
};
