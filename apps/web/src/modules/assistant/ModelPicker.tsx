import type {
  AssistantProvider,
  AssistantProviderModels,
  AssistantThinkingLevel,
} from '@erxes/core-contract';
import { IconBrain, IconCheck, IconChevronDown, IconSettings } from '@tabler/icons-react';
import { Button, Command, IconTip, Popover, ToggleGroup } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
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

/** Each provider's models as command groups, with why its list is empty when it is. */
export const ProviderModelGroups = ({
  entries,
  current,
  onPick,
}: {
  entries: AssistantProviderModels[];
  current: { provider: AssistantProvider; model: string | undefined } | null;
  onPick: (provider: AssistantProvider, model: string) => void;
}) =>
  entries.map((entry) => (
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
          onSelect={() => onPick(entry.provider, model.id)}
        >
          <span className="min-w-0 flex-1 truncate">{model.name ?? model.id}</span>
          {current?.provider === entry.provider && current.model === model.id && (
            <IconCheck aria-hidden className="size-4" />
          )}
        </Command.Item>
      ))}
    </Command.Group>
  ));

const ModelList = ({ state, onDone }: { state: ModelRunState; onDone: () => void }) => {
  const { t } = useTranslation('assistant');
  const navigate = useNavigate();
  const canManage = useCan()('assistant.manage');
  const { run, entries, setPicked, picked } = state;

  return (
    <Command>
      <Command.Input placeholder={t('model.search', 'Find a model')} />
      <Command.List className="max-h-popup">
        <Command.Empty>{t('model.none', 'No model matches.')}</Command.Empty>
        <ProviderModelGroups
          entries={entries}
          current={run}
          onPick={(provider, model) => {
            setPicked({ ...picked, provider, model });
            onDone();
          }}
        />
        {canManage && (
          <>
            <Command.Separator />
            <Command.Group>
              <Command.Item
                value="manage-providers"
                onSelect={() => void navigate(paths.settings.aiIntegrations)}
              >
                <IconSettings aria-hidden />
                {t('model.manage', 'Manage AI providers')}
              </Command.Item>
            </Command.Group>
          </>
        )}
      </Command.List>
    </Command>
  );
};

export const ModelPicker = ({ state, disabled }: { state: ModelRunState; disabled: boolean }) => {
  const { t } = useTranslation('assistant');
  const [open, setOpen] = useState(false);
  const { run } = state;

  const model = run?.label ?? t('model.default', 'default model');
  const levels = run && run.levels.length > 1 ? run.levels : [];
  const level = levels.length ? run?.thinkingLevel : undefined;
  const levelName = level ? t(`thinking.${level}`, LEVEL_LABELS[level]) : null;

  const name = run
    ? `${PROVIDER_LABELS[run.provider]} · ${model}`
    : t('model.no-key', 'No provider');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <IconTip label={name}>
        <Popover.Trigger
          disabled={disabled || !run}
          aria-label={t('model.label', 'Model: {{name}}', { name })}
          render={<Button variant="ghost" size="sm" tone="muted" className="min-w-0" />}
        >
          <span className="truncate">{run ? model : name}</span>
          {levelName && <span className="shrink-0 text-muted-foreground">· {levelName}</span>}
          <IconChevronDown aria-hidden className="size-3.5 shrink-0" />
        </Popover.Trigger>
      </IconTip>
      <Popover.Content variant="flush" align="start" className="w-80">
        {level && (
          <div className="flex flex-col gap-1.5 border-b p-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IconBrain aria-hidden className="size-3.5" />
              {t('thinking.title', 'Thinking')}
            </span>
            <ToggleGroup
              variant="outline"
              size="sm"
              value={[level]}
              aria-label={t('thinking.label', 'Thinking: {{level}}', { level: levelName })}
              onValueChange={([value]) => {
                const next = levels.find((candidate) => candidate === value);

                if (next) state.setPicked({ ...state.picked, thinkingLevel: next });
              }}
            >
              {levels.map((option) => (
                <ToggleGroup.Item key={option} value={option} className="flex-1">
                  {t(`thinking.${option}`, LEVEL_LABELS[option])}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </div>
        )}
        <ModelList state={state} onDone={() => setOpen(false)} />
      </Popover.Content>
    </Popover>
  );
};
