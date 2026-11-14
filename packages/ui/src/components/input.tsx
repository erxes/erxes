import React from 'react';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { cn } from 'erxes-ui/lib/utils';
import type { Except } from 'type-fest';
import { IMaskInput, type ReactElementProps } from 'react-imask';

/** The text of an input or textarea: its size and, for codes, a monospace face. */
export const fieldTextVariants = {
  default: '',
  sm: 'text-xs',
  code: 'font-mono text-xs',
  // A one-time code: spaced digits, centred.
  otp: 'font-mono tracking-widest text-center',
  // The name of the record the form edits.
  title: 'text-base font-medium',
};

export const inputVariants = cva(
  'flex h-7 w-full rounded-sm bg-background px-3 py-1 text-sm text-foreground shadow-xs transition placeholder:text-accent-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 focus-visible:shadow-focus aria-invalid:focus-visible:shadow-focus-destructive',
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
        secondary:
          'bg-muted shadow-none focus-visible:shadow-subtle aria-invalid:focus-visible:shadow-destructive',
        // A 1px border instead of the drop shadow, for dense forms.
        bordered: 'border border-input shadow-none',
        // No border or corners: a cell in a grid that draws its own lines.
        flush: 'rounded-none shadow-none',
      },
      text: fieldTextVariants,
    },
    defaultVariants: {
      type: 'default',
      variant: 'default',
      text: 'default',
    },
  },
);

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  Except<VariantProps<typeof inputVariants>, 'type'>;

const InputMain = ({
  ref,
  className,
  type,
  variant,
  text,
  ...props
}: InputProps & React.RefAttributes<HTMLInputElement>) => {
  return (
    <input
      type={type}
      autoComplete="off"
      className={cn(
        inputVariants({
          type: type === 'file' ? 'file' : type === 'search' ? 'search' : 'default',
          variant,
          text,
        }),
        className,
      )}
      ref={ref}
      {...props}
    />
  );
};

/** A number with thousands separators; `onChange` gets the number, or '' when cleared. */
const InputNumber = ({
  value,
  onChange,
  className,
  ...props
}: ReactElementProps<HTMLInputElement> & {
  onChange?: (value?: number | '') => void;
  value?: number;
}) => {
  return (
    <IMaskInput
      mask={Number}
      onAccept={(accepted) => {
        onChange?.(accepted ? Number(accepted) : '');
      }}
      value={value === undefined ? '' : String(value)}
      autoComplete="off"
      radix="."
      thousandsSeparator={','}
      className={cn(inputVariants({ type: 'number' }), className)}
      unmask
      {...props}
    />
  );
};

export const Input = Object.assign(InputMain, {
  Number: InputNumber,
});
