import * as React from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from 'erxes-ui/lib/utils';
import { Except } from 'type-fest';
import { IMaskInput } from 'react-imask';

export const inputVariants = cva(
  'flex h-8 w-full rounded-sm bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] placeholder:text-accent-foreground/70 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:shadow-focus',
  {
    variants: {
      type: {
        file: 'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        search:
          '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none',
        default: '',
        number:
          '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
      },
      variant: {
        default: '',
        secondary: 'bg-muted shadow-none focus-visible:shadow-subtle',
      },
    },
    defaultVariants: {
      type: 'default',
      variant: 'default',
    },
  },
);

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  Except<VariantProps<typeof inputVariants>, 'type'>;

const InputMain = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        autoComplete="off"
        className={cn(
          inputVariants({
            type:
              type === 'file'
                ? 'file'
                : type === 'search'
                ? 'search'
                : 'default',
            variant,
          }),
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

InputMain.displayName = 'Input';

export const InputNumber = React.forwardRef<
  React.ElementRef<typeof IMaskInput>,
  Except<
    React.ComponentPropsWithoutRef<typeof IMaskInput>,
    'onChange' | 'value'
  > & {
    onChange?: (value?: number | '') => void;
    value?: number;
  }
>(({ value, onChange, className, ...props }, ref) => {
  return (
    <IMaskInput
      ref={ref}
      mask={Number as any}
      onAccept={(value) => {
        onChange?.(value ? Number(value) : '');
      }}
      value={value + ''}
      autoComplete="off"
      radix="."
      thousandsSeparator={','}
      className={cn(inputVariants({ type: 'number' }), className)}
      unmask
      {...props}
    />
  );
});

InputNumber.displayName = 'InputNumber';

export const Input = Object.assign(InputMain, {
  Number: InputNumber,
});
