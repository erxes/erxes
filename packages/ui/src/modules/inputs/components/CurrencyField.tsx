import { type ComponentProps, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReactElementProps } from 'react-imask';
import { Combobox } from 'erxes-ui/components/combobox';
import { Command } from 'erxes-ui/components/command';
import { inputVariants } from 'erxes-ui/components/input';
import { MaskInput } from 'erxes-ui/components/on-demand';
import { Popover } from 'erxes-ui/components/popover';
import { type CurrencyCode, isCurrencyCode } from 'erxes-ui/constants/currencyCode';
import { CURRENCY_CODES } from 'erxes-ui/constants/CurrencyCodes';
import { cn } from 'erxes-ui/lib/utils';
import { CurrencyDisplay } from 'erxes-ui/modules/display/components/Currency';
import { IconComponent } from 'erxes-ui/modules/icons/components/IconComponent';

const DEFAULT_DISPLAY_SCALE = 2;
const DEFAULT_EDIT_SCALE = 12;

const ALL_CODES = Object.keys(CURRENCY_CODES).filter(isCurrencyCode);

/** An amount and its currency side by side, joined in one muted box. */
const CurrencyFieldRoot = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn('flex h-auto items-stretch gap-px rounded bg-muted shadow-xs', className)}
    {...props}
  />
);

/**
 * An amount with thousands separators: `displayScale` decimals (2) while it shows, up to
 * `editScale` (12) while it is typed in. `onChange` gets the number.
 */
const CurrencyValueInput = ({
  value,
  onChange,
  className,
  onFocus,
  onBlur,
  displayScale = DEFAULT_DISPLAY_SCALE,
  editScale = DEFAULT_EDIT_SCALE,
  ...props
}: Omit<ReactElementProps<HTMLInputElement>, 'onChange' | 'value'> & {
  displayScale?: number;
  editScale?: number;
  onChange?: (value: number) => void;
  value?: number;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFocusedRef = useRef(false);
  // Focusing rewrites the shown value to the full one; that rewrite is no edit.
  const skipAcceptValueRef = useRef<string | null>(null);
  const finite = typeof value === 'number' && Number.isFinite(value);
  const fullValue = finite ? value.toString() : '';
  const roundedValue = finite ? value.toFixed(displayScale) : '';

  return (
    <MaskInput
      mask={Number}
      thousandsSeparator=","
      radix="."
      scale={isFocused ? editScale : displayScale}
      onAccept={(accepted: string) => {
        if (!isFocusedRef.current) return;

        if (skipAcceptValueRef.current === accepted) {
          skipAcceptValueRef.current = null;

          return;
        }

        onChange?.(Number(accepted));
      }}
      onFocus={(event) => {
        isFocusedRef.current = true;
        skipAcceptValueRef.current = fullValue;
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        isFocusedRef.current = false;
        skipAcceptValueRef.current = null;
        setIsFocused(false);
        onBlur?.(event);
      }}
      value={isFocused ? fullValue : roundedValue}
      autoComplete="off"
      className={cn(inputVariants({ type: 'default' }), className)}
      unmask
      {...props}
    />
  );
};

/** The currencies to list, the picked one first, as 3.x sorted them. */
const pickedFirst = (codes: readonly CurrencyCode[], value: CurrencyCode | undefined) =>
  codes.toSorted((a, b) => Number(b === value) - Number(a === value));

/** A searchable list of currencies, each with its icon and name, for a popover or filter view. */
const SelectCurrencyCommand = ({
  currencies = ALL_CODES,
  value,
  onSelect,
  focusOnMount,
}: {
  /** The codes to offer (an organisation's currencies); every one `CURRENCY_CODES` lists by default. */
  currencies?: readonly CurrencyCode[];
  value?: CurrencyCode;
  onSelect: (code: CurrencyCode) => void;
  focusOnMount?: boolean;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'currency' });

  return (
    <Command>
      <Command.Input placeholder={t('search', 'Search currency')} focusOnMount={focusOnMount} />
      <Command.List>
        <Command.Empty>{t('empty', 'No currency found')}</Command.Empty>
        {pickedFirst(currencies, value).map((code) => {
          const { label, icon } = CURRENCY_CODES[code];

          return (
            <Command.Item key={code} value={`${code} ${label}`} onSelect={() => onSelect(code)}>
              <IconComponent name={icon} />
              {label}
              <Combobox.Check checked={value === code} />
            </Command.Item>
          );
        })}
      </Command.List>
    </Command>
  );
};

/**
 * A button showing the currency (its name, icon or code by `display`) that picks another from
 * a searchable list.
 */
const SelectCurrency = ({
  value,
  currencies,
  display = 'label',
  onChange,
  open,
  setOpen,
  ...props
}: Omit<ComponentProps<typeof Combobox.Trigger>, 'onChange' | 'value'> & {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  value?: CurrencyCode;
  currencies?: readonly CurrencyCode[];
  display?: 'icon' | 'label' | 'code';
  onChange?: (value: CurrencyCode) => void;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'currency' });
  const [ownOpen, setOwnOpen] = useState(false);

  return (
    <Popover modal open={open ?? ownOpen} onOpenChange={setOpen ?? setOwnOpen}>
      <Combobox.Trigger {...props}>
        {value ? (
          <CurrencyDisplay code={value} variant={display} />
        ) : (
          <Combobox.Value placeholder={t('select', 'Select currency')} />
        )}
      </Combobox.Trigger>
      <Combobox.Content>
        <SelectCurrencyCommand
          currencies={currencies}
          value={value}
          onSelect={(code) => {
            onChange?.(code);
            setOpen?.(false);
            setOwnOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
};

/**
 * An amount and its currency: an amount input and a currency picker.
 * `ValueInput` types the amount, `SelectCurrency` picks the currency (from `currencies`, an
 * organisation's), `SelectCurrencyCommand` is the list alone.
 */
export const CurrencyField = Object.assign(CurrencyFieldRoot, {
  ValueInput: CurrencyValueInput,
  SelectCurrency,
  SelectCurrencyCommand,
});
