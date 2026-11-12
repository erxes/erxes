import type { PaymentGateway, PluginPaymentSettings } from '@erxes/core-contract';
import { IconCash, IconPlug } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Checkbox, Empty, Select, useToast } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '~/lib/api';

const useSaveFailed = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { toast } = useToast();

  return (error: Error) =>
    toast({
      variant: 'destructive',
      title: t('save-failed', 'Could not save'),
      description: messageOf(error),
    });
};

/** Gateways a plugin may use; none checked means any. */
const AllowedGateways = ({
  allowed,
  gateways,
  onToggle,
}: {
  allowed: string[];
  gateways: PaymentGateway[];
  onToggle: (id: string, on: boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const id = useId();

  return (
    <div className="flex flex-wrap items-center gap-3 pl-7 text-xs text-muted-foreground">
      <span>
        {allowed.length
          ? t('allowed-some', 'May use:')
          : t('allowed-all', 'May use any gateway; limit to:')}
      </span>
      {gateways.map((gateway) => (
        <span key={gateway.id} className="flex items-center gap-1.5">
          <Checkbox
            id={`${id}-${gateway.id}`}
            checked={allowed.includes(gateway.id)}
            onCheckedChange={(on) => onToggle(gateway.id, on === true)}
          />
          <label htmlFor={`${id}-${gateway.id}`}>{gateway.name}</label>
        </span>
      ))}
    </div>
  );
};

/** Which gateway each payment-taking plugin uses, and which it may use. */
const PluginSettingsRow = ({
  settings,
  gateways,
}: {
  settings: PluginPaymentSettings;
  gateways: PaymentGateway[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const client = useQueryClient();
  const onError = useSaveFailed();
  const allowed = settings.allowedGatewayIds;

  const save = useMutation(
    orpc.payments.updatePluginSettings.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.payments.pluginSettings.key() }),
      onError,
    }),
  );

  const toggleAllowed = (id: string, on: boolean) => {
    const next = on ? [...allowed, id] : allowed.filter((item) => item !== id);
    const defaultGatewayId =
      settings.defaultGatewayId && next.length && !next.includes(settings.defaultGatewayId)
        ? null
        : settings.defaultGatewayId;

    save.mutate({ plugin: settings.plugin, allowedGatewayIds: next, defaultGatewayId });
  };

  return (
    <li className="space-y-2 p-3 text-sm">
      <div className="flex items-center gap-3">
        <IconPlug className="size-4 text-muted-foreground" />
        <span className="font-medium">{settings.title}</span>
        <div className="ml-auto w-56">
          <Select
            value={settings.defaultGatewayId ?? 'auto'}
            onValueChange={(value) =>
              save.mutate({
                plugin: settings.plugin,
                allowedGatewayIds: allowed,
                defaultGatewayId: value === 'auto' ? null : value,
              })
            }
          >
            <Select.Trigger aria-label={t('default-gateway-label', 'Default gateway')}>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="auto">
                {t('default-auto', 'Default: first active gateway')}
              </Select.Item>
              {gateways
                .filter((gateway) => !allowed.length || allowed.includes(gateway.id))
                .map((gateway) => (
                  <Select.Item key={gateway.id} value={gateway.id}>
                    {t('default-gateway', 'Default: {{name}}', { name: gateway.name })}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select>
        </div>
      </div>
      <AllowedGateways allowed={allowed} gateways={gateways} onToggle={toggleAllowed} />
    </li>
  );
};

/** Shown once there are gateways and plugins that take payments. */
export const PluginGatewaySettings = ({ gateways }: { gateways: PaymentGateway[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const pluginSettings = useQuery(orpc.payments.pluginSettings.queryOptions());

  return (
    <QueryState query={pluginSettings} isEmpty={({ data }) => !data.length}>
      {({ data }) => (
        <section className="space-y-2">
          <h2 className="text-sm font-medium">{t('plugins', 'Plugins taking payments')}</h2>
          <ul className="divide-y rounded-lg border">
            {data.map((settings) => (
              <PluginSettingsRow key={settings.plugin} settings={settings} gateways={gateways} />
            ))}
          </ul>
        </section>
      )}
    </QueryState>
  );
};

export const NoGateways = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });

  return (
    <Empty className="py-10">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconCash />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No gateway yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Connect QPay so plugins can take payments for orders, bookings and more.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

export const GatewayList = ({ gateways }: { gateways: PaymentGateway[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const client = useQueryClient();
  const onError = useSaveFailed();

  const toggle = useMutation(
    orpc.payments.updateGateway.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.payments.key() }),
      onError,
    }),
  );

  return (
    <ul className="divide-y rounded-lg border">
      {gateways.map((gateway) => (
        <li key={gateway.id} className="flex items-center gap-3 p-3">
          <span className="font-medium">{gateway.name}</span>
          <Badge variant="secondary">{gateway.kind}</Badge>
          {gateway.settings.sandbox === true && (
            <Badge variant="warning">{t('sandbox-badge', 'sandbox')}</Badge>
          )}
          {typeof gateway.settings.invoiceCode === 'string' && (
            <span className="text-xs text-muted-foreground">{gateway.settings.invoiceCode}</span>
          )}
          <Button
            className="ml-auto"
            size="sm"
            variant="outline"
            disabled={toggle.isPending}
            onClick={() =>
              toggle.mutate({
                id: gateway.id,
                status: gateway.status === 'active' ? 'disabled' : 'active',
              })
            }
          >
            {gateway.status === 'active' ? t('turn-off', 'Turn off') : t('turn-on', 'Turn on')}
          </Button>
        </li>
      ))}
    </ul>
  );
};
