import { useState } from 'react';
import { Combobox, Popover } from 'erxes-ui';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

interface MonthPickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export const MonthPicker = ({
  value,
  onChange,
  placeholder = 'Pick a month',
}: MonthPickerProps) => {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() =>
    value ? dayjs(value).year() : dayjs().year(),
  );

  const handleSelect = (monthIndex: number) => {
    onChange(new Date(year, monthIndex, 1));
    setOpen(false);
  };

  const label = value ? dayjs(value).format('MMM YYYY') : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Combobox.Trigger className="w-full shadow-xs">
          <span className={value ? '' : 'text-accent-foreground/80'}>
            {label}
          </span>
        </Combobox.Trigger>
      </Popover.Trigger>
      <Popover.Content className="p-3 w-56">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setYear((y) => y - 1)}
            className="p-1 rounded hover:bg-accent"
          >
            <IconChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium">{year}</span>
          <button
            type="button"
            onClick={() => setYear((y) => y + 1)}
            className="p-1 rounded hover:bg-accent"
          >
            <IconChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {MONTHS.map((month, index) => {
            const isSelected =
              value &&
              dayjs(value).month() === index &&
              dayjs(value).year() === year;
            return (
              <button
                key={month}
                type="button"
                onClick={() => handleSelect(index)}
                className={`py-1.5 rounded text-sm hover:bg-accent ${
                  isSelected
                    ? 'bg-primary text-primary-foreground hover:bg-primary'
                    : ''
                }`}
              >
                {month}
              </button>
            );
          })}
        </div>
      </Popover.Content>
    </Popover>
  );
};
