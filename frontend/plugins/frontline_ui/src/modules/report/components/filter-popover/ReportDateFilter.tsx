import {
  Button,
  CalendarTwoMonths,
  Dialog,
  RadioGroup,
  Tabs,
  ToggleGroup,
  cn,
} from 'erxes-ui';
import { useEffect, useId, useRef, useState } from 'react';
import { DateRange } from 'react-day-picker';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subYears,
  format,
} from 'date-fns';
import {
  MONTHS,
  QUARTERS,
} from 'erxes-ui/modules/filter/date-filter/constants/dateTypes';

export const REPORT_FIXED_DATES = [
  'today',
  'yesterday',
  'this-week',
  'last-week',
  'this-month',
  'last-month',
  'this-year',
  'last-year',
];

const getYearsArray = (startYearOffset: number, endYearOffset: number) => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - startYearOffset;
  const endYear = currentYear + endYearOffset;
  const yearsArray: number[] = [];
  for (let year = startYear; year <= endYear; year++) {
    yearsArray.push(year);
  }
  return yearsArray;
};

const getActiveTab = (date: string) => {
  if (MONTHS.some((month) => date.includes(month))) {
    return 'month';
  }
  if (/^\d{4}-y$/.test(date)) {
    return 'year';
  }
  return 'day';
};

const parseDateRangeFromString = (
  date?: string | null,
): { from: Date; to: Date } | undefined => {
  if (!date) return undefined;

  const today = new Date();

  const dateRanges: Record<string, { from: Date; to: Date }> = {
    today: {
      from: startOfDay(today),
      to: endOfDay(today),
    },
    yesterday: {
      from: startOfDay(subDays(today, 1)),
      to: endOfDay(subDays(today, 1)),
    },
    'this-week': {
      from: startOfWeek(today, { weekStartsOn: 1 }),
      to: endOfWeek(today, { weekStartsOn: 1 }),
    },
    'last-week': {
      from: startOfWeek(subDays(today, 7), { weekStartsOn: 1 }),
      to: endOfWeek(subDays(today, 7), { weekStartsOn: 1 }),
    },
    'this-month': {
      from: startOfMonth(today),
      to: endOfMonth(today),
    },
    'last-month': {
      from: startOfMonth(subMonths(today, 1)),
      to: endOfMonth(subMonths(today, 1)),
    },
    'this-year': {
      from: startOfYear(today),
      to: endOfYear(today),
    },
    'last-year': {
      from: startOfYear(subYears(today, 1)),
      to: endOfYear(subYears(today, 1)),
    },
  };

  if (dateRanges[date]) {
    return dateRanges[date];
  }

  if (MONTHS.some((month) => date.includes(month))) {
    const [year, month] = date.split('-');
    const monthIndex = MONTHS.indexOf(month);
    return {
      from: startOfDay(new Date(Number.parseInt(year), monthIndex, 1)),
      to: endOfDay(new Date(Number.parseInt(year), monthIndex + 1, 0)),
    };
  }

  // Quarter format: YYYY-quarterN
  if (date.includes('quarter')) {
    const [year] = date.split('-');
    const quarterNumber = Number.parseInt(date.split('quarter')[1]);
    return {
      from: startOfDay(
        new Date(Number.parseInt(year), (quarterNumber - 1) * 3, 1),
      ),
      to: endOfDay(new Date(Number.parseInt(year), quarterNumber * 3, 0)),
    };
  }

  // Half year format: YYYY-halfN
  if (date.includes('half')) {
    const [year] = date.split('-');
    const halfNumber = Number.parseInt(date.split('half')[1]);
    return {
      from: startOfDay(
        new Date(Number.parseInt(year), (halfNumber - 1) * 6, 1),
      ),
      to: endOfDay(new Date(Number.parseInt(year), halfNumber * 6, 0)),
    };
  }

  // Year format: YYYY-y
  if (/^\d{4}-y$/.test(date)) {
    const year = Number.parseInt(date);
    return {
      from: startOfDay(new Date(year, 0, 1)),
      to: endOfDay(new Date(year, 11, 31)),
    };
  }

  if (date.includes(',')) {
    const [from, to] = date.split(',');
    return {
      from: startOfDay(new Date(from)),
      to: endOfDay(new Date(to)),
    };
  }

  return undefined;
};

