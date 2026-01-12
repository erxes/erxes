import {
  Combobox,
  Command,
  Popover,
  PopoverScoped,
  DatePicker,
} from 'erxes-ui';
import { createContext, useContext, useState, useEffect } from 'react';
import { format, parse } from 'date-fns';

export type DateSelectorValue =
  | 'today'
  | 'yesterday'
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'last-month'
  | 'this-year'
  | 'last-year'
  | 'custom';

interface DateSelectorContextType {
  value: DateSelectorValue | string;
  onValueChange: (value: DateSelectorValue | string) => void;
}

const DateSelectorContext = createContext<DateSelectorContextType | null>(null);

const useDateSelectorContext = () => {
  const context = useContext(DateSelectorContext);
  if (!context) {
    throw new Error(
      'useDateSelectorContext must be used within DateSelectorProvider',
    );
  }
  return context;
};

const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'this-year', label: 'This Year' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Date' },
] as const;

export const DateSelectorProvider = ({
  children,
  value,
  onValueChange,
  setOpen,
}: {
  children: React.ReactNode;
  value: DateSelectorValue | string;
  onValueChange: (value: DateSelectorValue | string) => void;
  setOpen: (open: boolean) => void;
}) => {
  const handleValueChange = (newValue: DateSelectorValue | string) => {
    onValueChange(newValue);
    if (
      newValue !== 'custom' &&
      !(typeof newValue === 'string' && newValue.startsWith('custom:'))
    ) {
      setOpen(false);
    } else if (typeof newValue === 'string' && newValue.startsWith('custom:')) {
      setOpen(false);
    }
  };
  return (
    <DateSelectorContext.Provider
      value={{ value, onValueChange: handleValueChange }}
    >
      {children}
    </DateSelectorContext.Provider>
  );
};

export const DateSelectorValue = ({ placeholder }: { placeholder: string }) => {
  const { value } = useDateSelectorContext();
  if (!value) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-accent-foreground text-sm">{placeholder}</span>
      </div>
    );
  }

  if (
    value === 'custom' ||
    (typeof value === 'string' && value.startsWith('custom:'))
  ) {
    if (typeof value === 'string' && value.startsWith('custom:')) {
      const dateString = value.replace('custom:', '');
      try {
        const date = parse(dateString, 'yyyy-MM-dd', new Date());
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{format(date, 'MMM DD, YYYY')}</span>
          </div>
        );
      } catch {
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">Custom Date</span>
          </div>
        );
      }
    }
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">Custom Date</span>
      </div>
    );
  }

  const selectedOption = DATE_OPTIONS.find((option) => option.value === value);
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{selectedOption?.label || placeholder}</span>
    </div>
  );
};

export const DateSelectorCommandItem = ({
  option,
}: {
  option: (typeof DATE_OPTIONS)[number];
}) => {
  const { onValueChange, value } = useDateSelectorContext();
  const isChecked =
    option.value === 'custom'
      ? value === 'custom' ||
        (typeof value === 'string' && value.startsWith('custom:'))
      : value === option.value;

  return (
    <Command.Item
      value={option.value}
      onSelect={() => {
        onValueChange(option.value);
      }}
    >
      <span className="text-sm">{option.label}</span>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

export const DateSelectorCustomDate = () => {
  const { value, onValueChange } = useDateSelectorContext();

  const getCustomDate = (): Date | undefined => {
    if (typeof value === 'string' && value.startsWith('custom:')) {
      const dateString = value.replace('custom:', '');
      try {
        return parse(dateString, 'yyyy-MM-dd', new Date());
      } catch {
        return undefined;
      }
    }
    return undefined;
  };

  const [customDate, setCustomDate] = useState<Date | undefined>(
    getCustomDate(),
  );

  useEffect(() => {
    setCustomDate(getCustomDate());
  }, [value]);

  const handleDateChange = (date: Date | Date[] | undefined) => {
    const singleDate = Array.isArray(date) ? date[0] : date;
    setCustomDate(singleDate);
    if (singleDate) {
      const dateString = format(singleDate, 'yyyy-MM-dd');
      onValueChange(`custom:${dateString}`);
    }
  };

  return (
    <div className="p-2">
      <DatePicker
        value={customDate}
        onChange={handleDateChange}
        placeholder="Select custom date"
        format="MMM DD, YYYY"
        variant="outline"
        className="w-full"
      />
    </div>
  );
};

export const DateSelectorContent = () => {
  const { value } = useDateSelectorContext();
  const showCustomPicker =
    value === 'custom' ||
    (typeof value === 'string' && value.startsWith('custom:'));

  return (
    <Command>
      <Command.List>
        {DATE_OPTIONS.map((option) => (
          <DateSelectorCommandItem key={option.value} option={option} />
        ))}
        {showCustomPicker && (
          <div className="border-t p-2">
            <DateSelectorCustomDate />
          </div>
        )}
      </Command.List>
    </Command>
  );
};

const DateSelectorRoot = ({
  value,
  onValueChange,
}: {
  value: DateSelectorValue | string;
  onValueChange: (value: DateSelectorValue | string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <DateSelectorProvider
      value={value}
      onValueChange={onValueChange}
      setOpen={setOpen}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Popover.Trigger className="bg-background rounded px-2 shadow-xs hover:bg-accent cursor-pointer transition-all duration-200 hover:text-primary/80 ease-in-out">
          <DateSelectorValue placeholder="Select date" />
        </Popover.Trigger>
        <Combobox.Content sideOffset={8} onClick={(e) => e.stopPropagation()}>
          <DateSelectorContent />
        </Combobox.Content>
      </PopoverScoped>
    </DateSelectorProvider>
  );
};

export const DateSelector = Object.assign(DateSelectorRoot, {
  Value: DateSelectorValue,
  CommandItem: DateSelectorCommandItem,
  Content: DateSelectorContent,
});
