import type { AutomationStep } from '@erxes/core-contract';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Button, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { findStep } from './builder/flowModel';
import { useStepText } from './builder/useStepText';

const StepProblem = ({
  step,
  problem,
  onSelect,
}: {
  step: AutomationStep;
  problem: string | undefined;
  onSelect: (stepId: string) => void;
}) => {
  const title = useStepText(step)?.title;

  return (
    <li>
      <Button
        variant="ghost"
        tone="destructive"
        className="h-auto w-full justify-start text-left whitespace-normal"
        onClick={() => onSelect(step.id)}
      >
        {title}: {problem}
      </Button>
    </li>
  );
};

export const ProblemsPopover = ({
  steps,
  problems,
  serverProblems,
  onSelect,
}: {
  steps: AutomationStep[];
  problems: Map<string, string[]>;
  serverProblems: string[];
  onSelect: (stepId: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const count = [...problems.values()].reduce((sum, list) => sum + list.length, 0);

  const stepProblems = [...problems.entries()].flatMap(([stepId, list]) => {
    const step = findStep(steps, stepId);

    return step ? [{ step, first: list[0] }] : [];
  });

  if (!count && !serverProblems.length) return null;

  return (
    <Popover defaultOpen={serverProblems.length > 0}>
      <Popover.Trigger
        render={<Button variant="ghost" size="sm" tone="destructive" className="h-7" />}
      >
        <IconAlertTriangle />
        {t('problem-count', '{{count}} to fix', { count: count + serverProblems.length })}
      </Popover.Trigger>
      <Popover.Content align="end" className="w-80">
        <ul className="space-y-1 text-sm">
          {serverProblems.map((problem) => (
            <li key={problem} className="text-destructive-text">
              {problem}
            </li>
          ))}
          {stepProblems.map(({ step, first }) => (
            <StepProblem key={step.id} step={step} problem={first} onSelect={onSelect} />
          ))}
        </ul>
      </Popover.Content>
    </Popover>
  );
};
