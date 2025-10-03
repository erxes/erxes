import * as React from 'react';
import { DayFlag, DayPicker, SelectionState, UI } from 'react-day-picker';

import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
} from '@tabler/icons-react';

import { buttonVariants } from './button';
import { cn } from '../lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// Common classNames for both calendar variants
const getBaseClassNames = (customClassNames = {}) => ({
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

export const Calendar = React.forwardRef<React.JSX.Element, CalendarProps>(
  ({ className, classNames, showOutsideDays, ...props }, ref) => {
    return (
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn('p-3', className)}
        classNames={getBaseClassNames({
          [UI.Months]: 'relative',
          [UI.Month]: 'space-y-4 ml-0',
          [UI.MonthCaption]: 'flex justify-center items-center h-7',
          [UI.PreviousMonthButton]: cn(
            buttonVariants({ variant: 'outline' }),
            'absolute left-1 top-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          ),
          [UI.NextMonthButton]: cn(
            buttonVariants({ variant: 'outline' }),
            'absolute right-1 top-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          ),
          [UI.Weekdays]: 'flex',
          [UI.Weekday]:
            'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
          [UI.Week]: 'flex w-full mt-2 gap-1',
          ...classNames,
        })}
        components={{
          Chevron: ({ ...props }) => <Chevron {...props} />,
        }}
        {...props}
      />
    );
  },
);

export const CalendarTwoMonths = React.forwardRef<
  React.JSX.Element,
  CalendarProps
>(({ className, classNames, showOutsideDays, ...props }, ref) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(className)}
      classNames={getBaseClassNames({
        [UI.Months]: 'relative inline-flex',
        [UI.Month]:
          'space-y-4 ml-0 first-of-type:mr-12 first-of-type:relative first-of-type:after:absolute first-of-type:after:w-px first-of-type:after:h-auto first-of-type:after:inset-y-0 first-of-type:after:-right-6 first-of-type:after:bg-muted',
        [UI.MonthCaption]: 'flex items-center h-7',
        [UI.PreviousMonthButton]: cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-10 top-0 h-7 w-7 bg-muted p-0 opacity-80 hover:opacity-100',
        ),
        [UI.NextMonthButton]: cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-1 top-0 h-7 w-7 bg-muted p-0 opacity-80 hover:opacity-100',
        ),
        [UI.Weekdays]: 'flex w-full border-b border-muted',
        [UI.Weekday]:
          'text-muted-foreground rounded-md w-8 h-6 font-normal text-[0.8rem]',
        [UI.Week]: 'flex w-full mt-0.5',
        ...classNames,
      })}
      components={{
        Chevron: ({ ...props }) => <Chevron {...props} />,
      }}
      numberOfMonths={2}
      {...props}
    />
  );
});

const Chevron = ({ orientation = 'left' }) => {
  switch (orientation) {
    case 'left':
      return <IconChevronLeft className="h-4 w-4" />;
    case 'right':
      return <IconChevronRight className="h-4 w-4" />;
    case 'up':
      return <IconChevronUp className="h-4 w-4" />;
    case 'down':
      return <IconChevronDown className="h-4 w-4" />;
    default:
      return null;
  }
};
