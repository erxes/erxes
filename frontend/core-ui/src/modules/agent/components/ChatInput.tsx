import { useEffect, useRef, type KeyboardEvent } from 'react';

export interface IChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Height (px) the field grows to before it scrolls internally. */
  maxHeight?: number;
  /** Minimum height (px) — the field starts this tall instead of one row. */
  minHeight?: number;
  ariaLabel?: string;
  className?: string;
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
  placeholder,
  disabled = false,
  maxHeight = 168,
  minHeight = 20,
  ariaLabel,
  className,
}: IChatInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const node = inputRef.current;

    if (!node) {
      return;
    }

    const resize = () => {
      // Hidden panels report zero; always keep one usable line, then measure
      // again when the panel becomes visible or its width changes.
      node.style.height = 'auto';
      const height = Math.max(minHeight, node.scrollHeight);
      node.style.height = `${Math.min(height, maxHeight)}px`;
      node.style.overflowY = height > maxHeight ? 'auto' : 'hidden';
    };
    resize();
    if (typeof ResizeObserver === 'undefined') return;
    let width = node.getBoundingClientRect().width;
    let frame = 0;
    // Resizing inside the callback changes the observed node again in the
    // same frame (a ResizeObserver loop); wait for the next one.
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width !== width) {
        width = entry.contentRect.width;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(resize);
      }
    });
    observer.observe(node);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [value, maxHeight, minHeight]);

  return (
    <textarea
      ref={inputRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
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
