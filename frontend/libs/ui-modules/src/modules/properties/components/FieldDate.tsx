import { cn, DatePicker } from 'erxes-ui';
import { SpecificFieldProps } from './Field';
import { useState } from 'react';

export const FieldDate = (props: SpecificFieldProps) => {
  const { value, handleChange, field, inCell } = props;
  const [currentValue, setCurrentValue] = useState<Date | Date[] | undefined>(
    value,
  );
  return (
    <DatePicker
      value={currentValue}
      onChange={(date) => {
        setCurrentValue(date as Date | Date[] | undefined);
        date !== value && handleChange(date);
      }}
      variant={inCell ? 'ghost' : 'outline'}
      className={cn(inCell && 'rounded-none [&_svg]:hidden')}
      placeholder=""
      mode={'single'}
    />
  );
};
