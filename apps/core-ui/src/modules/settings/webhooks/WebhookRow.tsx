import type { Webhook, WebhookDelivery } from '@erxes/core-contract';
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconKey,
  IconRefresh,
  IconSend,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, RelativeDateDisplay, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '~/lib/api';

const useWebhookError = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const { toast } = useToast();

  return (error: Error) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Something went wrong'),
      description: messageOf(error),
    });
};

const deliveriesKey = (id: string) => orpc.webhooks.deliveries.key({ input: { id } });

const StatusBadge = ({ delivery }: { delivery: WebhookDelivery }) =>
  delivery.status === 'succeeded' ? (
    <Badge variant="success">{delivery.responseStatus}</Badge>
  ) : delivery.status === 'failed' ? (
    <Badge variant="destructive">{delivery.responseStatus ?? 'error'}</Badge>
  ) : (
    <Badge variant="warning">{delivery.responseStatus ?? '…'}</Badge>
  );

const DeliveryRow = ({
  delivery,
  redeliver,
}: {
  delivery: WebhookDelivery;
  redeliver: { isPending: boolean; mutate: (input: { deliveryId: string }) => void };
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });

  return (
    <li className="flex items-center gap-3 px-4 py-2">
      <StatusBadge delivery={delivery} />
      <span className="font-mono text-xs">{delivery.eventType}</span>
      <span className="truncate text-xs text-muted-foreground">
        {delivery.error ?? (delivery.durationMs !== null ? `${delivery.durationMs} ms` : '')}
        {delivery.attempts > 1 &&
          ` · ${t('attempts', { count: delivery.attempts, defaultValue: `${delivery.attempts} attempts` })}`}
      </span>
      <span className="ml-auto text-xs text-muted-foreground">
        <RelativeDateDisplay value={delivery.createdAt} render={<span />}>
          <RelativeDateDisplay.Value value={delivery.createdAt} />
        </RelativeDateDisplay>
      </span>
      <Button
        size="sm"
        variant="ghost"
        aria-label={t('redeliver', 'Send again')}
        disabled={redeliver.isPending}
        onClick={() => redeliver.mutate({ deliveryId: delivery.id })}
      >
        <IconRefresh />
      </Button>
    </li>
  );
};

const Deliveries = ({ webhook }: { webhook: Webhook }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const client = useQueryClient();
  const onError = useWebhookError();

  const deliveries = useQuery(
    orpc.webhooks.deliveries.queryOptions({
      input: { id: webhook.id, limit: 30 },
      refetchInterval: 10_000,
    }),
  );

  const redeliver = useMutation(
    orpc.webhooks.redeliver.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: deliveriesKey(webhook.id) }),
      onError,
    }),
  );

  return (
    <QueryState
      query={deliveries}
      className="py-4"
      isEmpty={({ data }) => !data.length}
      empty={
        <p className="px-4 py-3 text-sm text-muted-foreground">
          {t('no-deliveries', 'Nothing sent yet.')}
        </p>
      }
    >
      {({ data }) => (
        <ul className="divide-y text-sm">
          {data.map((delivery) => (
            <DeliveryRow key={delivery.id} delivery={delivery} redeliver={redeliver} />
          ))}
        </ul>
      )}
    </QueryState>
  );
};

const useWebhookActions = (
  webhook: Webhook,
  onSecret: (secret: string) => void,
  onTested: () => void,
) => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const { toast } = useToast();
  const client = useQueryClient();
  const onError = useWebhookError();
  const refresh = () => client.invalidateQueries({ queryKey: orpc.webhooks.list.key() });

  const toggle = useMutation(orpc.webhooks.update.mutationOptions({ onSuccess: refresh, onError }));
  const remove = useMutation(orpc.webhooks.remove.mutationOptions({ onSuccess: refresh, onError }));

  const rotate = useMutation(
    orpc.webhooks.rotateSecret.mutationOptions({
      onSuccess: ({ secret }) => onSecret(secret),
      onError,
    }),
  );

  const test = useMutation(
    orpc.webhooks.test.mutationOptions({
      onSuccess: () => {
        toast({ title: t('test-sent', 'Test event queued') });
        onTested();
        // The test is sent in the background; look again once it has had a moment.
        setTimeout(
          () => void client.invalidateQueries({ queryKey: deliveriesKey(webhook.id) }),
          2000,
        );
      },
      onError,
    }),
  );

  return { toggle, remove, rotate, test };
};

/** The URL and status, then the description, events and why it is off. */
const WebhookSummary = ({ webhook }: { webhook: Webhook }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });

  return (
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
  );
};

export const WebhookRow = ({
  webhook,
  onSecret,
}: {
  webhook: Webhook;
  onSecret: (secret: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const [open, setOpen] = useState(false);

  const { toggle, remove, rotate, test } = useWebhookActions(webhook, onSecret, () =>
    setOpen(true),
  );

  const active = webhook.status === 'active';
  const id = { id: webhook.id };

  return (
    <li className="rounded-lg border">
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          aria-expanded={open}
          aria-label={t('deliveries', 'Deliveries')}
          onClick={() => setOpen(!open)}
          className="text-muted-foreground"
        >
          {open ? <IconChevronDown className="size-4" /> : <IconChevronRight className="size-4" />}
        </button>
        <WebhookSummary webhook={webhook} />
        <Button
          size="sm"
          variant="ghost"
          title={t('test', 'Send a test event')}
          aria-label={t('test', 'Send a test event')}
          disabled={test.isPending}
          onClick={() => test.mutate(id)}
        >
          <IconSend />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          title={t('rotate', 'New signing secret')}
          aria-label={t('rotate', 'New signing secret')}
          disabled={rotate.isPending}
          onClick={() => rotate.mutate(id)}
        >
          <IconKey />
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={toggle.isPending}
          onClick={() => toggle.mutate({ ...id, status: active ? 'disabled' : 'active' })}
        >
          {active ? <IconX /> : <IconCheck />}
          {active ? t('turn-off', 'Turn off') : t('turn-on', 'Turn on')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-label={t('remove', 'Remove')}
          disabled={remove.isPending}
          onClick={() => remove.mutate(id)}
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
