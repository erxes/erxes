import { IconCash, IconPlugConnected } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Empty, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { PaymentGateway } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { paths } from '~/lib/paths';
import { logoUrlOf } from '../integrations/logos';

type Gateway = PaymentGateway;

/** A gateway's logo, as Settings › Integrations shows it; its first letter when core has none. */
const GatewayLogo = ({ gateway }: { gateway: Gateway }) => {
  const url = logoUrlOf(gateway.key);

  if (url) return <img src={url} alt="" className="size-8 shrink-0 rounded-sm object-contain" />;

  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-sm border font-semibold"
    >
      {gateway.integrationName.charAt(0).toUpperCase()}
    </span>
  );
};

/**
 * One connected gateway: its service, its own name, whether it's on, and whether invoices that
 * name no gateway go through it. Its keys are set up on its Integrations page.
 */
const GatewayRow = ({
  gateway,
  isDefault,
  onDefault,
  pending,
}: {
  gateway: Gateway;
  isDefault: boolean;
  onDefault: () => void;
  pending: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { t: tc } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const active = gateway.status === 'active';

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <GatewayLogo gateway={gateway} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-medium">
          {gateway.name}
          {isDefault && <Badge variant="secondary">{t('default', 'Default')}</Badge>}
          {!active && <Badge variant="muted">{t('off', 'Off')}</Badge>}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {gateway.integrationName} · {tc(`pays.${gateway.pays}`, gateway.pays)}
        </p>
      </div>
      {!isDefault && active && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={onDefault}>
          {t('make-default', 'Make default')}
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        nativeButton={false}
        render={<Link to={paths.settings.integration(gateway.key)} />}
      >
        {t('set-up', 'Set up')}
      </Button>
    </li>
  );
};

/**
 * The connected gateways, the default marked. Invoices from core and every plugin go through the
 * default unless they name a gateway or it doesn't take their currency; with none, the oldest.
 */
export const Gateways = ({ gateways }: { gateways: Gateway[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { toast } = useToast();
  const client = useQueryClient();
  const settings = useQuery(orpc.payments.settings.queryOptions());

  const save = useMutation(
    orpc.payments.saveSettings.mutationOptions({
      onSuccess: (saved) => client.setQueryData(orpc.payments.settings.queryKey(), saved),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('save-failed', 'Could not save'),
          description: messageOf(error),
        }),
    }),
  );

  const chosen = settings.data?.defaultGatewayId ?? null;
  // No default picked: the oldest one that's on takes the invoices.
  const defaultId = chosen ?? gateways.find((gateway) => gateway.status === 'active')?.id ?? null;

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium">{t('gateways', 'Gateways')}</h2>
      <p className="text-sm text-muted-foreground">
        {t(
          'default-gateway-description',
          'Invoices from core and every plugin go through the default, unless they name a gateway or it doesn’t take their currency.',
        )}
      </p>
      <ul className="divide-y rounded-lg border">
        {gateways.map((gateway) => (
          <GatewayRow
            key={gateway.id}
            gateway={gateway}
            isDefault={gateway.id === defaultId}
            pending={save.isPending}
            onDefault={() => save.mutate({ defaultGatewayId: gateway.id })}
          />
        ))}
      </ul>
    </section>
  );
};

export const ConnectGateways = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });

  return (
    <Button nativeButton={false} render={<Link to={paths.settings.paymentIntegrations} />}>
      <IconPlugConnected />
      {t('add', 'Connect a gateway')}
    </Button>
  );
};

export const NoGateways = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconCash />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No gateway yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Connect a payment gateway in Settings › Integrations so plugins can take payments for orders, bookings and more.',
          )}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <ConnectGateways />
      </Empty.Content>
    </Empty>
  );
};
