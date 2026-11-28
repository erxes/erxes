import type {
  AssistantProvider,
  AssistantProviderModels,
  AssistantThinkingLevel,
} from '@erxes/core-contract';
import { IconBrain, IconCheck, IconChevronDown, IconSettings } from '@tabler/icons-react';
import { Button, cn, Command, IconTip, Popover, Slider } from 'erxes-ui';
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
    ? `${PROVIDER_LABELS[run.provider]} · ${model}${levelName ? ` · ${levelName}` : ''}`
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
      <Popover.Content variant="flush" align="end" className="w-80">
        {level && (
          <div className="flex flex-col gap-2.5 border-b px-3 pt-2.5 pb-3">
            <div className="flex items-center gap-1.5 text-xs">
              <IconBrain aria-hidden className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{t('thinking.title', 'Thinking')}</span>
              <span
                key={level}
                aria-hidden
                className="ml-auto font-medium animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none"
              >
                {levelName}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Slider
                min={0}
                max={levels.length - 1}
                step={1}
                value={Math.max(0, levels.indexOf(level))}
                aria-label={t('thinking.label', 'Thinking: {{level}}', { level: levelName })}
                onValueChange={(index) => {
                  const next = levels[index];

                  if (next && next !== level) {
                    state.setPicked({ ...state.picked, thinkingLevel: next });
                  }
                }}
              />
              <div aria-hidden className="flex justify-between px-1.5">
                {levels.map((option, index) => (
                  <span
                    key={option}
                    className={cn(
                      'size-1 rounded-full transition-colors',
                      index <= levels.indexOf(level) ? 'bg-primary' : 'bg-border',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <ModelList state={state} onDone={() => setOpen(false)} />
      </Popover.Content>
    </Popover>
  );
};
