import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MONTHS, daysInMonth, toMonthDay } from '@/pricing/utils/schedule';

interface ScheduleMonthDayPickerProps {
  // 'MM-DD'
  value: string;
  onChange: (value: string) => void;
}

export const ScheduleMonthDayPicker = ({
  value,
  onChange,
}: ScheduleMonthDayPickerProps) => {
  const { t } = useTranslation('loyalty');
  const month = Number(value.slice(0, 2)) || 1;
  const day = Number(value.slice(3)) || 1;
  const days = Array.from({ length: daysInMonth(month) }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Select
        value={String(month)}
        onValueChange={(next) => {
          const nextMonth = Number(next);

          onChange(
            toMonthDay(nextMonth, Math.min(day, daysInMonth(nextMonth))),
          );
        }}
      >
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {MONTHS.map((item) => (
            <Select.Item key={item} value={String(item)}>
              {t('schedule-month-n', { month: item })}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <Select
        value={String(day)}
        onValueChange={(next) => onChange(toMonthDay(month, Number(next)))}
      >
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {days.map((item) => (
            <Select.Item key={item} value={String(item)}>
              {item}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};
