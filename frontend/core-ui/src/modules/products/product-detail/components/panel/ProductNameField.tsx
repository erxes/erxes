import { cn, Textarea } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';

/**
 * The product's name as a panel cell that wraps: a long name shows in full
 * over as many lines as it needs. Saved when left (Enter leaves it); an
 * emptied name puts the saved one back.
 */
export const ProductNameField = ({
  value,
  placeholder,
  autoFocus,
  onSave,
}: {
  value: string;
  placeholder: string;
  autoFocus?: boolean;
  onSave: (name: string) => void;
}) => {
  const [name, setName] = useState(value);
  // Escape leaves without saving what was typed.
  const discard = useRef(false);

  useEffect(() => setName(value), [value]);

  const commit = () => {
    if (discard.current) {
      discard.current = false;
      setName(value);
      return;
    }
    const next = name.trim();
    if (!next) {
      setName(value);
      return;
    }
    if (next !== value) onSave(next);
  };

  return (
    <Textarea
      value={name}
      rows={1}
      autoFocus={autoFocus}
      placeholder={placeholder}
      className={cn(
        // 28px like the other cells: 6px above and below a 16px line.
        'field-sizing-content min-h-7 resize-none rounded-sm px-2 py-1.5 text-xs leading-4 font-medium shadow-none hover:bg-accent focus-visible:bg-background md:text-xs',
        'placeholder:font-normal placeholder:text-accent-foreground',
      )}
      onChange={(event) => setName(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          discard.current = true;
          event.currentTarget.blur();
        }
      }}
    />
  );
};
