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
      <div className="rounded-lg bg-muted/30 text-foreground">
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="min-w-0 flex-1 truncate">{summary}</span>
            <IconChevronRight
              className={cn(
                'size-3.5 shrink-0 transition-transform',
                open && 'rotate-90',
              )}
            />
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content className="px-1.5 pb-1.5">
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
