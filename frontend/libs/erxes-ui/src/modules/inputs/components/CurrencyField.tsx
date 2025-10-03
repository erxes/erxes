import { Combobox } from 'erxes-ui/components/combobox';
import { Command } from 'erxes-ui/components/command';
import { Currency } from 'erxes-ui/types';
import { inputVariants } from 'erxes-ui/components/input';
import { cn } from 'erxes-ui/lib/utils';
import { CurrencyCode } from 'erxes-ui/types';
import React, { useState } from 'react';
import { IMaskInput } from 'react-imask';
import { Except } from 'type-fest';
import { CURRENCY_CODES } from 'erxes-ui/constants';
import { CurrencyDisplay } from 'erxes-ui/modules/display/components/CurrencyDisplay';
import { Popover } from 'erxes-ui/components';

const CurrencyFieldRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex shadow-xs h-auto items-stretch rounded gap-px bg-muted',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CurrencyFieldRoot.displayName = 'CurrencyFieldRoot';

const CurrencyValueInput = React.forwardRef<
  React.ElementRef<typeof IMaskInput>,
  Except<
    React.ComponentPropsWithoutRef<typeof IMaskInput>,
    'onChange' | 'value'
  > & {
    onChange?: (value: number) => void;
    value?: number;
  }
>(({ value, onChange, className, ...props }, ref) => {
  return (
    <IMaskInput
      ref={ref}
      mask={Number as any}
      thousandsSeparator={','}
      radix="."
      onAccept={(value) => onChange?.(Number(value))}
      value={value + ''}
      autoComplete="off"
      className={cn(inputVariants({ type: 'default' }), className)}
      unmask
      {...props}
    />
  );
});

const SelectCurrency = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Except<
    React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
    'onChange' | 'value'
  > & {
    open?: boolean;
    setOpen?: (open: boolean) => void;
    value?: CurrencyCode;
    currencies?: Record<CurrencyCode, Currency>;
    display?: 'icon' | 'label' | 'code';
    onChange?: (value: CurrencyCode) => void;
  }
>(
  (
    {
      value,
      currencies = CURRENCY_CODES,
      className,
      display = 'label',
      onChange,
      open,
      setOpen,
      ...props
    },
    ref,
  ) => {
    const [_open, _setOpen] = useState(false);
    const selectedCurrency = value ? currencies[value] : undefined;

    return (
      <Popover modal open={open || _open} onOpenChange={setOpen || _setOpen}>
        <Combobox.Trigger className={className} ref={ref} {...props}>
          {selectedCurrency ? (
            <CurrencyDisplay code={value} variant={display} />
          ) : (
            <Combobox.Value placeholder="Select currency" />
          )}
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectCurrencyCommand
            currencies={currencies}
            value={value}
            onSelect={(code) => {
              onChange?.(code as CurrencyCode);
              setOpen?.(false);
              _setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    );
  },
);

const SelectCurrencyCommand = ({
  currencies = CURRENCY_CODES,
  value,
  onSelect,
  focusOnMount,
}: {
  currencies?: Record<CurrencyCode, Currency>;
  value?: CurrencyCode;
  onSelect: (code: CurrencyCode) => void;
  focusOnMount?: boolean;
}) => {
  const sortedCurrencies = Object.entries(currencies).sort((a, b) => {
    if (a[0] === value) {
      return -1;
    }
    return 1;
  });

  return (
    <Command>
      <Command.Input
        placeholder="Search currency"
        focusOnMount={focusOnMount}
      />
      <Command.List>
        <Command.Empty>No currency found</Command.Empty>
        {sortedCurrencies.map(([code, { label, Icon }]) => (
          <Command.Item
            key={code}
            value={code + ' ' + label}
            onSelect={() => onSelect(code as CurrencyCode)}
          >
            <Icon />
            {label}
            <Combobox.Check checked={value === code} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const CurrencyField = Object.assign(CurrencyFieldRoot, {
  ValueInput: CurrencyValueInput,
  SelectCurrency: SelectCurrency,
  SelectCurrencyCommand: SelectCurrencyCommand,
});
