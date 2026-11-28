import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Badge, IconTip } from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { emptyRequired, fillIn } from './builder/flowChecks';
import { BuilderContext } from './builder/BuilderContext';
import { NodeStats } from './builder/FlowNode';
import { StepMenu } from './builder/StepMenu';
import { StepSettings } from './builder/StepSettings';

/** What the inspector shows: the trigger, the test, or a step (by id). */
export type Selection = string;

/** The panel header's end for a step: its problems, recent runs and "⋯". */
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
      {!disabled && (
        <StepMenu
          step={step}
          steps={steps}
          onSteps={onSteps}
          onSelect={onSelect}
          className="size-8"
        />
      )}
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
