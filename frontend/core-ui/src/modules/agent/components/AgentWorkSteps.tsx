import { IconChevronRight } from '@tabler/icons-react';
import { Collapsible, cn } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { TAgentWorkStep } from '../utils/agentWorkSteps';
import {
  activeAgentStepLabel,
  agentStepLabel,
} from '../utils/agentWorkSteps';
import { AgentStepRow } from './AgentStepRow';
import { BotBadge } from './BotBadge';

/**
 * Shimmer line for the live state, in the spirit of Twenty's
 * `ShimmeringText`: the label slides a highlight across itself while a
 * turn is still running.
 */
const ShimmerText = ({ text }: { text: string }) => (
  <span
    className={cn(
      'inline-block bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground',
      'bg-[length:200%_100%] bg-clip-text text-transparent motion-safe:animate-text-shimmer',
    )}
  >
    {text}
  </span>
);

export interface IAgentWorkStepsProps {
  steps: TAgentWorkStep[];
  /** True while the owning assistant message is still streaming. */
  streaming: boolean;
}

/**
 * Collapsible grouping of one run's reasoning + tool calls, matching the
 * Twenty assistant transcript: while the model works it shows a shimmering
 * "Working…" with the current step; when settled it folds into "N steps"
 * that expands into per-step rows.
 */
export const AgentWorkSteps = ({
  steps,
  streaming,
}: IAgentWorkStepsProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const [open, setOpen] = useState(false);

  if (steps.length === 0) {
    return null;
  }

  const activeLabel = streaming ? activeAgentStepLabel(steps) : undefined;
  const settledSummary =
    steps.length === 1
      ? agentStepLabel(steps[0])
      : t('step-count', { count: steps.length, defaultValue: '{{count}} steps' });
  const summary = streaming
    ? activeLabel ?? t('working', 'Working…')
    : settledSummary;

  // Orbit while a tool call is gathering input, plain thinking dots
  // otherwise — same rule the tray's director uses.
  const lastStep = steps[steps.length - 1];
  const toolRunning =
    lastStep?.kind === 'tool' &&
    (lastStep.tool.state === 'input-streaming' ||
      lastStep.tool.state === 'input-available');
  const botState = toolRunning ? 'orbit' : 'thinking';

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
            {streaming && <BotBadge size={16} state={botState} />}
            <span className="min-w-0 flex-1 truncate">
              {streaming ? <ShimmerText text={summary} /> : summary}
            </span>
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
