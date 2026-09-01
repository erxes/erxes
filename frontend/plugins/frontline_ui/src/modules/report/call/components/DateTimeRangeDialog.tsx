import { useEffect, useState } from 'react';
import { Time } from '@internationalized/date';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  Button,
  CalendarTwoMonths,
  DateInput,
  Dialog,
  TimeField,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  buildCustomTimeRange,
  parseCustomTimeRange,
} from '@/report/utils/dateFilters';

interface DateTimeRangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onApply: (value: string) => void;
}

const DAY_START = new Time(0, 0);
const DAY_END = new Time(23, 59);

const timeOf = (date: Date): Time =>
  new Time(date.getHours(), date.getMinutes());

const combine = (date: Date, time: Time): Date =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.hour,
    time.minute,
  );

export function DateTimeRangeDialog({
  open,
  onOpenChange,
  value,
  onApply,
}: DateTimeRangeDialogProps) {
  const { t } = useTranslation('frontline');
  const [range, setRange] = useState<DateRange | undefined>();
  const [fromTime, setFromTime] = useState<Time>(DAY_START);
  const [toTime, setToTime] = useState<Time>(DAY_END);

  useEffect(() => {
    if (!open) return;

    const current = parseCustomTimeRange(value);

    if (current) {
      setRange({ from: current.from, to: current.to });
      setFromTime(timeOf(current.from));
      setToTime(timeOf(current.to));
      return;
    }

    const today = new Date();
    setRange({ from: today, to: today });
    setFromTime(DAY_START);
    setToTime(DAY_END);
  }, [open, value]);

  const from = range?.from ? combine(range.from, fromTime) : undefined;
  const to = range?.from ? combine(range.to ?? range.from, toTime) : undefined;

  const invalid = Boolean(from && to && from.getTime() > to.getTime());

  const handleApply = () => {
    if (!from || !to || invalid) return;
    onApply(buildCustomTimeRange(from, to));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-xl p-0">
        <Dialog.Header className="p-6 pb-3">
          <Dialog.Title className="text-sm">
            {t('custom-range', { defaultValue: 'Custom range' })}
          </Dialog.Title>
        </Dialog.Header>

        <div className="border-y border-muted py-4 flex justify-center">
          <CalendarTwoMonths
            mode="range"
            numberOfMonths={2}
            showOutsideDays
            fixedWeeks
            autoFocus
            defaultMonth={range?.from}
            selected={range}
            onSelect={setRange}
          />
        </div>

        <div className="flex items-end justify-between gap-4 px-6 pt-4">
          <div className="flex items-end gap-3">
            <TimeField
              value={fromTime}
              onChange={(next) =>
                next && setFromTime(new Time(next.hour, next.minute))
              }
              hourCycle={24}
              aria-label={t('from', { defaultValue: 'From' })}
            >
              <span className="mb-1 block text-xs text-muted-foreground">
                {t('from', { defaultValue: 'From' })}
              </span>
              <DateInput className="w-24 justify-center" />
            </TimeField>

            <TimeField
              value={toTime}
              onChange={(next) =>
                next && setToTime(new Time(next.hour, next.minute))
              }
              hourCycle={24}
              aria-label={t('to', { defaultValue: 'To' })}
            >
              <span className="mb-1 block text-xs text-muted-foreground">
                {t('to', { defaultValue: 'To' })}
              </span>
              <DateInput className="w-24 justify-center" />
            </TimeField>
          </div>

          <p
            className={`text-xs ${
              invalid ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            {invalid
              ? t('date-range-invalid', {
                  defaultValue: 'The start must come before the end',
                })
              : from && to
              ? `${format(from, 'MMM dd, HH:mm')} — ${format(
                  to,
                  'MMM dd, HH:mm',
                )}`
              : t('select-date-range', {
                  defaultValue: 'Select a date range',
                })}
          </p>
        </div>

        <Dialog.Footer className="p-6 pt-4">
          <Dialog.Close asChild>
            <Button variant="ghost" size="lg">
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
          </Dialog.Close>
          <Button
            size="lg"
            disabled={!from || !to || invalid}
            onClick={handleApply}
          >
            {t('apply', { defaultValue: 'Apply' })}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
