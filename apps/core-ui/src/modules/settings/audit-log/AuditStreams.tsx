import type { AuditStream } from '@erxes/core-contract';
import {
  IconBroadcast,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlugConnected,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  CopyText,
  RelativeDateDisplay,
  Sheet,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '~/lib/api';
import { AddStream, STREAM_PRESETS } from './AddStream';

const useStreamActions = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log.streams' });
  const { toast } = useToast();
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: orpc.audit.streams.key() });

  const onError = (error: Error) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Something went wrong'),
      description: messageOf(error),
    });

  const toggle = useMutation(
    orpc.audit.updateStream.mutationOptions({ onSuccess: refresh, onError }),
  );

  const remove = useMutation(
    orpc.audit.removeStream.mutationOptions({ onSuccess: refresh, onError }),
  );

  const test = useMutation(
    orpc.audit.testStream.mutationOptions({
      onSuccess: (result) =>
        toast({
          variant: result.ok ? 'default' : 'destructive',
          title: result.ok
            ? t('test-ok', 'It answered {{status}}', { status: result.status })
            : t('test-failed', 'The test entry was refused'),
          description: result.ok ? undefined : (result.error ?? undefined),
        }),
      onError,
    }),
  );

  return { toggle, remove, test };
};

const StreamStatus = ({ stream }: { stream: AuditStream }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log.streams' });

  return (
    <p className="text-xs text-muted-foreground">
      {stream.pending
        ? t('pending', '{{count}} entries waiting', { count: stream.pending })
        : t('up-to-date', 'Up to date')}
      {stream.lastDeliveredAt && (
        <>
          {' · '}
          {t('last-sent', 'last sent')}{' '}
          <RelativeDateDisplay value={stream.lastDeliveredAt} render={<span />}>
            <RelativeDateDisplay.Value value={stream.lastDeliveredAt} />
          </RelativeDateDisplay>
        </>
      )}
    </p>
  );
};

const StreamRow = ({ stream }: { stream: AuditStream }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log.streams' });
  const { confirm } = useConfirm();
  const { toggle, remove, test } = useStreamActions();
  const failing = stream.consecutiveFailures > 0;
  const active = stream.status === 'active';
  const toggleLabel = active ? t('pause', 'Pause') : t('resume', 'Resume');

  return (
    <li className="space-y-2 p-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-medium">{stream.name}</span>
        <Badge variant="secondary">{STREAM_PRESETS[stream.format].label}</Badge>
        <Badge variant={!active ? 'secondary' : failing ? 'destructive' : 'success'}>
          {!active
            ? t('paused', 'Paused')
            : failing
              ? t('failing', 'Failing')
              : t('streaming', 'Streaming')}
        </Badge>
        <div className="ml-auto flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            title={t('test', 'Send a test entry')}
            aria-label={t('test', 'Send a test entry')}
            disabled={test.isPending}
            onClick={() => test.mutate({ id: stream.id })}
          >
            <IconPlugConnected />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title={toggleLabel}
            aria-label={toggleLabel}
            disabled={toggle.isPending}
            onClick={() => toggle.mutate({ id: stream.id, status: active ? 'paused' : 'active' })}
          >
            {active ? <IconPlayerPause /> : <IconPlayerPlay />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            title={t('remove', 'Remove')}
            aria-label={t('remove', 'Remove')}
            onClick={() =>
              void confirm({
                message: t('remove-confirm', 'Stop streaming to {{name}} and remove it?', {
                  name: stream.name,
                }),
              }).then(() => remove.mutate({ id: stream.id }))
            }
          >
            <IconTrash />
          </Button>
        </div>
      </div>
      <p className="truncate text-xs text-muted-foreground">{stream.url}</p>
      <StreamStatus stream={stream} />
      {stream.lastError && (
        <p className="text-xs text-destructive">
          {t(
            'last-error',
            'Failing {{count}} times in a row: {{error}}. Entries wait and are sent once it answers.',
            { count: stream.consecutiveFailures, error: stream.lastError },
          )}
        </p>
      )}
    </li>
  );
};

const SecretNotice = ({ secret }: { secret: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log.streams' });

  return (
    <div className="space-y-1 rounded-lg border border-warning bg-warning/10 p-3 text-sm">
      <p className="font-medium">{t('secret-title', 'Signing secret (shown once)')}</p>
      <p className="text-xs text-muted-foreground">
        {t(
          'secret-description',
          'Check the Erxes-Signature header with it, like webhooks: HMAC-SHA256 of "<t>.<body>".',
        )}
      </p>
      <CopyText value={secret}>
        <code className="break-all text-xs">{secret}</code>
      </CopyText>
    </div>
  );
};

/** The streams, refreshed while the sheet is open. */
const StreamList = () => {
  const streams = useQuery(orpc.audit.streams.queryOptions({ refetchInterval: 10_000 }));

  return (
    <QueryState query={streams} isEmpty={({ data }) => !data.length}>
      {({ data }) => (
        <ul className="divide-y rounded-lg border">
          {data.map((stream) => (
            <StreamRow key={stream.id} stream={stream} />
          ))}
        </ul>
      )}
    </QueryState>
  );
};

/**
 * Audit log › Streaming (owners): the log sent as it is written to a SIEM or
 * log service, in chain order and signed, resuming after outages.
 */
export const AuditStreams = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log.streams' });
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <IconBroadcast />
        {t('button', 'Streaming')}
      </Button>
      <Sheet.View className="flex w-full flex-col sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>{t('title', 'Stream the audit log')}</Sheet.Title>
          <Sheet.Description>
            {t(
              'description',
              'Every entry, as it is written, to your SIEM or log service: in order, signed, and resent after outages.',
            )}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="min-h-0 overflow-y-auto">
          <div className="space-y-4">
            {secret && <SecretNotice secret={secret} />}
            {open && <StreamList />}
            <AddStream onAdded={setSecret} />
          </div>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
