import { useEffect, useRef, useState } from 'react';
import { IconChevronRight, IconSparkles } from '@tabler/icons-react';

// Each reasoning burst is its own section, rendered in chronological order with
// the tool calls. Live (still reasoning): shows the TAIL of the current thought
// with no scrollbox. Finished: collapses to a one-line row; expanding prints
// the full thought at natural height.
export const ThinkingSection = ({
  text,
  live,
}: {
  text: string;
  live?: boolean;
}) => {
  // Live bursts start open so the streaming thought is visible, but the user
  // can collapse them; finished bursts start collapsed. When a live burst
  // finishes it folds back to the one-line row.
  const [expanded, setExpanded] = useState(!!live);
  const wasLive = useRef(!!live);

  useEffect(() => {
    if (wasLive.current && !live) setExpanded(false);
    wasLive.current = !!live;
  }, [live]);

  const tail = live && text.length > 280 ? '…' + text.slice(-280) : text;

  return (
    <div
      className={`ea-pop rounded-xl border overflow-hidden transition-colors ${
        live
          ? 'border-primary/20 bg-primary/4'
          : 'border-border/60 bg-background/40 hover:border-border'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
          live ? '' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <IconChevronRight
          className={`size-3.5 shrink-0 transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          } ${live ? 'text-primary' : ''}`}
        />
        <IconSparkles
          className={`size-3.5 shrink-0 ${
            live ? 'text-primary animate-pulse' : ''
          }`}
        />
        {live ? (
          <span className="ea-shimmer-text font-medium">Thinking…</span>
        ) : (
          <span>Thought process</span>
        )}
      </button>
      {expanded && (
        <div className="ea-expand px-3 pb-2.5">
          <p
            className={`text-xs whitespace-pre-wrap leading-relaxed ${
              live ? 'text-muted-foreground/80' : 'text-muted-foreground'
            }`}
          >
            {tail}
          </p>
        </div>
      )}
    </div>
  );
};
