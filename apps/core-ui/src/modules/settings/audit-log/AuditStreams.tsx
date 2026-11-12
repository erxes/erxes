import type { AuditStream } from '@erxes/core-contract';
import { IconBroadcast, IconPlayerPause, IconPlayerPlay, IconPlugConnected, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, CopyText, Input, Label, RelativeDateDisplay, Select, Sheet, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, messageOf } from '~/lib/api';

type Format = AuditStream['format'];

/** What each log service needs, so the form can suggest the address and header. */
const PRESETS: Record<Format, { label: string; url: string; header: string }> = {
  erxes: { label: 'HTTPS (JSON, signed)', url: 'https://', header: 'Authorization' },
  datadog: { label: 'Datadog', url: 'https://http-intake.logs.datadoghq.com/api/v2/logs', header: 'DD-API-KEY' },
  splunk: { label: 'Splunk HEC', url: 'https://splunk.example.com:8088/services/collector/event', header: 'Authorization' },
};

const KEY = ['audit', 'streams'];

const AddStream = ({ onAdded }: { onAdded: (secret: string) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log.streams' });
  const { toast } = useToast();
  const client = useQueryClient();
  const [format, setFormat] = useState<Format>('erxes');
  const [name, setName] = useState('');
  const [url, setUrl] = useState(PRESETS.erxes.url);
  const [header, setHeader] = useState({ name: PRESETS.erxes.header, value: '' });
  const [from, setFrom] = useState<'now' | 'beginning'>('now');
  const create = useMutation({
    mutationFn: () =>
      api.audit.createStream({ name: name || PRESETS[format].label, url, format, from, ...(header.value ? { authHeader: header } : {}) }),
    onSuccess: (result) => {
      void client.invalidateQueries({ queryKey: KEY });
      onAdded(result.secret);
      setName('');
      setHeader({ ...header, value: '' });
    },
    onError: (error) => toast({ variant: 'destructive', title: t('add-failed', 'Could not add the stream'), description: messageOf(error) }),
  });

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t('service', 'Service')}</Label>
          <Select
            value={format}
            onValueChange={(value) => {
              const next = value as Format;

              setFormat(next);
              setUrl(PRESETS[next].url);
              setHeader({ name: PRESETS[next].header, value: '' });
            }}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {(Object.keys(PRESETS) as Format[]).map((key) => (
                <Select.Item key={key} value={key}>
                  {PRESETS[key].label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t('name', 'Name')}</Label>
          <Input value={name} placeholder={PRESETS[format].label} onChange={(event) => setName(event.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>{t('url', 'Address')}</Label>
        <Input value={url} onChange={(event) => setUrl(event.target.value)} />
      </div>
      <div className="grid grid-cols-[10rem_1fr] gap-3">
        <div className="space-y-1.5">
          <Label>{t('header', 'Auth header')}</Label>
          <Input value={header.name} onChange={(event) => setHeader({ ...header, name: event.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('header-value', 'Value (stored encrypted)')}</Label>
          <Input
            type="password"
            value={header.value}
            placeholder={format === 'splunk' ? 'Splunk <token>' : format === 'datadog' ? 'API key' : t('optional', 'optional')}
            onChange={(event) => setHeader({ ...header, value: event.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>{t('from', 'Send')}</Label>
        <Select value={from} onValueChange={(value) => setFrom(value as typeof from)}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="now">{t('from-now', 'New entries from now on')}</Select.Item>
            <Select.Item value="beginning">{t('from-beginning', 'Everything still kept, then new entries')}</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <Button className="w-full" disabled={create.isPending || !/^https?:\/\/.+/.test(url)} onClick={() => create.mutate()}>
        {create.isPending ? <Spinner size="sm" /> : t('add', 'Start streaming')}
      </Button>
    </div>
  );
};

const StreamRow = ({ stream }: { stream: AuditStream }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log.streams' });
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const client = useQueryClient();
  const refresh = () => void client.invalidateQueries({ queryKey: KEY });
  const onError = (error: unknown) => toast({ variant: 'destructive', title: t('failed', 'Something went wrong'), description: messageOf(error) });
  const toggle = useMutation({
    mutationFn: () => api.audit.updateStream({ id: stream.id, status: stream.status === 'active' ? 'paused' : 'active' }),
    onSuccess: refresh,
    onError,
  });
  const remove = useMutation({ mutationFn: () => api.audit.removeStream({ id: stream.id }), onSuccess: refresh, onError });
  const test = useMutation({
    mutationFn: () => api.audit.testStream({ id: stream.id }),
    onSuccess: (result) =>
      toast({
        variant: result.ok ? 'default' : 'destructive',
        title: result.ok ? t('test-ok', 'It answered {{status}}', { status: result.status }) : t('test-failed', 'The test entry was refused'),
        description: result.ok ? undefined : (result.error ?? undefined),
      }),
    onError,
  });
  const failing = stream.consecutiveFailures > 0;

  return (
    <li className="space-y-2 p-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-medium">{stream.name}</span>
        <Badge variant="secondary">{PRESETS[stream.format].label}</Badge>
        <Badge variant={stream.status === 'paused' ? 'secondary' : failing ? 'destructive' : 'success'}>
          {stream.status === 'paused' ? t('paused', 'Paused') : failing ? t('failing', 'Failing') : t('streaming', 'Streaming')}
        </Badge>
        <div className="ml-auto flex gap-1">
          <Button size="icon" variant="ghost" title={t('test', 'Send a test entry')} disabled={test.isPending} onClick={() => test.mutate()}>
            <IconPlugConnected />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title={stream.status === 'active' ? t('pause', 'Pause') : t('resume', 'Resume')}
            disabled={toggle.isPending}
            onClick={() => toggle.mutate()}
          >
            {stream.status === 'active' ? <IconPlayerPause /> : <IconPlayerPlay />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            title={t('remove', 'Remove')}
            onClick={() => void confirm({ message: t('remove-confirm', 'Stop streaming to {{name}} and remove it?', { name: stream.name }) }).then(() => remove.mutate())}
          >
            <IconTrash />
          </Button>
        </div>
      </div>
      <p className="truncate text-xs text-muted-foreground">{stream.url}</p>
      <p className="text-xs text-muted-foreground">
        {stream.pending
          ? t('pending', '{{count}} entries waiting', { count: stream.pending })
          : t('up-to-date', 'Up to date')}
        {stream.lastDeliveredAt && (
          <>
            {' · '}
            {t('last-sent', 'last sent')}{' '}
            <RelativeDateDisplay value={stream.lastDeliveredAt} asChild>
              <span>
                <RelativeDateDisplay.Value value={stream.lastDeliveredAt} />
              </span>
            </RelativeDateDisplay>
          </>
        )}
      </p>
      {stream.lastError && (
        <p className="text-xs text-destructive">
          {t('last-error', 'Failing {{count}} times in a row: {{error}}. Entries wait and are sent once it answers.', {
            count: stream.consecutiveFailures,
            error: stream.lastError,
          })}
        </p>
      )}
    </li>
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
  const streams = useQuery({ queryKey: KEY, queryFn: () => api.audit.streams(), enabled: open, refetchInterval: open ? 10_000 : false });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <IconBroadcast />
        {t('button', 'Streaming')}
      </Button>
      <Sheet.View className="flex w-full flex-col p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>{t('title', 'Stream the audit log')}</Sheet.Title>
          <Sheet.Description className="text-sm text-muted-foreground">
            {t('description', 'Every entry, as it is written, to your SIEM or log service: in order, signed, and resent after outages.')}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="min-h-0 space-y-4 overflow-y-auto px-5 py-4">
          {secret && (
            <div className="space-y-1 rounded-lg border border-warning bg-warning/10 p-3 text-sm">
              <p className="font-medium">{t('secret-title', 'Signing secret (shown once)')}</p>
              <p className="text-xs text-muted-foreground">
                {t('secret-description', 'Check the Erxes-Signature header with it, like webhooks: HMAC-SHA256 of "<t>.<body>".')}
              </p>
              <CopyText value={secret}>
                <code className="break-all text-xs">{secret}</code>
              </CopyText>
            </div>
          )}
          {streams.isLoading ? (
            <Spinner />
          ) : (
            !!streams.data?.data.length && (
              <ul className="divide-y rounded-lg border">
                {streams.data.data.map((stream) => (
                  <StreamRow key={stream.id} stream={stream} />
                ))}
              </ul>
            )
          )}
          <AddStream onAdded={setSecret} />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
