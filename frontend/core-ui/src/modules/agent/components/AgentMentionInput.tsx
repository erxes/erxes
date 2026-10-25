import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import type { IAgentMentionsController } from '../hooks/useAgentMentions';
import {
  agentMentionIdentity,
  applyAgentMentionEdit,
  findAgentMentionQuery,
  insertAgentMention,
  removeAgentMentionAtCaret,
  type IAgentMention,
  type IAgentMentionText,
} from '../utils/mentionText';
import type {
  IAgentMentionAnchor,
  IAgentMentionPopupHandle,
} from './AgentMentionPopup';
import { ChatInput, type IChatInputProps } from './ChatInput';

// Search sources and the menu load on the first `@`, not with the composer.
const AgentMentionPopup = lazy(() =>
  import('./AgentMentionPopup').then((module) => ({
    default: module.AgentMentionPopup,
  })),
);

export interface IAgentMentionInputProps
  extends Omit<IChatInputProps, 'inputRef' | 'textareaProps'> {
  mentions: IAgentMentionsController;
  autoFocus?: boolean;
}

/** Textarea metrics the highlight mirror must share to line up exactly. */
const MIRRORED_STYLES = [
  'box-sizing',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'font-variant',
  'letter-spacing',
  'line-height',
  'text-transform',
  'text-indent',
  'word-spacing',
  'tab-size',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
];

const MENTION_PILL_CLASS =
  'rounded-full bg-muted shadow-[0_0_0_2px_var(--color-muted),0_0_0_3px_var(--color-border)]';

/**
 * The Assistant composer textarea with an @ mention layer. Mentions stay
 * ordinary `@Label` text in the textarea; a pointer-transparent mirror behind
 * it paints each mention as a pill, and the same mirror locates the caret for
 * the menu. Backspace/Delete remove a mention as one unit, and any other edit
 * inside it turns it back into plain text.
 */
