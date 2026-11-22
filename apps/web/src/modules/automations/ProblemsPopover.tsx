import type { AutomationStep } from '@erxes/core-contract';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Button, Popover } from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { BuilderContext } from './builder/BuilderContext';
import { findStep } from './builder/flowModel';
import { describeStep } from './builder/flowText';
import type { FieldInfo } from './builder/useAutomationFields';

export const ProblemsPopover = ({
  steps,
  fields,
  problems,
  serverProblems,
  onSelect,
}: {
  steps: AutomationStep[];
  fields: FieldInfo[];
  problems: Map<string, string[]>;
  serverProblems: string[];
  onSelect: (stepId: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const { events, outputsBefore, knownActions } = useContext(BuilderContext);
  const count = [...problems.values()].reduce((sum, list) => sum + list.length, 0);

  const stepProblems = [...problems.entries()].flatMap(([stepId, list]) => {
    const step = findStep(steps, stepId);

    if (!step) return [];

    const context = {
      actions: knownActions,
      events,
      fields: [...fields, ...outputsBefore(stepId)],
    };

    return [{ stepId, first: list[0], title: describeStep(step, context).title }];
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
          {stepProblems.map(({ stepId, title, first }) => (
            <li key={stepId}>
              <button
                type="button"
                className="w-full text-left text-destructive-text hover:underline"
                onClick={() => onSelect(stepId)}
              >
                {title}: {first}
              </button>
            </li>
          ))}
        </ul>
      </Popover.Content>
    </Popover>
  );
};
