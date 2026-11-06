import { Time } from '@internationalized/date';
import { DateInput, DatePicker, TimeField } from 'erxes-ui';

interface DateTimeInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
}

const combine = (day: Date, time: Time) =>
  new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    time.hour,
    time.minute,
  );

export const DateTimeInput = ({
  value,
  onChange,
  placeholder,
}: DateTimeInputProps) => {
  const date = value ? new Date(value) : undefined;
  const time = date ? new Time(date.getHours(), date.getMinutes()) : null;

  const handleDateChange = (picked: Date | undefined) => {
    if (!picked) {
      onChange(undefined);
      return;
    }

    const current = date || new Date();

    onChange(
      combine(picked, new Time(current.getHours(), current.getMinutes())),
    );
  };

  const handleTimeChange = (next: Time | null) => {
    if (!next) return;

    onChange(combine(date || new Date(), new Time(next.hour, next.minute)));
  };

  return (
    <div className="flex items-center gap-1">
      <DatePicker
        value={date}
        onChange={(next) =>
          handleDateChange(next instanceof Date ? next : undefined)
        }
        placeholder={placeholder}
      />
      <TimeField
        value={time}
        onChange={handleTimeChange}
        hourCycle={24}
        aria-label={placeholder}
      >
        <DateInput className="w-20 justify-center" />
      </TimeField>
    </div>
  );
};
