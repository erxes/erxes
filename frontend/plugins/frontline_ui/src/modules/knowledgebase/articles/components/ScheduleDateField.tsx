import { Time } from '@internationalized/date';
import { DateInput, DatePicker, TimeField } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const DEFAULT_TIME = new Time(9, 0);

const combine = (day: Date, time: Time) =>
  new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    time.hour,
    time.minute,
  );

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
};

export const ScheduleDateField = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (next?: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const date = value ? new Date(value) : undefined;
  const time = date
    ? new Time(date.getHours(), date.getMinutes())
    : DEFAULT_TIME;

  const update = (day: Date | undefined, nextTime: Time) =>
    onChange(day ? combine(day, nextTime).toISOString() : undefined);

  return (
    <div className="flex gap-2 items-center">
      <DatePicker
        value={date}
        onChange={(next) =>
          update(next instanceof Date ? next : undefined, time)
        }
        minDate={startOfToday()}
        placeholder={t('kb-pick-date', 'Pick a date')}
        variant="outline"
      />
      <TimeField
        value={time}
        isDisabled={!date}
        onChange={(next) =>
          next && update(date, new Time(next.hour, next.minute))
        }
        hourCycle={24}
        aria-label={t('kb-publish-time', 'Publish time')}
      >
        <DateInput className="justify-center w-20" />
      </TimeField>
    </div>
  );
};
