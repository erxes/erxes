import type { Webhook, WebhookDelivery } from '@erxes/core-contract';
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCopy,
  IconKey,
  IconPlus,
  IconRefresh,
  IconSend,
  IconTrash,
  IconWebhook,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Dialog,
  Empty,
  Input,
  Label,
  MultipleSelector,
  type MultiSelectOption,
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
import { useCan } from '~/modules/auth/session';

const KEY = ['webhooks'];

const useEventOptions = () => {
  const { data } = useQuery({
    queryKey: ['events', 'types'],
    queryFn: () => api.webhooks.eventTypes(),
    staleTime: 60_000,
  });
  const types = data?.data ?? [];
  const prefixes = [
    ...new Set(types.map((item) => item.type.split('.').slice(0, 2).join('.'))),
  ].map((prefix) => ({
    value: `${prefix}.*`,
    label: `${prefix}.* (all)`,
  }));

  return [
    { value: '*', label: '* (every event)' },
    ...prefixes,
    ...types.map((item) => ({ value: item.type, label: `${item.label} · ${item.type}` })),
  ];
};

/** The secret, shown once: copy it now. */
const SecretNotice = ({ secret, onClose }: { secret: string; onClose: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const [copied, setCopied] = useState(false);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('secret-title', 'Signing secret')}
          description={t(
            'secret-description',
            "Copy it now: it won't be shown again. Check every request's Erxes-Signature with it.",
          )}
        />
        <div className="flex gap-2">
          <Input readOnly value={secret} className="font-mono text-xs" />
          <Button
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(secret);
              setCopied(true);
            }}
          >
            {copied ? <IconCheck /> : <IconCopy />}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

const NewWebhook = ({ onCreated }: { onCreated: (secret: string) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const { toast } = useToast();
  const client = useQueryClient();
  const options = useEventOptions();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [types, setTypes] = useState<MultiSelectOption[]>([]);
  const create = useMutation({
    mutationFn: () =>
      api.webhooks.create({
        url,
        description: description || null,
        eventTypes: types.map((type) => type.value),
      }),
    onSuccess: ({ secret }) => {
      void client.invalidateQueries({ queryKey: KEY });
      setOpen(false);
      setUrl('');
      setDescription('');
      setTypes([]);
      onCreated(secret);
    },
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('create-failed', 'Could not add the webhook'),
        description: messageOf(error),
      }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add', 'Add webhook')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('add', 'Add webhook')}
          description={t(
            'add-description',
            'erxes POSTs each event you choose to this address, signed with a secret.',
          )}
        />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t('url', 'Endpoint address')}</Label>
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/erxes/webhook"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('description', 'Description')}</Label>
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t('description-placeholder', 'What receives these events?')}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('events', 'Events')}</Label>
            <MultipleSelector
              value={types}
              onChange={setTypes}
              defaultOptions={options}
              options={options}
              placeholder={t(
                'events-placeholder',
                'Choose events, a prefix like core.customer.*, or *',
              )}
              hidePlaceholderWhenSelected
            />
          </div>
          <Button
            className="w-full"
            disabled={!url || !types.length || create.isPending}
            onClick={() => create.mutate()}
          >
            {t('create', 'Add webhook')}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

const statusBadge = (delivery: WebhookDelivery) =>
  delivery.status === 'succeeded' ? (
    <Badge variant="success">{delivery.responseStatus}</Badge>
  ) : delivery.status === 'failed' ? (
    <Badge variant="destructive">{delivery.responseStatus ?? 'error'}</Badge>
  ) : (
    <Badge variant="warning">{delivery.responseStatus ?? '…'}</Badge>
  );

const Deliveries = ({ webhook }: { webhook: Webhook }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const client = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: [...KEY, webhook.id, 'deliveries'],
    queryFn: () => api.webhooks.deliveries({ id: webhook.id, limit: 30 }),
    refetchInterval: 10_000,
  });
  const redeliver = useMutation({
    mutationFn: (deliveryId: string) => api.webhooks.redeliver({ deliveryId }),
    onSuccess: () =>
      void client.invalidateQueries({ queryKey: [...KEY, webhook.id, 'deliveries'] }),
  });

  if (isLoading) return <Spinner containerClassName="py-4" />;
  if (!data?.data.length)
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground">
        {t('no-deliveries', 'Nothing sent yet.')}
      </p>
    );

  return (
    <ul className="divide-y text-sm">
      {data.data.map((delivery) => (
        <li key={delivery.id} className="flex items-center gap-3 px-4 py-2">
          {statusBadge(delivery)}
          <span className="font-mono text-xs">{delivery.eventType}</span>
          <span className="truncate text-xs text-muted-foreground">
            {delivery.error ?? (delivery.durationMs !== null ? `${delivery.durationMs} ms` : '')}
            {delivery.attempts > 1 &&
              ` · ${t('attempts', { count: delivery.attempts, defaultValue: `${delivery.attempts} attempts` })}`}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            <RelativeDateDisplay value={delivery.createdAt} asChild>
              <span>
                <RelativeDateDisplay.Value value={delivery.createdAt} />
              </span>
            </RelativeDateDisplay>
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={redeliver.isPending}
            onClick={() => redeliver.mutate(delivery.id)}
          >
            <IconRefresh />
          </Button>
        </li>
      ))}
    </ul>
  );
};

