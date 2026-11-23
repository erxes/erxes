import { useQueryState } from 'nuqs';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import { buttonVariants, Button } from 'erxes-ui/components/button';
import { Calendar } from 'erxes-ui/components/calendar';
import { Dialog } from 'erxes-ui/components/dialog';
import { RadioGroup } from 'erxes-ui/components/radio-group';
import { Tabs } from 'erxes-ui/components/tabs';
import { ToggleGroup } from 'erxes-ui/components/toggle-group';
import { cn } from 'erxes-ui/lib/utils';
import { useFilterContext } from '../hooks/useFilterContext';
import { activeTabOf, HALVES, MONTHS, QUARTERS, yearsAround } from './dateTokens';
import { parseDateRangeFromString } from './parseDateRangeFromString';

type DateTab = 'day' | 'month' | 'quarter' | 'halfYear' | 'year';

const isDateTab = (value: string | undefined): value is DateTab =>
  value === 'day' ||
  value === 'month' ||
  value === 'quarter' ||
  value === 'halfYear' ||
  value === 'year';

/** One choice in the grid, a button that reads as pressed while it is the value. */
const DateRadio = ({
  id,
  value,
  current,
  children,
}: {
  id: string;
  value: string;
  current: string | null;
  children: ReactNode;
}) => {
  const ref = useRef<HTMLLabelElement>(null);
  const checked = current === value;

  // The picked one shows when the tab opens.
  useEffect(() => {
    if (checked) ref.current?.scrollIntoView({ behavior: 'instant', block: 'center' });
  }, [checked]);

  return (
    <label
      ref={ref}
      htmlFor={`${id}-${value}`}
      className={cn(
        buttonVariants({ variant: 'secondary' }),
        'capitalize shadow-none has-data-checked:border-ring has-data-checked:bg-primary has-data-checked:text-primary-foreground has-focus-visible:outline-2 has-focus-visible:outline-solid has-focus-visible:outline-ring/70',
      )}
    >
      <RadioGroup.Item value={value} id={`${id}-${value}`} className="sr-only" />
      {children}
    </label>
  );
};

const GRID_COLUMNS: Record<number, string> = {
  12: 'grid-cols-3',
  4: 'grid-cols-4',
  2: 'grid-cols-2',
};

/** Every year of `yearsAround`, each with `items` (months, quarters, halves), or the years alone. */
const DateRadioGroup = ({
  items,
  className,
  value,
  onValueChange,
}: {
  items?: readonly string[];
  className: string;
  value: string | null;
  onValueChange: (value: string) => void;
}) => {
  const id = useId();

  return (
    <RadioGroup
      value={value ?? ''}
      onValueChange={onValueChange}
      className={cn('w-full gap-6 px-6 pb-6', className)}
    >
      {yearsAround().map((year) =>
        items ? (
          <div className="flex flex-col gap-3" key={year}>
            <span className="text-sm font-semibold leading-none">{year}</span>
            <div className={cn('grid gap-1', GRID_COLUMNS[items.length])}>
              {items.map((item) => (
                <DateRadio key={item} id={id} value={`${year}-${item}`} current={value}>
                  {item.replaceAll('-', ' ')}
                </DateRadio>
              ))}
            </div>
          </div>
        ) : (
          <DateRadio key={year} id={id} value={`${year}-y`} current={value}>
            {year}
          </DateRadio>
        ),
      )}
    </RadioGroup>
  );
};

/** Which kind of period the dialog picks: days, a month, a quarter, a half year or a year. */
const DateTabSwitch = ({
  tab,
  onTabChange,
}: {
  tab: DateTab;
  onTabChange: (tab: DateTab) => void;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'date-filter' });

  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      value={[tab]}
      onValueChange={([next]) => isDateTab(next) && onTabChange(next)}
      className="inline-flex"
    >
      <ToggleGroup.Item value="day">{t('day', 'Day')}</ToggleGroup.Item>
      <ToggleGroup.Item value="month">{t('month', 'Month')}</ToggleGroup.Item>
      <ToggleGroup.Item value="quarter">{t('quarter', 'Quarter')}</ToggleGroup.Item>
      <ToggleGroup.Item value="halfYear">{t('half-year', 'Half Year')}</ToggleGroup.Item>
      <ToggleGroup.Item value="year">{t('year', 'Year')}</ToggleGroup.Item>
    </ToggleGroup>
  );
};

