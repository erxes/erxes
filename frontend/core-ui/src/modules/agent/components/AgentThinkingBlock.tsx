import { IconBrain, IconChevronRight } from '@tabler/icons-react';
import { Collapsible, cn } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { reasoningHeading } from '../utils/agentTurnTimeline';

/** Live text sweep shared by the turn's status labels; static for reduced motion. */
export const AGENT_SHIMMER_TEXT_CLASS =
  'bg-[linear-gradient(90deg,var(--color-muted-foreground)_40%,var(--color-foreground)_50%,var(--color-muted-foreground)_60%)] bg-size-[300%_100%] bg-clip-text text-transparent motion-safe:animate-text-shimmer motion-reduce:text-muted-foreground';

const MAX_REASONING_LENGTH = 8000;

/** Reasoning paragraphs; bold summary titles keep their emphasis. */
const ReasoningText = ({ text }: { text: string }) => {
  const body =
    text.length > MAX_REASONING_LENGTH
      ? `${text.slice(0, MAX_REASONING_LENGTH)}\n…`
      : text;

  return (
    <>
      {body
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => {
          const heading = /^\*\*([^*\n]+)\*\*$/.exec(paragraph);

          return heading ? (
            <p key={index} className="font-medium text-foreground/70">
              {heading[1]}
            </p>
          ) : (
            <p key={index} className="whitespace-pre-wrap break-words">
              {paragraph.replace(/\*\*/g, '')}
            </p>
          );
        })}
    </>
  );
};

/**
 * Model reasoning inside the activity timeline: a muted, expandable
 * "Thinking" row whose label shimmers while this thought is streaming and
 * then settles to the reasoning summary title (or "Thought").
 */
export const AgentThinkingBlock = ({
  text,
  live,
}: {
  text: string;
  live: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const [open, setOpen] = useState(false);
  const heading = reasoningHeading(text);
  const label =
    heading ?? (live ? t('thinking', 'Thinking…') : t('thought', 'Thought'));
  const expandable = text.trim().length > 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild disabled={!expandable}>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-xs text-muted-foreground transition-colors hover:text-foreground disabled:hover:text-muted-foreground"
        >
          <IconBrain className="size-3.5 shrink-0" />
          <span
            className={cn(
              'min-w-0 flex-1 truncate',
              live && AGENT_SHIMMER_TEXT_CLASS,
            )}
          >
            {label}
          </span>
          {expandable && (
            <IconChevronRight
              className={cn(
                'size-3.5 shrink-0 transition-transform motion-reduce:transition-none',
                open && 'rotate-90',
              )}
            />
          )}
        </button>
      </Collapsible.Trigger>
      {expandable && (
        <Collapsible.Content className="pb-1 pl-6 pr-1">
          <div className="max-h-64 space-y-1.5 overflow-y-auto border-l border-dashed pl-2.5 text-[11px] leading-relaxed text-muted-foreground">
            <ReasoningText text={text} />
          </div>
        </Collapsible.Content>
      )}
    </Collapsible>
  );
};
