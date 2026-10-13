import { cn, Input, Popover, RecordTableInlineCell } from 'erxes-ui';
import { useState } from 'react';

// Reads as text like a record table cell; clicking opens an input over it.
export const InlineInputCell = ({
  value,
  onChange,
  type = 'text',
  placeholder,
  suffix,
  invalid,
}: {
  value?: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  suffix?: string;
  invalid?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const filled = value !== undefined && value !== '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger
        className={cn(invalid && 'ring-1 ring-inset ring-destructive')}
      >
        {filled ? (
          <span className="truncate">
            {type === 'number' ? Number(value).toLocaleString() : value}
            {suffix && (
              <span className="ml-1 text-muted-foreground">{suffix}</span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder || '—'}</span>
        )}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="min-w-40">
        <Input
          autoFocus
          type={type}
          step={type === 'number' ? 'any' : undefined}
          className="h-8 border-0 shadow-none focus-visible:ring-0"
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === 'Escape') {
              // Enter must not submit the campaign form.
              event.preventDefault();
              setOpen(false);
            }
          }}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};
