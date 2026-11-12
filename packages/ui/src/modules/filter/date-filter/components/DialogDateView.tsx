import { Button } from 'erxes-ui/components/button';
import { CalendarTwoMonths } from 'erxes-ui/components/calendar';
import { Dialog } from 'erxes-ui/components/dialog';
import { Tabs } from 'erxes-ui/components/tabs';
import { ToggleGroup } from 'erxes-ui/components/toggle-group';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useFilterContext } from 'erxes-ui/modules/filter/hooks/useFilterContext';
import { MONTHS, QUARTERS } from '../constants/dateTypes';
import { getActiveTab } from '../utils/getActiveTab';
import { parseDateRangeFromString } from '../utils/parseDateRangeFromString';
import { useFilterQueryState } from '../../hooks/useFilterQueryState';
import { DateFilterRadioGroup } from './DateFilterRadioGroup';

type DateRangeDialogProps = {
  label: string;
  value?: string | null;
  onApply: (value: string) => void;
};

export const FilterDialogDateView = ({
  filterKey,
  label,
}: {
  filterKey: string;
  label?: string;
}) => {
  const { sessionKey, resetFilterState } = useFilterContext();
  const [value, setValue] = useFilterQueryState<string>(filterKey, sessionKey);

  return (
    <DateRangeDialogContent
      label={label ?? filterKey}
      value={value}
      onApply={(nextValue) => {
        setValue(nextValue);
        resetFilterState();
      }}
    />
  );
};

const DateRangeTypeToggle = ({
  tab,
  onTabChange,
}: {
  tab: string;
  onTabChange: (tab: string) => void;
}) => (
  <ToggleGroup
    type="single"
    variant="outline"
    size="sm"
    value={tab}
    onValueChange={onTabChange}
    className="inline-flex"
  >
    <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
    <ToggleGroup.Item value="month">Month</ToggleGroup.Item>
    <ToggleGroup.Item value="quarter">Quarter</ToggleGroup.Item>
    <ToggleGroup.Item value="halfYear">Half Year</ToggleGroup.Item>
    <ToggleGroup.Item value="year">Year</ToggleGroup.Item>
  </ToggleGroup>
);

const PERIOD_TABS = [
  { tab: 'month', items: MONTHS, className: 'grid grid-cols-2' },
  { tab: 'quarter', items: QUARTERS, className: 'flex flex-col' },
  { tab: 'halfYear', items: ['half-1', 'half-2'], className: 'flex flex-col' },
  { tab: 'year', items: undefined, className: 'flex flex-col' },
];

// The draft value starts from `value`; DateRangeDialogContent remounts this when `value` changes.
const DateRangeDialogBody = ({ label, value, onApply }: DateRangeDialogProps) => {
  const [tab, setTab] = useState(value ? getActiveTab(value) : 'day');
  const [draft, setDraft] = useState(value ?? null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    parseDateRangeFromString(value ?? ''),
  );

  const handleCalendarChange = (range: DateRange | undefined) => {
    setDateRange(range);

    if (!range?.from) {
      setDraft(null);

      return;
    }

    setDraft(`${range.from.toISOString()},${(range.to ?? range.from).toISOString()}`);
  };

  return (
    <Dialog.Content className="max-w-xl p-0">
      <Tabs value={tab} onValueChange={setTab}>
        <Dialog.Header className="p-6 space-y-3">
          <Dialog.Title className="text-sm capitalize">{label}</Dialog.Title>
          <div>
            <DateRangeTypeToggle tab={tab} onTabChange={setTab} />
          </div>
        </Dialog.Header>
        <div className="border-y border-muted py-6 flex justify-center h-88 overflow-auto">
          <Tabs.Content value="day" className="self-center outline-hidden">
            <CalendarTwoMonths
              mode="range"
              numberOfMonths={2}
              showOutsideDays
              fixedWeeks
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleCalendarChange}
            />
          </Tabs.Content>
          {PERIOD_TABS.map(({ tab: period, items, className }) => (
            <Tabs.Content key={period} value={period} className="w-full outline-hidden">
              <DateFilterRadioGroup
                items={items}
                className={className}
                onValueChange={setDraft}
                value={draft}
              />
            </Tabs.Content>
          ))}
        </div>
        <Dialog.Footer className="p-6">
          <Dialog.Close asChild>
            <Button variant="ghost" size="lg">
              Cancel
            </Button>
          </Dialog.Close>
          <Button size="lg" disabled={!draft} onClick={() => draft && onApply(draft)}>
            Apply
          </Button>
        </Dialog.Footer>
      </Tabs>
    </Dialog.Content>
  );
};

export const DateRangeDialogContent = (props: DateRangeDialogProps) => (
  <DateRangeDialogBody key={props.value ?? ''} {...props} />
);
