import { orpc } from '@erxes/core-contract/client';
import { AgentStepModel } from '@erxes/core-contract/values';
import {
  IconCheck,
  IconChevronDown,
  IconExternalLink,
  IconListCheck,
  IconPlugConnected,
  IconSparkles,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Command, Popover, Select } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { ProviderModelGroups } from '~/modules/assistant/ModelPicker';
import { PROVIDER_LABELS } from '~/modules/assistant/providers';
import type { ActionInputProps } from './actionFieldSelects';
import { AgentActionChecklist } from './AgentActionChecklist';
import { Segmented } from './Segmented';

const toolsOf = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

/** What an agent step may run: every action, or the categories and actions ticked. */
export const AgentToolsInput = ({ field, value, onChange, disabled }: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const chosen = toolsOf(value);
  const [picking, setPicking] = useState(chosen.length > 0);
  const limited = picking || chosen.length > 0;

  return (
    <div className="space-y-2">
      <Segmented
        value={limited ? 'some' : 'all'}
        disabled={disabled}
        label={field.label}
        onChange={(next) => {
          setPicking(next === 'some');

          if (next === 'all') onChange(undefined);
        }}
        options={[
          { value: 'all', label: t('agent-tools-all', 'Every action'), icon: IconSparkles },
          { value: 'some', label: t('agent-tools-some', 'Only these'), icon: IconListCheck },
        ]}
      />
      {limited && !chosen.length && (
        <p className="text-xs text-muted-foreground">
          {t(
            'agent-tools-pick',
            'Pick a category or single actions. Until then it can run every action.',
          )}
        </p>
      )}
      {limited && !disabled && <AgentActionChecklist chosen={chosen} onChange={onChange} />}
    </div>
  );
};

const NO_API = 'none';

/** The API key an agent step calls the erxes API with, or none: then it has no API. */
export const AgentApiKeyInput = ({ field, value, onChange, disabled }: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const keys = useQuery(orpc.apiKeys.list.queryOptions());
  const listed = keys.data?.data ?? [];
  const chosen = typeof value === 'string' ? value : NO_API;
  const missing = chosen !== NO_API && keys.isSuccess && !listed.some((key) => key.id === chosen);

  return (
    <div className="space-y-1.5">
      <Select
        value={chosen}
        disabled={disabled}
        onValueChange={(next) => onChange(next === NO_API ? undefined : next)}
      >
        <Select.Trigger aria-label={field.label}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={NO_API}>{t('agent-api-none', "Don't use the erxes API")}</Select.Item>
          {listed.map((key) => (
            <Select.Item key={key.id} value={key.id}>
              {key.name}
            </Select.Item>
          ))}
          {missing && (
            <Select.Item value={chosen} disabled>
              {t('agent-api-gone', 'A removed key')}
            </Select.Item>
          )}
        </Select.Content>
      </Select>
      {missing && (
        <p className="text-xs text-destructive-text">
          {t('agent-api-gone-hint', 'This key was removed. Choose another, or the step will fail.')}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {t(
          'agent-api-hint',
          'The agent reads and changes erxes with this key’s rules. Make a new key just for this step.',
        )}{' '}
        <Link
          to={paths.settings.apiKeyNew}
          target="_blank"
          className="inline-flex items-center gap-0.5 text-primary-text underline"
        >
          {t('agent-api-create', 'Create a key')}
          <IconExternalLink aria-hidden className="size-3" />
        </Link>
      </p>
    </div>
  );
};

const ModelList = ({
  value,
  onPick,
}: {
  value: AgentStepModel | null;
  onPick: (next: AgentStepModel | null) => void;
}) => {
  const { t } = useTranslation('automations');
  const navigate = useNavigate();
  const catalog = useQuery(orpc.assistant.models.queryOptions());
  const entries = catalog.data?.data ?? [];

  return (
    <Command>
      <Command.Input placeholder={t('agent-model-search', 'Find a model')} />
      <Command.List className="max-h-popup">
        <Command.Empty>{t('agent-model-no-match', 'No model matches.')}</Command.Empty>
        <Command.Group>
          <Command.Item value="organisation default" onSelect={() => onPick(null)}>
            <span className="min-w-0 flex-1 truncate">
              {t('agent-model-default', "Organisation's default")}
            </span>
            {!value && <IconCheck aria-hidden className="size-4" />}
          </Command.Item>
        </Command.Group>
        <ProviderModelGroups
          entries={entries}
          current={value}
          onPick={(provider, model) => onPick({ provider, model })}
        />
        {catalog.isSuccess && !entries.length && (
          <Command.Group heading={t('agent-model-none-heading', 'No AI provider connected')}>
            <Command.Item
              value="connect an ai provider"
              onSelect={() => void navigate(paths.settings.aiIntegrations)}
            >
              <IconPlugConnected aria-hidden className="size-4" />
              <span className="min-w-0 flex-1 truncate">
                {t('agent-model-connect', 'Connect an AI provider')}
              </span>
            </Command.Item>
          </Command.Group>
        )}
      </Command.List>
    </Command>
  );
};

/** The model an agent step runs on: one of the connected providers' models, or the default. */
export const AgentModelInput = ({ field, value, onChange, disabled }: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);
  const chosen = AgentStepModel.safeParse(value).data ?? null;

  const name = chosen
    ? `${PROVIDER_LABELS[chosen.provider]} · ${chosen.model}`
    : t('agent-model-default', "Organisation's default");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        disabled={disabled}
        aria-label={`${field.label}: ${name}`}
        render={<Button variant="outline" className="w-full justify-between" />}
      >
        <span className="truncate">{name}</span>
        <IconChevronDown aria-hidden className="size-4 shrink-0" />
      </Popover.Trigger>
      <Popover.Content variant="flush" align="start" className="w-80">
        <ModelList
          value={chosen}
          onPick={(next) => {
            onChange(next ?? undefined);
            setOpen(false);
          }}
        />
      </Popover.Content>
    </Popover>
  );
};
