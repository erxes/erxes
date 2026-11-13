import { useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { Badge } from './badge';

/**
 * A list of short strings as removable badges. Enter or a comma adds the typed text,
 * Backspace in the empty input removes the last one, and pasted lines add one each.
 */
export function StringArrayInput({
  value,
  onValueChange,
  placeholder = 'Add a tag',
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = (texts: string[]) => {
    const next = [...new Set([...value, ...texts.map((text) => text.trim()).filter(Boolean)])];

    if (next.length !== value.length) onValueChange(next);
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add([draft]);
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      onValueChange(value.slice(0, -1));
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const lines = event.clipboardData.getData('text').split(/\r\n|\r|\n/);

    if (lines.length < 2) return;
    event.preventDefault();
    add(lines);
  };

  return (
    <div className="flex min-h-7 flex-wrap items-center gap-1 rounded-sm bg-background px-1 shadow-xs focus-within:shadow-focus">
      {value.map((text) => (
        <Badge
          key={text}
          variant="secondary"
          onClose={() => onValueChange(value.filter((item) => item !== text))}
        >
          {text}
        </Badge>
      ))}
      <input
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        className="h-7 min-w-20 flex-1 bg-transparent px-2 text-sm outline-hidden placeholder:text-accent-foreground"
      />
    </div>
  );
}
