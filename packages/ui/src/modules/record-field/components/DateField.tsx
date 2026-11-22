import { parseISO } from 'date-fns';
import { DatePicker } from 'erxes-ui/components/date-picker';
import { toIsoDay, useFormat } from 'erxes-ui/lib/format';
import { PopoverScoped } from 'erxes-ui/modules/hotkey/components/PopoverScoped';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table/components/RecordTableCellInline';
import React, { use, useId, useState } from 'react';

type DateFieldProps = Omit<React.ComponentProps<typeof RecordTableInlineCell.Trigger>, 'value'> & {
  /** The saved day, `YYYY-MM-DD`. */
  value: string | null;
  /** The first day the calendar offers, `YYYY-MM-DD`. */
  min?: string;
  /** The last day the calendar offers, `YYYY-MM-DD`. */
  max?: string;
  placeholder?: string;
  scope?: string;
  onSave: (value: string | null) => void;
};

/**
 * What names the field, always with the day it shows. In a table column or panel row the row's
 * label does, so its own aria-label is left out; on its own, its aria-label then the day.
 */
const useDateName = ({
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
}: Pick<DateFieldProps, 'id' | 'aria-label' | 'aria-labelledby'>) => {
  const ownId = useId();
  const dayId = useId();
  const controlId = id ?? ownId;
  const inRow = use(RecordTableInlineCell.LabelledBy) !== undefined;

  if (labelledBy) return { dayId, trigger: {} };

  if (inRow) return { dayId, trigger: { id: controlId, 'aria-label': undefined } };

  return {
    dayId,
    trigger: ariaLabel ? { id: controlId, 'aria-labelledby': `${controlId} ${dayId}` } : {},
  };
};

/**
 * A day in a table cell or panel row, edited in a popover with a calendar.
 * The popover opens on a typed date and the calendar at once; picking or typing a day saves it
 * through `onSave` and closes it. `min` and `max` bound the days it offers.
 */
export const DateField = ({
  ref,
  value,
  min,
  max,
  placeholder,
  scope,
  onSave,
  variant = 'input',
  children,
  ...props
}: DateFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const fmt = useFormat();
  const name = useDateName(props);

  return (
    <PopoverScoped modal={false} scope={scope} open={isOpen} onOpenChange={setIsOpen}>
      <RecordTableInlineCell.Trigger
        variant={variant}
        empty={!value}
        {...props}
        {...name.trigger}
        ref={ref}
      >
        {children}
        <span id={name.dayId} className="truncate">
          {value ? fmt.date(value) : placeholder}
        </span>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-auto">
        {/* It opens on the saved day's month. */}
        <DatePicker
          inline
          value={value}
          minDate={min ? parseISO(min) : undefined}
          maxDate={max ? parseISO(max) : undefined}
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
