import { Input } from '@base-ui/react/input';
import { useValidationMessage } from '../hooks/use-validation-message';
import { useFieldControl } from './field-control';
import { inputVariants } from './input';
import { cn } from 'erxes-ui/lib/utils';

type DateTimeInputProps = Omit<Input.Props, 'type' | 'className'> & { className?: string };

/** The browser's date or time input, named by its form row, its messages in the UI's language. */
const NativeInput = ({
  type,
  className,
  onInvalid,
  ...props
}: DateTimeInputProps & { type: 'date' | 'time' }) => {
  const field = useFieldControl();
  const handleInvalid = useValidationMessage(onInvalid);

  return (
    <Input
      {...field}
      onInvalid={handleInvalid}
      type={type}
      className={cn(inputVariants(), className)}
      {...props}
    />
  );
};

/**
 * A time of day. `value` and `onValueChange` carry `HH:mm`, as the browser's time input does.
 * Its form row's label names it.
 */
export const TimeField = (props: DateTimeInputProps) => <NativeInput type="time" {...props} />;

/**
 * A calendar date typed in. `value` and `onValueChange` carry `yyyy-MM-dd`, as the browser's date
 * input does. DatePicker picks one from a calendar instead. Its form row's label names it.
 */
export const DateInput = (props: DateTimeInputProps) => <NativeInput type="date" {...props} />;
