import {
  Button,
  CalendarTwoMonths,
  Dialog,
  RadioGroup,
  Tabs,
  ToggleGroup,
} from 'erxes-ui/components';
import { useEffect, useId, useRef, useState } from 'react';
import { getActiveTab } from '../utils/getActiveTab';
import { parseDateRangeFromString } from '../utils/parseDateRangeFromString';
import { DateRange } from 'react-day-picker';
import { useFilterContext } from 'erxes-ui/modules';
import { getYearsArray } from '../utils/getYears';
import { cn } from 'erxes-ui/lib';
import { MONTHS, QUARTERS } from '../constants/dateTypes';
import { useFilterQueryState } from '../../hooks/useFilterQueryState';

export const FilterDialogDateView = ({ filterKey }: { filterKey: string }) => {
  const { sessionKey } = useFilterContext();
  const [tabs, setTabs] = useState('day');
  const [value, setValue] = useFilterQueryState<string>(filterKey, sessionKey);
  const { resetFilterState } = useFilterContext();
  const [currentDateRange, setCurrentDateRange] = useState<
    DateRange | undefined
  >(parseDateRangeFromString(value || ''));
  const [currentValue, setCurrentValue] = useState<string | null>(value);

  useEffect(() => {
    if (value) {
      setTabs(getActiveTab(value));
    }
  }, [value]);

  const handleCalendarChange = (value: DateRange | undefined) => {
    setCurrentDateRange(value);
    setCurrentValue(
      value?.from?.toISOString() + ',' + value?.to?.toISOString(),
    );
  };

  const handleRadioGroupChange = (value: string) => {
    setCurrentValue(value);
  };

  const handleApply = () => {
    if (currentValue) {
      setValue(currentValue);
      resetFilterState();
    }
  };

  return (
    <Dialog.Content className="max-w-xl p-0">
      <Tabs value={tabs} onValueChange={setTabs}>
        <Dialog.Header className="p-6 space-y-3">
          <Dialog.Title className="text-sm capitalize">
            {filterKey}
          </Dialog.Title>
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
              <ToggleGroup.Item value="quarter">Quarter</ToggleGroup.Item>
              <ToggleGroup.Item value="halfYear">Half Year</ToggleGroup.Item>
              <ToggleGroup.Item value="year">Year</ToggleGroup.Item>
            </ToggleGroup>
          </div>
        </Dialog.Header>
        <div className="border-y border-muted py-6 flex justify-center h-[22rem] overflow-auto">
          <Tabs.Content value="day" className="self-center outline-none">
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
          <Tabs.Content value="month" className="w-full outline-none">
            <DateFilterRadioGroup
              items={MONTHS}
              onValueChange={handleRadioGroupChange}
              value={currentValue}
              className="grid grid-cols-2"
            />
          </Tabs.Content>
          <Tabs.Content value="quarter" className="w-full outline-none">
            <DateFilterRadioGroup
              items={QUARTERS}
              className="flex flex-col"
              onValueChange={handleRadioGroupChange}
              value={currentValue}
            />
          </Tabs.Content>
          <Tabs.Content value="halfYear" className="w-full outline-none">
            <DateFilterRadioGroup
              items={['half-1', 'half-2']}
              className="flex flex-col"
              onValueChange={handleRadioGroupChange}
              value={currentValue}
            />
          </Tabs.Content>
          <Tabs.Content value="year" className="w-full outline-none">
            <DateFilterRadioGroup
              className="flex flex-col"
              onValueChange={handleRadioGroupChange}
              value={currentValue}
            />
          </Tabs.Content>
        </div>
        <Dialog.Footer className="p-6">
          <Dialog.Close asChild>
            <Button variant="ghost" size="lg">
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Button
      variant="secondary"
      className="shadow-none has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-primary has-[[data-state=checked]]:text-primary-foreground has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring/70 capitalize"
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
