import { Badge, DatePicker } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { formatDateValue } from '@/pricing/utils/date';

interface ScheduleClosedDatesProps {
  dates: string[];
  onChange: (dates: string[]) => void;
}

export const ScheduleClosedDates = ({
  dates,
  onChange,
}: ScheduleClosedDatesProps) => {
  const { t } = useTranslation('loyalty');

  const add = (value?: Date) => {
    const date = formatDateValue(value);

    if (date && !dates.includes(date)) {
      onChange([...dates, date].sort());
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t('schedule-closed-dates')}</p>
      <p className="text-sm text-muted-foreground">
        {t('schedule-closed-dates-hint')}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {dates.map((date) => (
          <Badge
            key={date}
            variant="destructive"
            onClose={() => onChange(dates.filter((item) => item !== date))}
          >
            {date}
          </Badge>
        ))}
        <div className="w-44">
          <DatePicker
            value={undefined}
            placeholder={t('schedule-add-closed-date')}
            onChange={(value) => add(value instanceof Date ? value : undefined)}
          />
        </div>
      </div>
    </div>
  );
};
