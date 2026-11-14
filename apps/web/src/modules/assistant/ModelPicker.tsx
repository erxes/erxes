import type { AssistantThinkingLevel } from '@erxes/core-contract';
import { IconBrain, IconCheck, IconChevronDown, IconSettings } from '@tabler/icons-react';
import { Button, Command, Popover, Select } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { PROVIDER_LABELS } from './providers';
import type { ModelRunState } from './useModelRun';

const LEVEL_LABELS: Record<AssistantThinkingLevel, string> = {
  off: 'Off',
  minimal: 'Minimal',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  xhigh: 'Extra high',
  max: 'Max',
};

const ModelList = ({ state, onDone }: { state: ModelRunState; onDone: () => void }) => {
  const { t } = useTranslation('assistant');
  const navigate = useNavigate();
  const { run, entries, setPicked, picked } = state;

  return (
    <Command>
      <Command.Input placeholder={t('model.search', 'Find a model')} />
      <Command.List className="max-h-popup">
        <Command.Empty>{t('model.none', 'No model matches.')}</Command.Empty>
        {entries.map((entry) => (
          <Command.Group key={entry.provider} heading={PROVIDER_LABELS[entry.provider]}>
            {entry.error && (
              <Command.Item disabled value={`${entry.provider}-error`}>
                <span className="text-destructive-text">{entry.error}</span>
              </Command.Item>
            )}
            {entry.models.map((model) => (
              <Command.Item
                key={model.id}
                value={`${entry.provider} ${model.id} ${model.name ?? ''}`}
                onSelect={() => {
                  setPicked({ ...picked, provider: entry.provider, model: model.id });
                  onDone();
                }}
              >
                <span className="min-w-0 flex-1 truncate">{model.name ?? model.id}</span>
                {run?.provider === entry.provider && run.model === model.id && (
                  <IconCheck aria-hidden className="size-4" />
                )}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
        <Command.Separator />
        <Command.Group>
          <Command.Item
            value="manage-keys"
            onSelect={() => void navigate(paths.settings.assistant)}
          >
            <IconSettings aria-hidden />
            {t('model.manage', 'Manage provider keys')}
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command>
  );
};

export const ModelPicker = ({ state, disabled }: { state: ModelRunState; disabled: boolean }) => {
  const { t } = useTranslation('assistant');
  const [open, setOpen] = useState(false);
  const { run } = state;

  const name = run
    ? `${PROVIDER_LABELS[run.provider]} · ${run.label ?? t('model.default', 'default model')}`
    : t('model.no-key', 'No provider');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        disabled={disabled || !run}
        aria-label={t('model.label', 'Model: {{name}}', { name })}
        render={<Button variant="ghost" size="sm" tone="muted" className="min-w-0" />}
      >
        <span className="truncate">{name}</span>
        <IconChevronDown aria-hidden className="size-3.5 shrink-0" />
      </Popover.Trigger>
      <Popover.Content variant="flush" align="start" className="w-80">
        <ModelList state={state} onDone={() => setOpen(false)} />
      </Popover.Content>
    </Popover>
  );
};

export const ThinkingPicker = ({
  state,
  disabled,
}: {
  state: ModelRunState;
  disabled: boolean;
}) => {
  const { t } = useTranslation('assistant');
  const { run, picked, setPicked } = state;

  const level = run?.thinkingLevel;

  if (!run || !level || run.levels.length < 2) return null;

  return (
    <Select
      value={level}
      disabled={disabled}
      onValueChange={(value) => {
        const next = run.levels.find((candidate) => candidate === value);

        if (next) setPicked({ ...picked, thinkingLevel: next });
      }}
    >
      <Select.Trigger
        aria-label={t('thinking.label', 'Thinking: {{level}}', {
          level: t(`thinking.${level}`, LEVEL_LABELS[level]),
        })}
        className="h-6 w-auto shrink-0"
      >
        <IconBrain aria-hidden className="mr-1.5 size-3.5 shrink-0" />
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {run.levels.map((option) => (
          <Select.Item key={option} value={option}>
            {t(`thinking.${option}`, LEVEL_LABELS[option])}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
