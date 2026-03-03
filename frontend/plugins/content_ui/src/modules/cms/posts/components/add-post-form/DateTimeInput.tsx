import { DatePicker } from 'erxes-ui';

interface DateTimeInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
}

export const DateTimeInput = ({
  value,
  onChange,
  placeholder,
}: DateTimeInputProps) => {
  const handleDateChange = (d: Date | Date[] | undefined) => {
    const picked = Array.isArray(d) ? d[0] : d;
    if (!picked) {
      onChange(undefined);
      return;
    }
    const current = value || new Date();
    const merged = new Date(picked);
    merged.setHours(current.getHours());
    merged.setMinutes(current.getMinutes());
    merged.setSeconds(0);
    merged.setMilliseconds(0);
    onChange(merged);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (!timeValue) return;
    const [hh, mm] = timeValue.split(':').map((v) => Number.parseInt(v, 10));
    const base = value || new Date();
    const merged = new Date(base);
    merged.setHours(hh || 0);
    merged.setMinutes(mm || 0);
    merged.setSeconds(0);
    merged.setMilliseconds(0);
    onChange(merged);
  };

  const timeValue = value
    ? `${String(new Date(value).getHours()).padStart(2, '0')}:${String(
        new Date(value).getMinutes(),
      ).padStart(2, '0')}`
    : '';

  return (
    <div className="flex items-center gap-1">
      <DatePicker
        value={value}
        onChange={handleDateChange}
        placeholder={placeholder}
      />
      <input
        type="time"
        className="border rounded px-2 py-1 h-9 text-sm w-[100px]"
        value={timeValue}
        onChange={handleTimeChange}
      />
    </div>
  );
};
