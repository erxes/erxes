import { IconAlertTriangle } from '@tabler/icons-react';
import { DatePicker, Label, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TTierHistoryIssue,
  TTierHistoryPeriod,
  TTierHistoryValue,
} from '../utils/tierHistorySegments';

const PERIODS: TTierHistoryPeriod[] = ['month', 'quarter', 'year', 'custom'];

const toDate = (value?: string) => (value ? new Date(value) : undefined);

const startOfDay = (value: unknown) =>
  value instanceof Date
    ? new Date(new Date(value).setHours(0, 0, 0, 0)).toISOString()
    : undefined;

// The last day counts whole.
const endOfDay = (value: unknown) =>
  value instanceof Date
    ? new Date(new Date(value).setHours(23, 59, 59, 999)).toISOString()
    : undefined;

/** Which purchases are summed: this calendar month, quarter, year, or dates. */
export const TierHistoryFields = ({
  value,
  onChange,
  issue,
}: {
  value: TTierHistoryValue;
  onChange: (value: TTierHistoryValue) => void;
  issue: TTierHistoryIssue | null;
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <div className="flex flex-col gap-2">
      <Label>{t('tier-history-period')}</Label>
      <Select
        value={value.period}
        onValueChange={(selected) =>
          onChange({
            period: PERIODS.find((period) => period === selected) || 'year',
          })
        }
      >
        <Select.Trigger className="w-64">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {PERIODS.map((period) => (
            <Select.Item key={period} value={period}>
              {t(`tier-history-period-${period}`)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      {value.period === 'custom' && (
        <div className="grid grid-cols-2 gap-2">
          <DatePicker
            value={toDate(value.startDate)}
            onChange={(date) =>
              onChange({ ...value, startDate: startOfDay(date) })
            }
            placeholder={t('tier-history-from-date')}
          />
          <DatePicker
            value={toDate(value.endDate)}
            onChange={(date) => onChange({ ...value, endDate: endOfDay(date) })}
            placeholder={t('tier-history-to-date')}
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">{t('tier-history-hint')}</p>
      {issue && (
        <p className="flex items-center gap-1.5 text-xs text-warning">
          <IconAlertTriangle className="size-3.5 shrink-0" />
          {t(`tier-history-${issue}`)}
        </p>
      )}
    </div>
  );
};
