import type { ComponentProps } from 'react';
import { setMonth, setYear, startOfMonth } from 'date-fns';
import type { ChevronProps, DropdownNavProps, DropdownProps } from 'react-day-picker';
import { DayFlag, DayPicker, SelectionState, UI, useDayPicker } from 'react-day-picker';

import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
} from '@tabler/icons-react';

import { buttonVariants } from './button';
import { Select } from './select';
import { cn } from '../lib/utils';

export type CalendarProps = ComponentProps<typeof DayPicker>;

// Common classNames for both calendar variants
const getBaseClassNames = (customClassNames: CalendarProps['classNames']) => ({
  [UI.CaptionLabel]: 'text-sm font-medium',
  [UI.MonthGrid]: 'w-full border-collapse space-y-1',
  [SelectionState.range_end]: 'day-range-end',
  [SelectionState.selected]:
    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
  [SelectionState.range_middle]:
    'aria-selected:bg-accent aria-selected:text-foreground aria-selected:rounded-none',
  [DayFlag.today]: 'bg-accent text-foreground',
  [DayFlag.outside]:
    'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
  [DayFlag.disabled]: 'text-muted-foreground opacity-50',
  [DayFlag.hidden]: 'invisible',
  [UI.Day]:
    'h-8 w-8 text-center rounded-md text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
  [UI.DayButton]: cn(
    buttonVariants({ variant: 'ghost' }),
    'h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-primary hover:text-primary-foreground',
  ),
  ...customClassNames,
});

const CHEVRONS = {
  left: IconChevronLeft,
  right: IconChevronRight,
  up: IconChevronUp,
  down: IconChevronDown,
};

const Chevron = ({ orientation = 'left' }: ChevronProps) => {
  const Icon = CHEVRONS[orientation];

  return <Icon className="h-4 w-4" />;
};

const DropdownNav = ({ children }: DropdownNavProps) => (
  <div className="flex w-full items-center gap-2 justify-center">{children}</div>
);

const SelectDropdown = ({
  value,
  options,
  onSelect,
}: Pick<DropdownProps, 'value' | 'options'> & { onSelect: (value: number) => void }) => (
  <Select value={String(value)} onValueChange={(next) => onSelect(Number(next))}>
    <Select.Trigger className="w-fit font-medium flex-none">
      <Select.Value className="gap-1" />
    </Select.Trigger>
    <Select.Content className="max-h-[min(26rem,var(--available-height))]">
      {options?.map((option) => (
        <Select.Item key={option.value} value={String(option.value)} disabled={option.disabled}>
          {option.label}
        </Select.Item>
      ))}
    </Select.Content>
  </Select>
);

/** Moves the calendar the way DayPicker's own month and year selects do. */
const useShownMonth = () => {
  const { months, goToMonth } = useDayPicker();
  const shown = months[0]?.date;

  return (change: (month: Date) => Date) => {
    if (shown) goToMonth(change(startOfMonth(shown)));
  };
};

const MonthsDropdown = ({ value, options }: DropdownProps) => {
  const moveTo = useShownMonth();

  return (
    <SelectDropdown
      value={value}
      options={options}
      onSelect={(month) => moveTo((date) => setMonth(date, month))}
    />
  );
};

const YearsDropdown = ({ value, options }: DropdownProps) => {
  const moveTo = useShownMonth();

  return (
    <SelectDropdown
      value={value}
      options={options}
      onSelect={(year) => moveTo((date) => setYear(date, year))}
    />
  );
};

// The year dropdown runs ten years ahead of the year the app loaded in.
const END_MONTH = new Date(new Date().getFullYear() + 10, 11);

const START_MONTH = new Date(1980, 6);

export const Calendar = ({ className, classNames, ...props }: CalendarProps) => (
  <DayPicker
    className={cn('p-3', className)}
    classNames={getBaseClassNames({
      [UI.Months]: 'relative',
      [UI.Month]: 'space-y-4 ml-0',
      [UI.MonthCaption]: 'flex justify-center items-center h-7',
      [UI.PreviousMonthButton]: cn(
        buttonVariants({ variant: 'secondary' }),
        'absolute left-0 top-0 size-7 p-0',
      ),
      [UI.NextMonthButton]: cn(
        buttonVariants({ variant: 'secondary' }),
        'absolute right-0 top-0 size-7 p-0',
      ),
      [UI.Weekdays]: 'flex',
      [UI.Weekday]: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
      [UI.Week]: 'flex w-full mt-2 gap-1',
      ...classNames,
    })}
    captionLayout="dropdown"
    startMonth={START_MONTH}
    endMonth={END_MONTH}
    components={{ DropdownNav, MonthsDropdown, YearsDropdown, Chevron }}
    {...props}
  />
);
