import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IDataExtensionField,
  IDataExtensionFilter,
  IDataExtensionRecordType,
  useDataExtensionRecordList,
  useDataExtensionRecordTypes,
} from 'ui-modules';

const MONTH_LIMIT = 100;
const PER_DAY = 3;

/**
 * A month of records placed by a date field. The month's range is added to
 * the view's filter, so only that month's records are loaded.
 */
export const DataExtensionCalendar = ({
  recordType,
  fields,
  dateField,
  filter,
  searchValue,
  onOpen,
  version,
}: {
  recordType: IDataExtensionRecordType;
  fields: IDataExtensionField[];
  dateField: IDataExtensionField;
  filter: IDataExtensionFilter;
  searchValue?: string;
  onOpen: (id: string) => void;
  version: number;
}) => {
  const { t, i18n } = useTranslation('dataExtensions');
  const { recordTypes } = useDataExtensionRecordTypes();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const weekStartsOn = 1;
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn }),
      }),
    [month],
  );
  const rangeStart = days[0];
  // The day after the grid's last day, so the whole last day is included.
  const rangeEnd = useMemo(() => {
    const end = new Date(days[days.length - 1]);

    end.setDate(end.getDate() + 1);

    return end;
  }, [days]);
  // Filters are flat, so a month range can only be added to "all"
  // conditions; with "any" conditions the range is applied in the browser.
  const anyMatch = filter.match === 'any' && filter.conditions.length > 1;
  const monthFilter = useMemo<IDataExtensionFilter>(
    () =>
      anyMatch
        ? filter
        : {
            match: 'all',
            conditions: [
              ...filter.conditions,
              { field: dateField.key, operator: 'gte', value: rangeStart.toISOString() },
              { field: dateField.key, operator: 'lt', value: rangeEnd.toISOString() },
            ],
          },
    [anyMatch, filter, dateField.key, rangeStart, rangeEnd],
  );
  const { records, totalCount, loading, refetch } = useDataExtensionRecordList(
    recordType,
    fields,
    recordTypes,
    {
      filter: monthFilter,
      searchValue,
      limit: MONTH_LIMIT,
      sortField: `dataExtensions.${dateField.key}`,
      sortDirection: 1,
    },
  );

  useEffect(() => {
    refetch();
    // Bumped by the parent after a record changes in its sheet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const weekdays = days.slice(0, 7).map((day) =>
    day.toLocaleDateString(i18n.language, { weekday: 'short' }),
  );
  const onDay = (day: Date) =>
    records.filter((record) => {
      const value = record.values[dateField.key];

      return typeof value === 'string' && isSameDay(new Date(value), day);
    });

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <h3 className="min-w-40 text-sm font-medium">
          {month.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
        </h3>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('views.previous-month')}
          onClick={() => setMonth((current) => addMonths(current, -1))}
        >
          <IconChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('views.next-month')}
          onClick={() => setMonth((current) => addMonths(current, 1))}
        >
          <IconChevronRight />
        </Button>
        <Button variant="ghost" onClick={() => setMonth(startOfMonth(new Date()))}>
          {t('views.today')}
        </Button>
        {totalCount > MONTH_LIMIT && (
          <span className="ml-auto text-xs text-muted-foreground">
            {t('views.calendar-capped', { count: MONTH_LIMIT, total: totalCount })}
          </span>
        )}
      </div>
      <div
        className={cn(
          'grid min-h-0 flex-auto grid-cols-7 overflow-auto rounded-md border transition-opacity',
          loading && 'opacity-70',
        )}
        role="grid"
        aria-label={dateField.label}
        style={{
          gridTemplateRows: `auto repeat(${days.length / 7}, minmax(6rem, 1fr))`,
        }}
      >
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            role="columnheader"
            className="border-b bg-muted/40 px-2 py-1.5 text-xs font-medium text-muted-foreground"
          >
            {weekday}
          </div>
        ))}
        {days.map((day) => {
          const items = onDay(day);
          const today = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              role="gridcell"
              aria-label={format(day, 'yyyy-MM-dd')}
              className={cn(
                'flex flex-col gap-1 border-b border-r p-1.5 [&:nth-child(7n)]:border-r-0',
                !isSameMonth(day, month) && 'bg-muted/30 text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center self-end rounded-full text-xs tabular-nums',
                  today && 'bg-primary font-medium text-primary-foreground',
                )}
              >
                {day.getDate()}
              </span>
              {items.slice(0, PER_DAY).map((record) => (
                <button
                  key={record._id}
                  type="button"
                  onClick={() => onOpen(record._id)}
                  className="truncate rounded-sm bg-primary/10 px-1.5 py-0.5 text-left text-xs text-foreground hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {record.name}
                </button>
              ))}
              {items.length > PER_DAY && (
                <span className="px-1.5 text-xs text-muted-foreground">
                  {t('views.more-cards', { count: items.length - PER_DAY })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
