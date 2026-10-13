import {
  DateRangeDialogContent,
  parseDateRangeFromString,
  useFilterContext,
} from 'erxes-ui';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getDateRange } from '@/report/utils/dateFilters';

const REPORT_DATE_LABELS: Record<string, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  'this-week': 'This week',
  'last-week': 'Last week',
  'this-month': 'This month',
  'last-month': 'Last month',
  'this-year': 'This year',
  'last-year': 'Last year',
};

export const REPORT_FIXED_DATES = Object.keys(REPORT_DATE_LABELS);

export const ReportDateFilter = ({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) => {
  const { t } = useTranslation('frontline');
  const { resetFilterState } = useFilterContext();
  const { fromDate, toDate } = getDateRange(value);
  const dialogValue =
    fromDate && toDate
      ? parseDateRangeFromString(value)
        ? value
        : `${fromDate.toISOString()},${toDate.toISOString()}`
      : undefined;

  return (
    <DateRangeDialogContent
      label={label || t('date', 'Date')}
      value={dialogValue}
      onApply={(nextValue) => {
        onChange(nextValue);
        resetFilterState();
      }}
    />
  );
};

export const getReportDisplayValue = (value: string): string => {
  if (REPORT_DATE_LABELS[value]) return REPORT_DATE_LABELS[value];
  const { fromDate, toDate } = getDateRange(value);
  if (!fromDate || !toDate) return 'Unknown';
  const [year, period, number] = value.split('-');
  if (period === 'quarter') return `${year} Q${number}`;
  if (period === 'half') return `${year} H${number}`;
  if (period === 'y') return year;
  if (!value.includes(',') && parseDateRangeFromString(value)) return value;
  return `${format(fromDate, 'MMM d, yyyy')} - ${format(
    toDate,
    'MMM d, yyyy',
  )}`;
};
