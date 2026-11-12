import { IMaskInput, type ReactElementProps } from 'react-imask';
import { cn } from 'erxes-ui/lib/utils';
import { inputVariants } from 'erxes-ui/components/input';

/** A number with thousands separators; `onChange` gets the number, not the text. */
export const NumberInput = ({
  onChange,
  value,
  className,
  ...props
}: ReactElementProps<HTMLInputElement> & {
  onChange?: (value: number) => void;
  value?: number;
}) => (
  <IMaskInput
    mask={Number}
    thousandsSeparator=","
    radix="."
    onAccept={(accepted) => onChange?.(Number(accepted))}
    value={value?.toString() ?? ''}
    autoComplete="off"
    className={cn(inputVariants({ type: 'default' }), className)}
    unmask
    {...props}
  />
);
