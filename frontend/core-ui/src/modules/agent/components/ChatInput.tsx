import {
  useCallback,
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
  type MutableRefObject,
  type TextareaHTMLAttributes,
} from 'react';

export type TChatInputTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  | 'value'
  | 'onChange'
  | 'onKeyDown'
  | 'onPaste'
  | 'placeholder'
  | 'disabled'
  | 'rows'
  | 'style'
  | 'className'
>;

export interface IChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste?: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Height (px) the field grows to before it scrolls internally. */
  maxHeight?: number;
  /** Minimum height (px) — the field starts this tall instead of one row. */
  minHeight?: number;
  ariaLabel?: string;
  className?: string;
  /** Receives the underlying textarea (caret-aware layers such as mentions). */
  inputRef?: MutableRefObject<HTMLTextAreaElement | null>;
  /** Extra textarea attributes/handlers (selection, focus, ARIA). */
  textareaProps?: TChatInputTextareaProps;
}

/**
 * Auto-growing chat input, deliberately NOT `erxes-ui`'s `Textarea`.
 *
 * The shared textarea ships a focus shadow and a fixed height, which in a chat
 * composer produced a bright focus ring inside the composer card plus native
 * scrollbar arrows on a one-line field. This one is chrome-free: it owns no
 * border, no ring and no background (the composer card draws those), and it is
 * exactly as tall as its content — the scrollbar only appears once the text
 * passes `maxHeight`.
 */
export const ChatInput = ({
  value,
  onChange,
  onKeyDown,
  onPaste,
  placeholder,
  disabled = false,
  maxHeight = 168,
  minHeight = 20,
  ariaLabel,
  className,
  inputRef: externalRef,
  textareaProps,
}: IChatInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      inputRef.current = node;
      if (externalRef) externalRef.current = node;
    },
    [externalRef],
  );

  useEffect(() => {
    const node = inputRef.current;

    if (!node) {
      return;
    }

    let frame = 0;
    const resize = () => {
      // Hidden panels report zero; always keep one usable line, then measure
      // again when the panel becomes visible or its width changes.
      // Resetting to auto is only for measurement. Restore it when the capped
      // height is already applied so an unchanged field does not restyle.
      const previousHeight = node.style.height;
      const previousOverflow = node.style.overflowY;
      node.style.height = 'auto';
      const contentHeight = Math.max(minHeight, node.scrollHeight);
      const nextHeight = `${Math.min(contentHeight, maxHeight)}px`;
      const nextOverflow = contentHeight > maxHeight ? 'auto' : 'hidden';
      node.style.height =
        previousHeight === nextHeight ? previousHeight : nextHeight;
      if (previousOverflow !== nextOverflow)
        node.style.overflowY = nextOverflow;
    };
    const schedule = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        resize();
      });
    };
    resize();
    if (typeof ResizeObserver === 'undefined') {
      return () => {
        if (frame) cancelAnimationFrame(frame);
      };
    }
    // The mention mirror observes this textarea too. A height write in this
    // callback leaves that observer a notification in the same frame.
    let width = node.getBoundingClientRect().width;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry || entry.contentRect.width === width) return;
      width = entry.contentRect.width;
      schedule();
    });
    observer.observe(node);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [value, maxHeight, minHeight]);

  return (
    <textarea
      {...textareaProps}
      ref={setRefs}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      style={minHeight ? { minHeight } : undefined}
      aria-label={ariaLabel}
      className={`w-full resize-none border-0 bg-transparent text-sm leading-5 text-foreground shadow-none outline-none ring-0 placeholder:text-muted-foreground/70 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 md:text-sm ${
        className ?? ''
      }`}
    />
  );
};
