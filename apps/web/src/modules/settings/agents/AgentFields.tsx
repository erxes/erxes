import type { AgentSettings } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconWorld } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Form, Input, Select, Switch, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PROVIDER_LABELS } from '~/modules/assistant/providers';

const DEFAULT = 'default';

const NO_PORTAL = 'none';

/** The organisation's default model, or one model of a provider with a saved key. */
const ModelSelect = ({
  draft,
  onChange,
}: {
  draft: AgentSettings;
  onChange: (draft: AgentSettings) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const catalog = useQuery(orpc.assistant.models.queryOptions());

  const options = (catalog.data?.data ?? []).flatMap(({ provider, models }) =>
    models.map((model) => ({
      value: `${provider}/${model.id}`,
      provider,
      model: model.id,
      label: `${PROVIDER_LABELS[provider]} · ${model.name ?? model.id}`,
    })),
  );

  const value = draft.provider && draft.model ? `${draft.provider}/${draft.model}` : DEFAULT;

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        const option = options.find((candidate) => candidate.value === next);

        onChange({ ...draft, provider: option?.provider ?? null, model: option?.model ?? null });
      }}
    >
      <Select.Trigger aria-label={t('model', 'Model')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={DEFAULT}>
          {t('model-default', "The organisation's default")}
        </Select.Item>
        {options.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
        {value !== DEFAULT && !options.some((option) => option.value === value) && (
          <Select.Item value={value}>{draft.model}</Select.Item>
        )}
      </Select.Content>
    </Select>
  );
};

/** No portal, or the portal whose customers it serves: a plugin's store, hotel or tour site. */
const PortalSelect = ({
  draft,
  onChange,
}: {
  draft: AgentSettings;
  onChange: (draft: AgentSettings) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const portals = useQuery(orpc.portals.list.queryOptions());
  const list = portals.data?.data ?? [];

  return (
    <Select
      value={draft.portalId ?? NO_PORTAL}
      onValueChange={(next) => onChange({ ...draft, portalId: next === NO_PORTAL ? null : next })}
    >
      <Select.Trigger aria-label={t('portal', 'Portal')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={NO_PORTAL}>{t('portal-none', 'No portal')}</Select.Item>
        {list.map((portal) => (
          <Select.Item key={portal.id} value={portal.id}>
            {portal.name}
          </Select.Item>
        ))}
        {draft.portalId && !list.some((portal) => portal.id === draft.portalId) && (
          <Select.Item value={draft.portalId}>{draft.portalId}</Select.Item>
        )}
      </Select.Content>
    </Select>
  );
};

export const AgentFields = ({
  draft,
  onChange,
}: {
  draft: AgentSettings;
  onChange: (draft: AgentSettings) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });

  return (
    <div className="space-y-4">
      <Form.Section title={t('name', 'Name')}>
        <Input
          aria-label={t('name', 'Name')}
          value={draft.name}
          maxLength={100}
          placeholder={t('name-placeholder', 'Who customers talk to, like "Shop assistant"')}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
        />
      </Form.Section>
      <Form.Section
        title={t('instructions', 'Instructions')}
        description={t(
          'instructions-description',
          'What it does and how it talks. It reads these before every conversation.',
        )}
      >
        <Textarea
          aria-label={t('instructions', 'Instructions')}
          value={draft.instructions}
          maxLength={12_000}
          rows={14}
          onChange={(event) => onChange({ ...draft, instructions: event.target.value })}
        />
      </Form.Section>
      <Form.Section
        title={t('model', 'Model')}
        description={t('model-description', 'It runs on the provider keys under Assistant.')}
      >
        <ModelSelect draft={draft} onChange={onChange} />
      </Form.Section>
      <Form.Section
        title={t('customers', 'Customers')}
        description={t(
          'customers-help',
          "With a portal, it acts for the customer a plugin says it talks to: it sees and makes that customer's own orders and bookings on that portal. Never anyone else's.",
        )}
      >
        <PortalSelect draft={draft} onChange={onChange} />
      </Form.Section>
      <Form.Section title={t('web', 'Web')}>
        <label className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2 text-sm">
          <span className="flex items-center gap-2">
            <IconWorld className="size-4 text-muted-foreground" />
            {t('web-label', 'Search the web and read pages')}
          </span>
          <Switch checked={draft.web} onCheckedChange={(web) => onChange({ ...draft, web })} />
        </label>
      </Form.Section>
    </div>
  );
};
