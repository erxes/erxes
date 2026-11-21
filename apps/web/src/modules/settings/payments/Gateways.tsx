import type { IntegrationConnection } from '@erxes/core-contract';
import { IconCash, IconPlugConnected } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Empty, Select, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { paths } from '~/lib/paths';

const FIRST_CONNECTED = 'first';

const DefaultGatewaySelect = ({
  value,
  gateways,
}: {
  value: string | null;
  gateways: IntegrationConnection[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { toast } = useToast();
  const client = useQueryClient();

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

  return (
    <Select
      value={value ?? FIRST_CONNECTED}
      disabled={save.isPending}
      onValueChange={(next) =>
        save.mutate({ defaultGatewayId: next === FIRST_CONNECTED ? null : next })
      }
    >
      <Select.Trigger aria-label={t('default-gateway', 'Default gateway')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={FIRST_CONNECTED}>
          {t('default-first', 'None: the first connected one')}
        </Select.Item>
        {gateways
          .filter((gateway) => gateway.status === 'active' || gateway.id === value)
          .map((gateway) => (
            <Select.Item key={gateway.id} value={gateway.id}>
              {gateway.name}
            </Select.Item>
          ))}
      </Select.Content>
    </Select>
  );
};

export const DefaultGateway = ({ gateways }: { gateways: IntegrationConnection[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const settings = useQuery(orpc.payments.settings.queryOptions());

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium">{t('default-gateway', 'Default gateway')}</h2>
      <p className="text-sm text-muted-foreground">
        {t(
          'default-gateway-description',
          'Invoices from core and every plugin go through it, unless they name a gateway or it doesn’t take their currency.',
        )}
      </p>
      <QueryState query={settings}>
        {({ defaultGatewayId }) => (
          <div className="w-72">
            <DefaultGatewaySelect value={defaultGatewayId} gateways={gateways} />
          </div>
        )}
      </QueryState>
    </section>
  );
};

export const ConnectGateways = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });

  return (
    <Button render={<Link to={paths.settings.paymentIntegrations} />}>
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
