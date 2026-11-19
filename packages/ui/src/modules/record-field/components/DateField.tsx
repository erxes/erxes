import { DatePicker } from 'erxes-ui/components/date-picker';
import { toIsoDay, useFormat } from 'erxes-ui/lib/format';
import { PopoverScoped } from 'erxes-ui/modules/hotkey/components/PopoverScoped';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table/components/RecordTableCellInline';
import React, { useState } from 'react';

type DateFieldProps = Omit<React.ComponentProps<typeof RecordTableInlineCell.Trigger>, 'value'> & {
  /** The saved day, `YYYY-MM-DD`. */
  value: string | null;
  placeholder?: string;
  scope?: string;
  onSave: (value: string | null) => void;
};

/**
 * A day in a table cell or panel row, edited in a popover with a calendar.
 * The popover opens on a typed date and the calendar at once; picking or typing a day saves it
 * through `onSave` and closes it.
 */
export const DateField = ({
  ref,
  value,
  placeholder,
  scope,
  onSave,
  variant = 'input',
  children,
  ...props
}: DateFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const fmt = useFormat();

  return (
    <PopoverScoped modal={false} scope={scope} open={isOpen} onOpenChange={setIsOpen}>
      <RecordTableInlineCell.Trigger variant={variant} empty={!value} {...props} ref={ref}>
        {children}
        <span className="truncate">{value ? fmt.date(value) : placeholder}</span>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-auto">
        {/* It opens on the saved day's month. */}
        <DatePicker
          inline
          value={value}
          onChange={(date) => {
            const next = date instanceof Date ? toIsoDay(date) : null;

            if (next !== value) onSave(next);
            setIsOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
