import { DatePicker, PopoverScoped, RecordTableInlineCell, toIsoDay, useFormat } from 'erxes-ui';
import { useState } from 'react';

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
  const fmt = useFormat();

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        {value ? fmt.date(value) : <span className="text-muted-foreground" />}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-auto">
        <DatePicker
          inline
          value={value}
          defaultMonth={value ? new Date(value) : undefined}
          onChange={(date) => {
            const next = date instanceof Date ? toIsoDay(date) : null;

            if (next !== value) onSave(next);
            setOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
