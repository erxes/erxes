import type { AgentSettings } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { Form, Input, Select, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PROVIDER_LABELS } from '~/modules/assistant/providers';

const DEFAULT = 'default';

const NO_WEBSITE = 'none';

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

/** No website, or the website whose customers it serves: a plugin's store, hotel or tour site. */
const WebsiteSelect = ({
  draft,
  onChange,
}: {
  draft: AgentSettings;
  onChange: (draft: AgentSettings) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const websites = useQuery(orpc.websites.list.queryOptions());
  const list = websites.data?.data ?? [];

  return (
    <Select
      value={draft.websiteId ?? NO_WEBSITE}
      onValueChange={(next) => onChange({ ...draft, websiteId: next === NO_WEBSITE ? null : next })}
    >
      <Select.Trigger aria-label={t('website', 'Website')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={NO_WEBSITE}>{t('website-none', 'No website')}</Select.Item>
        {list.map((website) => (
          <Select.Item key={website.id} value={website.id}>
            {website.name} · {website.plugin}
          </Select.Item>
        ))}
        {draft.websiteId && !list.some((website) => website.id === draft.websiteId) && (
          <Select.Item value={draft.websiteId}>{draft.websiteId}</Select.Item>
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
          "With a website, it acts for the customer a plugin says it talks to: it sees and makes that customer's own orders and bookings on that website. Never anyone else's.",
        )}
      >
        <WebsiteSelect draft={draft} onChange={onChange} />
      </Form.Section>
    </div>
  );
};