export const AgentMentionInput = ({
  mentions,
  value,
  onChange,
  onKeyDown,
  disabled = false,
  autoFocus,
  ...inputProps
}: IAgentMentionInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<IAgentMentionPopupHandle>(null);
  const pendingCaret = useRef<number | null>(null);
  const [caret, setCaret] = useState<number | null>(null);
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<IAgentMentionAnchor | null>(null);
  const [activeOption, setActiveOption] = useState<string>();
  const listboxId = useId();
  const ranges = mentions.mentions;

  const active =
    caret !== null && !disabled
      ? findAgentMentionQuery(value, caret, ranges)
      : null;
  const query = active && active.start !== dismissedAt ? active : null;
  const mentioned = useMemo(
    () => new Set(ranges.map((range) => agentMentionIdentity(range.mention))),
    [ranges],
  );

  useEffect(() => {
    if (dismissedAt !== null && active?.start !== dismissedAt)
      setDismissedAt(null);
  }, [active?.start, dismissedAt]);

  const readCaret = () => {
    const node = textareaRef.current;
    if (!node || document.activeElement !== node) return null;
    return node.selectionStart === node.selectionEnd ? node.selectionEnd : null;
  };

  const apply = (next: IAgentMentionText & { caret: number }) => {
    mentions.commit({ value: next.value, mentions: next.mentions });
    pendingCaret.current = next.caret;
    setCaret(next.caret);
    onChange(next.value);
  };

  useLayoutEffect(() => {
    const node = textareaRef.current;
    const target = pendingCaret.current;
    if (!node || target === null || node.value !== value) return;
    pendingCaret.current = null;
    node.setSelectionRange(target, target);
  }, [value]);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const syncMirror = useCallback(() => {
    const node = textareaRef.current;
    const mirror = mirrorRef.current;
    if (!node || !mirror) return;
    const style = window.getComputedStyle(node);
    for (const property of MIRRORED_STYLES)
      mirror.style.setProperty(property, style.getPropertyValue(property));
    const borders =
      (parseFloat(style.borderLeftWidth) || 0) +
      (parseFloat(style.borderRightWidth) || 0);
    mirror.style.width = `${node.clientWidth + borders}px`;
    mirror.style.height = `${node.offsetHeight}px`;
    mirror.scrollTop = node.scrollTop;
    const marker = mirror.querySelector<HTMLElement>(
      '[data-agent-mention-anchor]',
    );
    setAnchor((current) => {
      if (!marker) return current === null ? current : null;
      const next = {
        left: marker.offsetLeft,
        top: marker.offsetTop - mirror.scrollTop,
        height: parseFloat(style.lineHeight) || marker.offsetHeight || 20,
      };
      return current &&
        current.left === next.left &&
        current.top === next.top &&
        current.height === next.height
        ? current
        : next;
    });
  }, []);

  useLayoutEffect(syncMirror);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(syncMirror);
    observer.observe(node);
    return () => observer.disconnect();
  }, [syncMirror]);

  const handleChange = (next: string) => {
    const nextCaret = textareaRef.current?.selectionEnd;
    mentions.commit({
      value: next,
      mentions: applyAgentMentionEdit(value, next, ranges, nextCaret),
    });
    setCaret(readCaret());
    onChange(next);
  };

  const pick = (mention: IAgentMention) => {
    if (!query || caret === null) return;
    apply(insertAgentMention(value, ranges, query, caret, mention));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (query && popupRef.current?.handleKeyDown(event)) return;
    const node = event.currentTarget;
    if (
      (event.key === 'Backspace' || event.key === 'Delete') &&
      node.selectionStart === node.selectionEnd &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.nativeEvent.isComposing
    ) {
      const removed = removeAgentMentionAtCaret(
        value,
        ranges,
        node.selectionEnd,
        event.key,
      );
      if (removed) {
        event.preventDefault();
        apply(removed);
        return;
      }
    }
    onKeyDown?.(event);
  };

  const dismiss = useCallback(() => {
    if (query) setDismissedAt(query.start);
  }, [query]);

  const mirrorContent: ReactNode[] = [];
  let cursor = 0;
  const marks = [
    ...ranges.map((range) => ({ start: range.start, end: range.end })),
    ...(query ? [{ start: query.start, end: query.start }] : []),
  ].sort((a, b) => a.start - b.start || a.end - b.end);
  for (const mark of marks) {
    mirrorContent.push(value.slice(cursor, mark.start));
    mirrorContent.push(
      mark.start === mark.end ? (
        <span key={`anchor-${mark.start}`} data-agent-mention-anchor="" />
      ) : (
        <span key={`mention-${mark.start}`} className={MENTION_PILL_CLASS}>
          {value.slice(mark.start, mark.end)}
        </span>
      ),
    );
    cursor = mark.end;
  }
  // A trailing newline still occupies a line in the textarea.
  mirrorContent.push(`${value.slice(cursor)}\u200b`);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        ref={mirrorRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 overflow-hidden whitespace-pre-wrap break-words text-transparent [overflow-wrap:break-word]"
        style={{ borderStyle: 'solid', borderColor: 'transparent' }}
      >
        {mirrorContent}
      </div>
      <ChatInput
        {...inputProps}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        inputRef={textareaRef}
        className={`relative block ${inputProps.className ?? ''}`}
        textareaProps={{
          'aria-autocomplete': 'list',
          'aria-controls': query ? listboxId : undefined,
          'aria-activedescendant': query ? activeOption : undefined,
          onSelect: () => setCaret(readCaret()),
          onFocus: () => setCaret(readCaret()),
          onBlur: () => setCaret(null),
          onScroll: syncMirror,
        }}
      />
      {query && anchor && (
        <Suspense fallback={null}>
          <AgentMentionPopup
            ref={popupRef}
            query={query}
            anchor={anchor}
            listboxId={listboxId}
            mentioned={mentioned}
            containerRef={wrapperRef}
            onPick={pick}
            onDismiss={dismiss}
            onActiveOptionChange={setActiveOption}
          />
        </Suspense>
      )}
    </div>
  );
};
