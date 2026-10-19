import { IconChevronRight } from '@tabler/icons-react';
import { Collapsible, cn } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { TAgentWorkStep } from '../utils/agentWorkSteps';
import { agentStepLabel } from '../utils/agentWorkSteps';
import { AgentStepRow } from './AgentStepRow';

export interface IAgentWorkStepsProps {
  steps: TAgentWorkStep[];
  /** True while the owning assistant message is still streaming. */
  streaming: boolean;
}

/**
 * Expandable step history. Live activity belongs to the Bloub header;
 * this summary never creates a second live status or animated avatar.
 */
export const AgentWorkSteps = ({ steps, streaming }: IAgentWorkStepsProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const [open, setOpen] = useState(false);

  if (steps.length === 0) {
    return null;
  }

  const summary =
    !streaming && steps.length === 1
      ? agentStepLabel(steps[0])
      : t('step-count', {
          count: steps.length,
          defaultValue: '{{count}} steps',
        });

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="my-1.5 first:mt-0 last:mb-0"
    >
      <div className="min-w-0 text-foreground">
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="flex max-w-full items-center gap-1.5 rounded-md px-1 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IconChevronRight
              className={cn(
                'size-3 shrink-0 transition-transform motion-reduce:transition-none',
                open && 'rotate-90',
              )}
            />
            <span className="min-w-0 truncate">{summary}</span>
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content className="ml-2.5 mt-1 border-l pl-3 pb-1.5">
          <ul className="space-y-0.5">
            {steps.map((step, index) => (
              <li key={step.kind === 'tool' ? step.tool.toolCallId : index}>
                <AgentStepRow step={step} streaming={streaming} />
              </li>
            ))}
          </ul>
        </Collapsible.Content>
      </div>
    </Collapsible>
  );
};
