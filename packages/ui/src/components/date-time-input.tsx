import { Input } from '@base-ui/react/input';
import { inputVariants } from './input';
import { cn } from 'erxes-ui/lib/utils';

type DateTimeInputProps = Omit<Input.Props, 'type' | 'className'> & { className?: string };

/** A time of day. `value` and `onValueChange` carry `HH:mm`, as the browser's time input does. */
export const TimeField = ({ className, ...props }: DateTimeInputProps) => (
  <Input type="time" className={cn(inputVariants(), className)} {...props} />
);

/**
 * A calendar date typed in. `value` and `onValueChange` carry `yyyy-MM-dd`, as the browser's date
 * input does. DatePicker picks one from a calendar instead.
 */
export const DateInput = ({ className, ...props }: DateTimeInputProps) => (
  <Input type="date" className={cn(inputVariants(), className)} {...props} />
);
