import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowUp,
  IconCopy,
  IconTrash,
} from '@tabler/icons-react';
import { Badge, Button, IconTip } from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneStep, insertStep, locate, moveStep, removeStep } from './builder/flowModel';
import { emptyRequired, fillIn } from './builder/flowChecks';
import { BuilderContext } from './builder/BuilderContext';
import { NodeStats } from './builder/FlowNode';
import { StepSettings } from './builder/StepSettings';

/** What the inspector shows: the trigger, the test, or a step (by id). */
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
        tone="destructive"
        aria-label={t('remove-step', 'Remove step')}
        onClick={() => {
          onSteps(removeStep(steps, step.id));
          onSelect('trigger');
        }}
      >
        <IconTrash />
      </Button>
    </div>
  );
};

export const StepHeader = ({
  step,
  steps,
  disabled,
  problems,
  onSteps,
  onSelect,
}: {
  step: AutomationStep;
  steps: AutomationStep[];
  disabled: boolean;
  problems: number;
  onSteps: (steps: AutomationStep[]) => void;
  onSelect: (selection: Selection) => void;
}) => {
  const { t } = useTranslation('automations');
  const counts = useContext(BuilderContext).stats.get(step.id);

  return (
    <div className="flex shrink-0 items-center gap-2">
      {problems > 0 && (
        <Badge variant="destructive">
          <IconAlertTriangle />
          {problems}
        </Badge>
      )}
      {counts && (
        <IconTip label={t('step-stats-title', 'Last 30 days')}>
          <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
            <NodeStats stats={counts} />
          </span>
        </IconTip>
      )}
      {!disabled && <StepTools step={step} steps={steps} onSteps={onSteps} onSelect={onSelect} />}
    </div>
  );
};

export const StepInspector = ({
  step,
  actions,
  subject,
  disabled,
  problems,
  onChange,
}: {
  step: AutomationStep;
  actions: ActionInfo[];
  subject: 'customer' | 'company';
  disabled: boolean;
  problems: string[];
  onChange: (step: AutomationStep) => void;
}) => {
  const inline = new Set(
    step.type === 'action'
      ? emptyRequired(
          step.input,
          actions.find((item) => item.type === step.action),
        ).map(fillIn)
      : [],
  );

  const listed = problems.filter((problem) => !inline.has(problem));

  return (
    <div className="space-y-4">
      {listed.length > 0 && (
        <ul className="space-y-1 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive-text">
          {listed.map((problem) => (
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
