import React, { useRef, useState } from 'react';
import { IMask, IMaskInput } from 'react-imask';
import { parse, isValid, format } from 'date-fns';
import { cn } from 'erxes-ui';

interface TimeInputProps {
  value: Date;
  onChange?: (value: Date) => void;
  className?: string;
}

export const TimePicker: React.FC<
  Omit<
    React.ComponentProps<typeof IMaskInput>,
    'value' | 'onChange' | 'className'
  > &
    TimeInputProps
> = ({ value, onChange, className, ...props }) => {
  const [inputValue, setInputValue] = useState(format(value, 'hh:mm a'));
  const [error, setError] = useState<string | null>(null);
  const ref = useRef(null);

  const validateTime = (val: string) => {
    const parsed = parse(val, 'hh:mm a', new Date());
    if (isValid(parsed)) {
      setError(null);
      onChange?.(parsed);
    } else {
      setError('Invalid time');
    }
  };

  return (
    <IMaskInput
      ref={ref}
      {...({
        mask: '00:00 aa',
        blocks: {
          aa: { mask: IMask.MaskedEnum, enum: ['AM', 'PM'] },
        },
        lazy: false,
        unmask: false,
      } as any)}
      lazy={false}
      unmask={false}
      value={inputValue}
      onAccept={(val: string) => {
        setInputValue(val);
        validateTime(val);
      }}
      placeholder={format(new Date(), 'hh:mm a')}
      className={cn(
        error ? 'border-destructive' : '',
        'border rounded px-2 py-1 focus:outline-none min-w-[86px] text-sm h-8',
        className,
      )}
      {...props}
    />
  );
};
