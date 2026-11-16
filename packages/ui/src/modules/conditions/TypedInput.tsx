import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '../../components/input';

/** How long typing waits before the filter follows it. */
const TYPING_MS = 250;

/**
 * A box whose text reaches `onCommit` once typing pauses (no request per keystroke), at once on
 * Enter (then `onEnter`), and when it closes mid-word. `initial` is its first text. With
 * `focusOnMount` it takes the keyboard as it shows, being the editor a menu just opened.
 */
export const TypedInput = ({
  initial,
  onCommit,
  onEnter,
  focusOnMount,
  ...props
}: Omit<
  ComponentProps<typeof Input>,
  'value' | 'onChange' | 'onKeyDown' | 'defaultValue' | 'ref'
> & {
  initial: string;
  onCommit: (text: string) => void;
  onEnter?: () => void;
  focusOnMount?: boolean;
}) => {
  const [text, setText] = useState(initial);
  const input = useRef<HTMLInputElement>(null);
  const debounced = useDebouncedCallback(onCommit, TYPING_MS);

  useEffect(() => {
    if (focusOnMount) input.current?.focus();
  }, [focusOnMount]);

  useEffect(() => () => debounced.flush(), [debounced]);

  return (
    <Input
      {...props}
      ref={input}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        debounced(event.target.value);
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') return;

        debounced.flush();
        onEnter?.();
      }}
    />
  );
};
