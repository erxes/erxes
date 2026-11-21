import type { AssistantProvider } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { Form, Input, Label, Select, Switch, Textarea } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { PROVIDER_LABELS } from '~/modules/assistant/providers';

/** What an agent says and runs on; the page around it saves. */
export interface AgentDraft {
  name: string;
  instructions: string;
  provider: AssistantProvider | null;
  model: string | null;
  customers: boolean;
}

const DEFAULT = 'default';

/** The organisation's default model, or one model of a provider with a saved key. */
const ModelSelect = ({
  draft,
  onChange,
}: {
  draft: AgentDraft;
  onChange: (draft: AgentDraft) => void;
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

export const AgentFields = ({
  draft,
  onChange,
}: {
  draft: AgentDraft;
  onChange: (draft: AgentDraft) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const customersId = useId();

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
      <Form.Section title={t('customers', 'Customers')}>
        <div className="flex items-start gap-3">
          <Switch
            id={customersId}
            checked={draft.customers}
            onCheckedChange={(customers) => onChange({ ...draft, customers })}
          />
          <div className="space-y-1">
            <Label htmlFor={customersId}>{t('customers-label', 'Acts for the customer')}</Label>
            <p className="text-sm text-muted-foreground">
              {t(
                'customers-help',
                "When a plugin says which customer it talks to, the agent sees and makes that customer's own orders and bookings through the plugin's customer routes. Never anyone else's.",
              )}
            </p>
          </div>
        </div>
      </Form.Section>
    </div>
  );
};
