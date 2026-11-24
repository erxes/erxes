import type { DecisionProvider } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { Combobox, EntityPicker, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnections } from '~/modules/settings/vault/useVault';

export const DecisionModelPicker = ({
  provider,
  connection,
  value,
  disabled,
  onChange,
}: {
  provider: DecisionProvider;
  connection?: string;
  value?: string;
  disabled?: boolean;
  onChange: (model: string | undefined) => void;
}) => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);
  const listed = useConnections();

  const active = (listed.data?.data ?? []).filter(
    (item) => item.key === provider && item.status === 'active',
  );

  const connected = connection ? active.some((item) => item.id === connection) : active.length > 0;

  const query = useQuery({
    ...orpc.automations.decisionModels.queryOptions({
      input: { provider, connection: connection || undefined },
      staleTime: 60_000,
      retry: false,
    }),
    enabled: connected,
  });

  const options = query.data?.models ?? [];
  const defaultName = query.data?.defaultModelName ?? (provider === 'typesafe' ? 'Jev latest' : '');

  const defaultLabel = defaultName
    ? t('default-model-named', 'Default ({{model}})', { model: defaultName })
    : t('default-model', 'Default');

  const selected = value ? options.find((item) => item.id === value) : undefined;

  const items =
    value && !selected ? [{ id: value, name: value, recommended: false }, ...options] : options;

  const failure = query.data?.error
    ? new Error(query.data.error)
    : query.error
      ? new Error(messageOf(query.error))
      : null;

  const displayValue = value ? (selected?.name ?? value) : '';
  const placeholder = connected ? defaultLabel : t('connect-first', 'Connect first');
  const triggerText = displayValue || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger
        aria-label={t('model-label', 'Model: {{name}}', { name: triggerText })}
        className="h-8"
        disabled={Boolean(disabled) || !connected}
      >
        <Combobox.Value value={displayValue} placeholder={placeholder} />
      </Combobox.Trigger>
      <Combobox.Content>
        <EntityPicker
          keepOrder
          items={items}
          itemKey={(item) => ({ id: item.id, label: `${item.name} ${item.id}` })}
          renderItem={(item) => <span className="truncate">{item.name}</span>}
          value={value ? [value] : []}
          onValueChange={([next]) => {
            setOpen(false);
            onChange(next || undefined);
          }}
          searchPlaceholder={t('find-model', 'Find a model…')}
          noneLabel={defaultLabel}
          loading={query.isPending}
          error={failure}
        />
      </Combobox.Content>
    </Popover>
  );
};
