import { TaskStatusPropertyInput } from '@/task/components/task-selects/TaskStatusPropertyInput';
import { TPropertyInputMeta } from 'erxes-ui';
import { useState } from 'react';
import {
  AutomationTemplateRequirementProps,
  splitAutomationNodeType,
} from 'ui-modules';

type TTaskDestination = { teamId: string; status: string };

/**
 * Answers a built-in template's task prerequisites while it is installed.
 *
 * One control rather than two, because a status only means something inside a
 * team: this is the same input the task properties use, so it already scopes
 * the statuses to the team and clears a status the team no longer has. The
 * answer carries both, and the template writes each where it belongs.
 *
 * Nothing is reported until a status is chosen, so a half-made choice leaves
 * the install closed rather than passing an empty field into the flow.
 */
export const TaskTemplateRequirement = ({
  kind,
  value,
  onChange,
}: AutomationTemplateRequirementProps) => {
  const answer = value as TTaskDestination | undefined;
  const [meta, setMeta] = useState<TPropertyInputMeta>(() => ({
    teamId: answer?.teamId || '',
  }));

  // `operation:task.<what>`
  const [, , what] = splitAutomationNodeType(kind);

  if (what !== 'status') {
    return null;
  }

  const teamId = typeof meta.teamId === 'string' ? meta.teamId : '';

  return (
    <TaskStatusPropertyInput
      value={answer?.status || ''}
      meta={meta}
      onMetaChange={(nextMeta) => {
        setMeta(nextMeta);
        onChange(null);
      }}
      onValueChange={(status) => onChange(status ? { teamId, status } : null)}
    />
  );
};
