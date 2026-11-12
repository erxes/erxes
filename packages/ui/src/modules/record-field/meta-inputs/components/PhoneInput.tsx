import React, { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { Combobox } from 'erxes-ui/components/combobox';
import { Command } from 'erxes-ui/components/command';
import { Input } from 'erxes-ui/components/input';
import { Popover } from 'erxes-ui/components/popover';
import { cn } from 'erxes-ui/lib/utils';
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { CountryPhoneCodes, type PhoneCountry } from 'erxes-ui/constants/CountryPhoneCodes';
import { formatPhoneNumber } from 'erxes-ui/utils/format/formatPhoneNumber';
import { phoneSchema } from 'erxes-ui/modules/inputs/validations/phoneValidation';

interface PhoneInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value?: string;
  onChange?: (value: string, defaultCountryCode: CountryCode | undefined) => void;
  className?: string;
  /** The flag shown until the number names a country. */
  defaultCountry?: CountryCode;
  placeholder?: string;
  onEnter?: (phone: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

const withPlus = (value: string) => (value.startsWith('+') ? value : `+${value}`);

const withoutLetters = (value: string) => value.replace(/[a-zA-Z\s]/g, '');

const findCountry = (code?: CountryCode) =>
  CountryPhoneCodes.find((country) => country.code === code);

/** The country and formatted text the input starts with. */
const parseInitialPhone = (value?: string, defaultCountry?: CountryCode) => {
  const text = value ? withPlus(value) : '';
  const parsed = parsePhoneNumberFromString(text);

  return {
    country: findCountry(parsed?.country ?? defaultCountry),
    text: formatPhoneNumber({ value: parsed?.formatInternational() ?? text }),
  };
};

const CountrySelect = ({
  selected,
  onSelect,
  className,
}: {
  selected?: PhoneCountry;
  onSelect: (country: PhoneCountry) => void;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.TriggerBase
        variant="secondary"
        aria-expanded={open}
        className={cn('text-xl w-8 px-0 justify-center shadow-xs', className)}
      >
        {selected?.flag}
      </Combobox.TriggerBase>
      <Popover.Content className="w-56 p-0" align="start">
        <Command>
          <Command.Input placeholder="Search country..." className="h-9" />
          <Command.List className="max-h-[300px] overflow-auto">
            <Command.Group>
              {CountryPhoneCodes.map((country) => (
                <Command.Item
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onSelect(country);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between px-2 py-1.5"
                >
                  <div className="flex items-center">
                    <span className="mr-2">{country.flag}</span>
                    <span className="text-sm">{country.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">{country.dial_code}</span>
                  </div>
                  {selected?.code === country.code && <IconCheck className="size-4" />}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};

/** Validates on change and blur, keeps the message for the input's error style. */
const usePhoneValidation = (onValidationChange: PhoneInputProps['onValidationChange']) => {
  const [validationError, setValidationError] = useState('');

  const validate = (phone: string) => {
    const result = phoneSchema.safeParse({ phone: phone.replace(/[\s\-()]/g, '') });

    const message = result.success
      ? ''
      : (result.error.issues[0]?.message ?? 'Invalid phone number');

    setValidationError(message);
    onValidationChange?.(result.success, message || undefined);
  };

  return { validationError, validate };
};

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      className,
      defaultCountry,
      placeholder,
      onEnter,
      onValidationChange,
      onKeyDown,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [initial] = useState(() => parseInitialPhone(value, defaultCountry));
    const [selectedCountry, setSelectedCountry] = useState(initial.country);
    const [phoneNumber, setPhoneNumber] = useState(initial.text);
    const { validationError, validate } = usePhoneValidation(onValidationChange);

    const handleSelect = (country: PhoneCountry) => {
      setSelectedCountry(country);
      setPhoneNumber(country.dial_code);

      if (ref && typeof ref === 'object') {
        ref.current?.focus();
      }
    };

    const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = withPlus(event.target.value);
      const country = findCountry(parsePhoneNumberFromString(input)?.country) ?? selectedCountry;
      const phone = withoutLetters(input);

      setSelectedCountry(country);
      setPhoneNumber(formatPhoneNumber({ defaultCountry: country?.code, value: input }));
      validate(phone);
      onChange?.(phone, country?.code);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      const text = withPlus(phoneNumber);

      if (text !== phoneNumber) {
        setPhoneNumber(text);
        onChange?.(withoutLetters(text), selectedCountry?.code);
      }

      validate(withoutLetters(text));
      onBlur?.(event);
    };

    return (
      <div className="flex items-center justify-start rounded gap-1">
        <CountrySelect selected={selectedCountry} onSelect={handleSelect} className={className} />
        <div className="flex-1">
          <Input
            {...props}
            value={phoneNumber}
            onChange={handlePhoneChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            ref={ref}
            className={cn(
              'bg-accent',
              validationError && 'border-destructive focus-visible:ring-destructive',
              className,
            )}
            type="tel"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onEnter?.(value ?? '');
                event.preventDefault();
              }

              onKeyDown?.(event);
            }}
          />
        </div>
      </div>
    );
  },
);

PhoneInput.displayName = 'PhoneInput';
