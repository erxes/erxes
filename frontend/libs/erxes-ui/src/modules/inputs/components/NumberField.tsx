import { IMaskInput } from 'react-imask';
import { cn } from 'erxes-ui/lib/utils';
import { inputVariants } from 'erxes-ui/components/input';
import { Except } from 'type-fest';

export const NumberInput = ({
  onChange,
  value,
  className,
  ...props
}: Except<
  React.ComponentPropsWithoutRef<typeof IMaskInput>,
  'onChange' | 'value'
> & {
  onChange?: (value: number) => void;
  value?: number;
}) => (
  <IMaskInput
    mask={Number as any}
    thousandsSeparator={','}
    radix="."
    onAccept={(val) => onChange?.(Number(val))}
    value={value + ''}
    autoComplete="off"
    className={cn(inputVariants({ type: 'default' }), className)}
    unmask
    {...props}
  />
);
