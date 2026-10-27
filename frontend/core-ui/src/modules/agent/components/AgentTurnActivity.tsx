import { IconChevronRight } from '@tabler/icons-react';
import { Collapsible, cn } from 'erxes-ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  formatAgentDuration,
  type IAgentTimelineSection,
  type IAgentTurnLayout,
} from '../utils/agentTurnTimeline';
import { agentStepLabel } from '../utils/agentWorkSteps';
import { AgentStepRow } from './AgentStepRow';
import {
  AGENT_SHIMMER_TEXT_CLASS,
  AgentThinkingBlock,
} from './AgentThinkingBlock';
import { TextWithAgentReferences } from './TextWithAgentReferences';

/**
 * The header label replaces itself in place: the outgoing text slides up
 * and fades while the new one rises in. Reduced-motion users get an
 * instant swap (no animation, the outgoing copy is hidden).
 */
const ActivityLabel = ({ label, live }: { label: string; live: boolean }) => {
  const [previous, setPrevious] = useState<string | null>(null);
  const currentRef = useRef(label);

  useEffect(() => {
    if (currentRef.current !== label) {
      setPrevious(currentRef.current);
      currentRef.current = label;
    }
  }, [label]);

  return (
    <span className="grid min-w-0 overflow-hidden">
      {previous !== null && previous !== label && (
        <span
          key={`previous-${previous}`}
          aria-hidden
          className="agent-activity-exit col-start-1 row-start-1 min-w-0 truncate motion-reduce:hidden"
          onAnimationEnd={() => setPrevious(null)}
        >
          {previous}
        </span>
      )}
      <span
        key={label}
        className="agent-activity-enter col-start-1 row-start-1 min-w-0 truncate"
      >
        <span className={cn(live && AGENT_SHIMMER_TEXT_CLASS)}>{label}</span>
      </span>
    </span>
  );
};

/** Vertical run history: narration titles on a thin rail, steps beneath. */
const AgentTurnTimeline = ({
  sections,
  streaming,
  activeIndex,
}: {
  sections: IAgentTimelineSection[];
  streaming: boolean;
  activeIndex: number;
}) => (
  <ol className="ml-1.5 mt-1 space-y-2 border-l border-border/70 pb-1 pl-3.5">
    {sections.map((section, sectionIndex) => (
      <li key={section.key} className="relative min-w-0">
        {section.title && (
          <>
            <span
              aria-hidden
              className={cn(
                'absolute -left-[18px] top-[7px] size-[7px] rounded-full border border-border bg-background',
                streaming &&
                  sectionIndex === sections.length - 1 &&
                  'border-primary bg-primary motion-safe:animate-pulse',
              )}
            />
            <p className="break-words px-1 text-xs leading-5 text-foreground/80">
              <TextWithAgentReferences text={section.title} />
            </p>
          </>
        )}
        {section.steps.length > 0 && (
          <ul className="space-y-0.5">
            {section.steps.map((entry) => (
              <li key={entry.key}>
                {entry.step.kind === 'reasoning' ? (
                  <AgentThinkingBlock
                    text={entry.step.text}
                    live={streaming && entry.index === activeIndex}
                  />
                ) : (
                  <AgentStepRow
                    step={entry.step}
                    lookups={entry.lookups}
                    streaming={streaming}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ol>
);

export interface IAgentTurnActivityProps {
  layout: IAgentTurnLayout;
  /** True while this turn's run is in flight. */
  streaming: boolean;
  /** Live status label (`agentTurnActivity`) while streaming. */
  activity: string;
  /** Measured working time, when this session watched the run. */
  durationMs?: number;
  /** Shown before the header on the same row (the turn's avatar). */
  leading?: ReactNode;
}

/**
 * One collapsible activity header per assistant turn. While the run is in
 * flight it shows a shimmering label for what the agent is doing now; once
 * settled it summarizes the run. Expanding reveals the narration/step
 * timeline. The Bloub identity owns the screen-reader status, so this
 * header adds no second live region.
 */
export const AgentTurnActivity = ({
  layout,
  streaming,
  activity,
  durationMs,
  leading,
}: IAgentTurnActivityProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const [open, setOpen] = useState(false);

  if (layout.sections.length === 0) {
    return null;
  }

  const summary = (): string => {
    const { toolCount } = layout;
    const pieces: string[] = [];

    if (durationMs !== undefined) {
      const duration = formatAgentDuration(durationMs);
      pieces.push(
        toolCount > 0
          ? t('worked-for', {
              duration,
              defaultValue: 'Worked for {{duration}}',
            })
          : t('thought-for', {
              duration,
              defaultValue: 'Thought for {{duration}}',
            }),
      );
    }

    if (toolCount === 1 && durationMs === undefined) {
      const tool = layout.sections
        .flatMap((section) => section.steps)
        .find((entry) => entry.step.kind === 'tool');

      if (tool) {
        pieces.push(
          agentStepLabel(tool.step, (key, defaultValue) =>
            t(key, defaultValue),
          ),
        );
      }
    } else if (toolCount > 0) {
      pieces.push(
        t('step-count', {
          count: toolCount,
          defaultValue: '{{count}} steps',
        }),
      );
    }

    return pieces.length ? pieces.join(' · ') : t('thought', 'Thought');
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn('min-w-0', leading ? 'mb-3' : 'mb-2')}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {leading}
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="flex min-w-0 max-w-full items-center gap-1 rounded-md py-1 pr-1 text-left text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ActivityLabel
              label={streaming ? activity : summary()}
              live={streaming}
            />
            <IconChevronRight
              className={cn(
                'size-3.5 shrink-0 transition-transform motion-reduce:transition-none',
                open && 'rotate-90',
              )}
            />
          </button>
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content className="agent-timeline-content">
        <AgentTurnTimeline
          sections={layout.sections}
          streaming={streaming}
          activeIndex={layout.activeIndex}
        />
      </Collapsible.Content>
    </Collapsible>
  );
};