const WebhookRow = ({
  webhook,
  onSecret,
}: {
  webhook: Webhook;
  onSecret: (secret: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const { toast } = useToast();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const refresh = () => void client.invalidateQueries({ queryKey: KEY });
  const onError = (error: unknown) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Something went wrong'),
      description: messageOf(error),
    });
  const toggle = useMutation({
    mutationFn: () =>
      api.webhooks.update({
        id: webhook.id,
        status: webhook.status === 'active' ? 'disabled' : 'active',
      }),
    onSuccess: refresh,
    onError,
  });
  const remove = useMutation({
    mutationFn: () => api.webhooks.remove({ id: webhook.id }),
    onSuccess: refresh,
    onError,
  });
  const rotate = useMutation({
    mutationFn: () => api.webhooks.rotateSecret({ id: webhook.id }),
    onSuccess: ({ secret }) => onSecret(secret),
    onError,
  });
  const test = useMutation({
    mutationFn: () => api.webhooks.test({ id: webhook.id }),
    onSuccess: () => {
      toast({ title: t('test-sent', 'Test event queued') });
      setOpen(true);
      setTimeout(
        () => void client.invalidateQueries({ queryKey: [...KEY, webhook.id, 'deliveries'] }),
        2000,
      );
    },
    onError,
  });

  return (
    <li className="rounded-lg border">
      <div className="flex items-center gap-3 p-3">
        <button type="button" onClick={() => setOpen(!open)} className="text-muted-foreground">
          {open ? <IconChevronDown className="size-4" /> : <IconChevronRight className="size-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-sm">{webhook.url}</span>
            {webhook.status === 'active' ? (
              <Badge variant="success">{t('active', 'Active')}</Badge>
            ) : (
              <Badge variant="secondary">{t('off', 'Off')}</Badge>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {webhook.description ? `${webhook.description} · ` : ''}
            {webhook.eventTypes.join(', ')}
            {webhook.disabledReason && ` · ${webhook.disabledReason}`}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          title={t('test', 'Send a test event')}
          disabled={test.isPending}
          onClick={() => test.mutate()}
        >
          <IconSend />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          title={t('rotate', 'New signing secret')}
          disabled={rotate.isPending}
          onClick={() => rotate.mutate()}
        >
          <IconKey />
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={toggle.isPending}
          onClick={() => toggle.mutate()}
        >
          {webhook.status === 'active' ? <IconX /> : <IconCheck />}
          {webhook.status === 'active' ? t('turn-off', 'Turn off') : t('turn-on', 'Turn on')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={remove.isPending}
          onClick={() => remove.mutate()}
        >
          <IconTrash />
        </Button>
      </div>
      {open && (
        <div className="border-t">
          <Deliveries webhook={webhook} />
        </div>
      )}
    </li>
  );
};

/** Settings › Webhooks: endpoints that receive the organisation's events, with each delivery's outcome. */
export const WebhooksSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const can = useCan();
  const [secret, setSecret] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () => api.webhooks.list(),
    enabled: can('webhooks.manage'),
  });

  if (!can('webhooks.manage')) return <Navigate to="/settings" replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'Webhooks'), to: '/settings/webhooks', icon: IconWebhook }]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <NewWebhook onCreated={setSecret} />
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-3 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'intro',
              'Each event is POSTed as JSON with an Erxes-Signature header (t=<time>,v1=<HMAC-SHA256 of "<time>.<body>">). Failed deliveries are retried for about a day.',
            )}
          </p>
          {isLoading ? (
            <Spinner containerClassName="py-12" />
          ) : !data?.data.length ? (
            <Empty className="py-16">
              <Empty.Header>
                <Empty.Media variant="icon">
                  <IconWebhook />
                </Empty.Media>
                <Empty.Title>{t('empty', 'No webhooks yet')}</Empty.Title>
                <Empty.Description>
                  {t(
                    'empty-description',
                    'Send customer, company and plugin events to your own systems.',
                  )}
                </Empty.Description>
              </Empty.Header>
            </Empty>
          ) : (
            <ul className="space-y-2">
              {data.data.map((webhook) => (
                <WebhookRow key={webhook.id} webhook={webhook} onSecret={setSecret} />
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
      {secret && <SecretNotice secret={secret} onClose={() => setSecret(null)} />}
    </PageContainer>
  );
};