/** The month, quarter, half year and year tabs, each a grid of every year's choices. */
const PeriodPanels = ({
  value,
  onValueChange,
}: {
  value: string | null;
  onValueChange: (value: string) => void;
}) => (
  <>
    <Tabs.Content value="month" className="w-full outline-hidden">
      <DateRadioGroup
        items={MONTHS}
        value={value}
        onValueChange={onValueChange}
        className="grid grid-cols-2"
      />
    </Tabs.Content>
    <Tabs.Content value="quarter" className="w-full outline-hidden">
      <DateRadioGroup
        items={QUARTERS}
        value={value}
        onValueChange={onValueChange}
        className="flex flex-col"
      />
    </Tabs.Content>
    <Tabs.Content value="halfYear" className="w-full outline-hidden">
      <DateRadioGroup
        items={HALVES}
        value={value}
        onValueChange={onValueChange}
        className="flex flex-col"
      />
    </Tabs.Content>
    <Tabs.Content value="year" className="w-full outline-hidden">
      <DateRadioGroup value={value} onValueChange={onValueChange} className="flex flex-col" />
    </Tabs.Content>
  </>
);

/**
 * The dialog that picks a date filter's value: days on two calendars, or a month, quarter,
 * half year or year. Apply hands `onApply` the value as the address keeps it.
 */
const DateRangeDialogContent = ({
  label,
  value,
  onApply,
}: {
  label: string;
  value?: string | null;
  onApply: (value: string) => void;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'date-filter' });
  const [tab, setTab] = useState<DateTab>(value ? activeTabOf(value) : 'day');
  const [range, setRange] = useState<DateRange | undefined>(() => parseDateRangeFromString(value));
  const [current, setCurrent] = useState<string | null>(value ?? null);

  const pickDays = (next: DateRange | undefined) => {
    setRange(next);

    if (!next?.from) {
      setCurrent(null);

      return;
    }

    setCurrent(`${next.from.toISOString()},${(next.to ?? next.from).toISOString()}`);
  };

  return (
    <Dialog.Content className="max-w-xl p-0">
      <Tabs value={tab} onValueChange={(next) => isDateTab(next) && setTab(next)}>
        <Dialog.Header className="space-y-3 p-6">
          <Dialog.Title className="text-sm capitalize">{label}</Dialog.Title>
          <div>
            <DateTabSwitch tab={tab} onTabChange={setTab} />
          </div>
        </Dialog.Header>
        <div className="flex h-88 justify-center overflow-auto border-y border-muted py-6">
          <Tabs.Content value="day" className="self-center outline-hidden">
            <Calendar
              mode="range"
              numberOfMonths={2}
              showOutsideDays
              fixedWeeks
              defaultMonth={range?.from}
              selected={range}
              onSelect={pickDays}
            />
          </Tabs.Content>
          <PeriodPanels value={current} onValueChange={setCurrent} />
        </div>
        <Dialog.Footer className="p-6">
          <Dialog.Close render={<Button variant="ghost" size="lg" />}>
            {t('cancel', 'Cancel')}
          </Dialog.Close>
          <Button size="lg" disabled={!current} onClick={() => current && onApply(current)}>
            {t('apply', 'Apply')}
          </Button>
        </Dialog.Footer>
      </Tabs>
    </Dialog.Content>
  );
};

/** A date filter's dialog, in `Filter.View inDialog`: Apply writes the value to the address. */
export const FilterDialogDateView = ({
  filterKey,
  label,
}: {
  filterKey: string;
  label?: string;
}) => {
  const [value, setValue] = useQueryState(filterKey);
  const { resetFilterState } = useFilterContext();

  return (
    <DateRangeDialogContent
      label={label ?? filterKey}
      value={value}
      onApply={(next) => {
        void setValue(next);
        resetFilterState();
      }}
    />
  );
};
