import type { VaultConnection } from '@erxes/core-contract';
import { IconPlugConnected, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  CONNECTION_CONTENT_TYPE,
  type ConnectionPickerProps,
  EntityPicker,
  Popover,
  RecordChip,
  Skeleton,
  useOpenRecord,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Integration } from '../integrations/catalog';
import { IntegrationMark, useIntegrationText } from '../integrations/IntegrationStatusBadge';
import { connectionsOf, useConnections, useKeyedIntegrations } from './useVault';

const NotConnected = ({
  integration,
  onConnect,
}: {
  integration: Integration | undefined;
  onConnect: (() => void) | undefined;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'vault' });
  const text = useIntegrationText();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
      {integration ? (
        <IntegrationMark integration={integration} />
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-primary-text">
          <IconPlugConnected className="size-5" />
        </span>
      )}
      <span className="min-w-0 flex-1 text-sm">
        {integration && <span className="block font-medium">{text(integration).name}</span>}
        <span className="block text-xs text-muted-foreground">
          {onConnect
            ? t('not-connected', 'Not connected')
            : t('not-connected-ask', 'Not connected. Ask someone who manages integrations.')}
        </span>
      </span>
      {onConnect && (
        <Button type="button" size="sm" onClick={onConnect}>
          {t('connect', 'Connect')}
        </Button>
      )}
    </div>
  );
};

const PickConnection = ({
  connections,
  value,
  onValueChange,
  noneLabel,
  disabled,
  onConnect,
}: Pick<ConnectionPickerProps, 'value' | 'onValueChange' | 'noneLabel' | 'disabled'> & {
  connections: VaultConnection[];
  onConnect: (() => void) | undefined;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'vault' });
  const [open, setOpen] = useState(false);
  const selected = connections.find(({ id }) => id === value);

  const close = (then: () => void) => () => {
    setOpen(false);
    then();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {value ? (
        <div className="flex h-8 items-center gap-1 rounded-md border pl-1.5">
          <RecordChip
            record={{ contentType: CONNECTION_CONTENT_TYPE, contentId: value }}
            name={selected?.name ?? t('unknown-connection', 'Connection')}
            avatarUrl={null}
            loading={false}
            failed={!selected}
          />
          <Combobox.Trigger
            variant="ghost"
            size="icon"
            className="ml-auto w-7 flex-none"
            aria-label={t('change', 'Change the connection')}
            disabled={disabled}
          />
        </div>
      ) : (
        <Combobox.Trigger className="h-8" disabled={disabled}>
          <Combobox.Value placeholder={noneLabel ?? t('choose', 'Choose a connection')} />
        </Combobox.Trigger>
      )}
      <Combobox.Content>
        <EntityPicker
          items={connections}
          itemKey={({ id, name }) => ({ id, label: name })}
          value={value ? [value] : []}
          onValueChange={([connectionId]) => close(() => onValueChange(connectionId ?? null))()}
          searchPlaceholder={t('search', 'Search connections')}
          noneLabel={noneLabel}
          renderCreate={(search) =>
            onConnect && !search ? (
              <Command.Item value="__connect__" onSelect={close(onConnect)}>
                <IconPlus className="size-4" />
                {t('connect-another', 'Connect another')}
              </Command.Item>
            ) : null
          }
        />
      </Combobox.Content>
    </Popover>
  );
};

export const ConnectionPicker = ({
  integration,
  category,
  value,
  onValueChange,
  noneLabel,
  only,
  disabled,
}: ConnectionPickerProps) => {
  const { openNew } = useOpenRecord();
  const listed = useConnections();
  const { integrations, loading } = useKeyedIntegrations({ integration, category });

  if (listed.isPending || loading) return <Skeleton className="h-8 w-full" />;

  const connections = connectionsOf(listed.data?.data ?? [], integrations)
    .map(({ connection }) => connection)
    .filter(
      ({ id, status }) => (!only || only.includes(id)) && (status === 'active' || id === value),
    );

  const connect =
    integrations.length && !only && !disabled
      ? () =>
          openNew(CONNECTION_CONTENT_TYPE, { integration, category, onConnected: onValueChange })
      : undefined;

  if (!connections.length && !value) {
    return (
      <NotConnected integration={integration ? integrations[0] : undefined} onConnect={connect} />
    );
  }

  return (
    <PickConnection
      connections={connections}
      value={value}
      onValueChange={onValueChange}
      noneLabel={noneLabel}
      disabled={disabled}
      onConnect={connect}
    />
  );
};
