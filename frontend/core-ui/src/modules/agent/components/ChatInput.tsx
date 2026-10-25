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

  const resizeRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const node = inputRef.current;

    if (!node) {
      return;
    }

    // Hidden panels report zero; always keep one usable line, then measure
    // again when the panel becomes visible or its width changes. Resetting to
    // auto is only for measurement.
    resizeRef.current = () => {
      const previousOverflow = node.style.overflowY;
      node.style.height = 'auto';
      const contentHeight = Math.max(minHeight, node.scrollHeight);
      const nextOverflow = contentHeight > maxHeight ? 'auto' : 'hidden';
      node.style.height = `${Math.min(contentHeight, maxHeight)}px`;
      if (previousOverflow !== nextOverflow)
        node.style.overflowY = nextOverflow;
    };
    resizeRef.current();
  }, [value, maxHeight, minHeight]);

  // One observer for the field's lifetime. The mention mirror observes this
  // textarea too, so a width change remeasures on the next frame instead of
  // writing a height inside this callback.
  useEffect(() => {
    const node = inputRef.current;

    if (!node || typeof ResizeObserver === 'undefined') {
      return;
    }

    let frame = 0;
    let width = node.getBoundingClientRect().width;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry || entry.contentRect.width === width) return;
      width = entry.contentRect.width;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        resizeRef.current();
      });
    });
    observer.observe(node);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

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