export const ReportDateFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [tabs, setTabs] = useState('day');
  const [currentDateRange, setCurrentDateRange] = useState<
    DateRange | undefined
  >(parseDateRangeFromString(value || ''));
  const [currentValue, setCurrentValue] = useState<string | null>(value);

  useEffect(() => {
    if (value) {
      setTabs(getActiveTab(value));
      setCurrentDateRange(parseDateRangeFromString(value || ''));
      setCurrentValue(value);
    }
  }, [value]);

  const handleCalendarChange = (val: DateRange | undefined) => {
    setCurrentDateRange(val);
    if (val?.from && val?.to) {
      setCurrentValue(val.from.toISOString() + ',' + val.to.toISOString());
    } else {
      setCurrentValue(null);
    }
  };

  const handleRadioGroupChange = (val: string) => {
    setCurrentValue(val);
  };

  const handleApply = () => {
    if (currentValue) {
      onChange(currentValue);
      const closeButton = document.querySelector('[data-dialog-close]');
      if (closeButton instanceof HTMLElement) {
        closeButton.click();
      }
    }
  };

  return (
    <Dialog.Content className="max-w-xl p-0">
      <Tabs value={tabs} onValueChange={setTabs}>
        <Dialog.Header className="p-6 space-y-3">
          <Dialog.Title className="text-sm capitalize">Date</Dialog.Title>
          <div>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={tabs}
              onValueChange={setTabs}
              className="inline-flex"
            >
              <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
              <ToggleGroup.Item value="month">Month</ToggleGroup.Item>
              <ToggleGroup.Item value="year">Year</ToggleGroup.Item>
            </ToggleGroup>
          </div>
        </Dialog.Header>
        <div className="border-y border-muted py-6 flex justify-center h-88 overflow-auto">
          <Tabs.Content value="day" className="self-center outline-hidden">
            <CalendarTwoMonths
              mode="range"
              numberOfMonths={2}
              showOutsideDays
              fixedWeeks
              autoFocus
              defaultMonth={
                currentDateRange?.from ? currentDateRange.from : undefined
              }
              selected={currentDateRange}
              onSelect={handleCalendarChange}
            />
          </Tabs.Content>
          <Tabs.Content value="month" className="w-full outline-hidden">
            <DateFilterRadioGroup
              items={MONTHS}
              onValueChange={handleRadioGroupChange}
              value={currentValue}
              className="grid grid-cols-2"
            />
          </Tabs.Content>
          <Tabs.Content value="year" className="w-full outline-hidden">
            <DateFilterRadioGroup
              className="flex flex-col"
              onValueChange={handleRadioGroupChange}
              value={currentValue}
            />
          </Tabs.Content>
        </div>
        <Dialog.Footer className="p-6">
          <Dialog.Close asChild>
            <Button variant="ghost" size="lg" data-dialog-close>
              Cancel
            </Button>
          </Dialog.Close>
          <Button size="lg" disabled={!currentValue} onClick={handleApply}>
            Apply
          </Button>
        </Dialog.Footer>
      </Tabs>
    </Dialog.Content>
  );
};

const DateFilterRadioGroup = ({
  items,
  className,
  value,
  onValueChange,
}: {
  items?: string[];
  className: string;
  value: string | null;
  onValueChange?: (value: string) => void;
}) => {
  const id = useId();

  return (
    <RadioGroup asChild value={value || ''} onValueChange={onValueChange}>
      <fieldset className={cn('gap-6 w-full px-6 pb-6', className)}>
        {getYearsArray(7, 5).map((year) =>
          items ? (
            <div className="flex flex-col gap-3" key={year}>
              <legend className="font-semibold text-sm leading-none">
                {year}
              </legend>
              <div
                className={cn(
                  'grid gap-1',
                  items.length === 12 && 'grid-cols-3',
                  items.length === 2 && 'grid-cols-2',
                  items.length === 4 && 'grid-cols-4',
                )}
              >
                {items.map((item) => (
                  <DateFilterRadioGroupItem
                    id={id}
                    value={year + '-' + item}
                    key={item}
                    currentValue={value}
                  >
                    {item.split('-').join(' ')}
                  </DateFilterRadioGroupItem>
                ))}
              </div>
            </div>
          ) : (
            <DateFilterRadioGroupItem
              id={id}
              value={year + '-y'}
              key={year}
              currentValue={value}
            >
              {year}
            </DateFilterRadioGroupItem>
          ),
        )}
      </fieldset>
    </RadioGroup>
  );
};

const DateFilterRadioGroupItem = ({
  id,
  value,
  children,
  currentValue,
}: {
  id: string;
  value: string;
  children: React.ReactNode;
  currentValue: string | null;
}) => {
  const ref = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (currentValue === value && ref.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'instant', block: 'center' });
      }, 100);
    }
  }, [value, currentValue]);

  return (
    <Button
      variant="secondary"
      className="shadow-none has-data-[state=checked]:border-ring has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground has-focus-visible:outline-solid has-focus-visible:outline-2 has-focus-visible:outline-ring/70 capitalize"
      onClick={() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }}
      asChild
    >
      <label ref={ref} id={`${id}-${value}`}>
        <RadioGroup.Item
          value={value}
          id={`${id}-${value}`}
          className="sr-only after:absolute after:inset-0"
        />
        {children}
      </label>
    </Button>
  );
};

export const getReportDisplayValue = (value: string) => {
  if (value === 'today') {
    return 'Today';
  }
  if (value === 'yesterday') {
    return 'Yesterday';
  }
  if (value === 'this-week') {
    return 'This week';
  }
  if (value === 'last-week') {
    return 'Last week';
  }
  if (value === 'this-month') {
    return 'This month';
  }
  if (value === 'last-month') {
    return 'Last month';
  }
  if (value === 'this-year') {
    return 'This year';
  }
  if (value === 'last-year') {
    return 'Last year';
  }

  if (MONTHS.some((month) => value.includes(month))) {
    return value;
  }

  if (value.includes('quarter')) {
    const [year] = value.split('-');
    const quarterNumber = Number.parseInt(value.split('quarter')[1]);
    return `${year} Q${quarterNumber}`;
  }

  if (value.includes('half')) {
    const [year] = value.split('-');
    const halfNumber = Number.parseInt(value.split('half')[1]);
    return `${year} H${halfNumber}`;
  }

  if (/^\d{4}-y$/.test(value)) {
    return value.replace('-y', '');
  }

  if (value.includes(',')) {
    const [from, to] = value.split(',');
    return `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`;
  }

  return 'Unknown';
};
