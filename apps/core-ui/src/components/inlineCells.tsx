import { DatePicker, PopoverScoped, RecordTableInlineCell } from 'erxes-ui';
import { useState } from 'react';

/** `YYYY-MM-DD` of a local date. */
export const toYmd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** A `YYYY-MM-DD` date as people read it; a date-time without a zone parses as local time. */
const formatYmd = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

/** A date (`YYYY-MM-DD`) edited in place with a calendar. */
export const DateInlineCell = ({
  value,
  scope,
  onSave,
}: {
  value: string | null;
  scope: string;
  onSave: (value: string | null) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        {value ? formatYmd(value) : <span className="text-muted-foreground" />}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-auto p-0">
        <DatePicker
          inline
          value={value}
          defaultMonth={value ? new Date(value) : undefined}
          onChange={(date) => {
            const next = date instanceof Date ? toYmd(date) : null;

            if (next !== value) onSave(next);
            setOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
