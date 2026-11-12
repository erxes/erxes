import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowUp,
  IconCopy,
  IconTrash,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  cloneStep,
  insertStep,
  locate,
  moveStep,
  removeStep,
  STEP_TITLES,
} from './builder/flowModel';
import { describeStep } from './builder/flowText';
import { BuilderContext } from './builder/BuilderContext';
import { StepSettings } from './builder/StepSettings';
import { useAutomationFields } from './builder/useAutomationFields';

/** What the inspector shows: the automation's settings, its trigger, or a step (by id). */
export type Selection = string;

const StepTools = ({
  step,
  steps,
  onSteps,
  onSelect,
}: {
  step: AutomationStep;
  steps: AutomationStep[];
  onSteps: (steps: AutomationStep[]) => void;
  onSelect: (selection: Selection) => void;
}) => {
  const { t } = useTranslation('automations');
  const place = locate(steps, step.id);

  return (
    <div className="flex shrink-0 gap-0.5">
      <Button
        size="icon"
        variant="ghost"
        aria-label={t('move-up', 'Move up')}
        disabled={!place || place.index === 0}
        onClick={() => onSteps(moveStep(steps, step.id, -1))}
      >
        <IconArrowUp />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        aria-label={t('move-down', 'Move down')}
        disabled={!place || place.index === place.length - 1}
        onClick={() => onSteps(moveStep(steps, step.id, 1))}
      >
        <IconArrowDown />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        aria-label={t('duplicate', 'Duplicate')}
        onClick={() => {
          if (!place) return;

          const copy = cloneStep(step);

          onSteps(insertStep(steps, place.address, place.index + 1, copy));
          onSelect(copy.id);
        }}
      >
        <IconCopy />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="text-destructive"
        aria-label={t('remove-step', 'Remove step')}
        onClick={() => {
          onSteps(removeStep(steps, step.id));
          onSelect('settings');
        }}
      >
        <IconTrash />
      </Button>
    </div>
  );
};

/** The inspector's panel for one step: its settings, what's wrong, and moving or removing it. */
export const StepInspector = ({
  step,
  actions,
  subject,
  disabled,
  problems,
  steps,
  onChange,
  onSteps,
  onSelect,
}: {
  step: AutomationStep;
  actions: ActionInfo[];
  subject: 'customer' | 'company';
  disabled: boolean;
  problems: string[];
  steps: AutomationStep[];
  onChange: (step: AutomationStep) => void;
  onSteps: (steps: AutomationStep[]) => void;
  onSelect: (selection: Selection) => void;
}) => {
  const { t } = useTranslation('automations');
  const { events, stats, outputsBefore } = useContext(BuilderContext);
  const { fields } = useAutomationFields(subject);
  const counts = stats.get(step.id);

  const { title } = describeStep(step, {
    actions,
    events,
    fields: [...fields, ...outputsBefore(step.id)],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t(`step-type.${step.type}`, STEP_TITLES[step.type])}
          </p>
          <h2 className="text-base font-semibold break-words">{title}</h2>
        </div>
        {!disabled && <StepTools step={step} steps={steps} onSteps={onSteps} onSelect={onSelect} />}
      </div>
      {counts && (
        <p className="text-xs text-muted-foreground">
          {t('step-stats', 'Last 30 days: {{succeeded}} done, {{failed}} failed', counts)}
        </p>
      )}
      {problems.length > 0 && (
        <ul className="space-y-1 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {problems.map((problem) => (
            <li key={problem} className="flex items-center gap-2">
              <IconAlertTriangle className="size-4 shrink-0" />
              {problem}
            </li>
          ))}
        </ul>
      )}
      <StepSettings
        step={step}
        actions={actions}
        subject={subject}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
};
