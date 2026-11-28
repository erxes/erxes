import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconCheck } from '@tabler/icons-react';
import { Combobox } from 'erxes-ui/components/combobox';
import { Command } from 'erxes-ui/components/command';
import { Input } from 'erxes-ui/components/input';
import { Popover } from 'erxes-ui/components/popover';
import { cn } from 'erxes-ui/lib/utils';
import type { CountryCode } from 'libphonenumber-js';
import type { PhoneCountry } from 'erxes-ui/constants/CountryPhoneCodes';
import { formatPhoneNumber, usePhoneLib } from 'erxes-ui/utils/format/formatPhoneNumber';
import { phoneSchema } from 'erxes-ui/modules/inputs/validations/phoneValidation';

interface PhoneInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value?: string;
  onChange?: (value: string, defaultCountryCode: CountryCode | undefined) => void;
  className?: string;
  /** `secondary`: on a muted fill without a border, as in the phone list's popover. */
  variant?: 'default' | 'secondary';
  /** The flag shown until the number names a country. */
  defaultCountry?: CountryCode;
  placeholder?: string;
  onEnter?: (phone: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

const withPlus = (value: string) => (value.startsWith('+') ? value : `+${value}`);

const withoutLetters = (value: string) => value.replace(/[a-zA-Z\s]/g, '');

type PhoneLib = NonNullable<ReturnType<typeof usePhoneLib>>;

const findCountry = (lib: PhoneLib, code?: CountryCode) =>
  lib.CountryPhoneCodes.find((country) => country.code === code);

/** The country and formatted text the input starts with. */
const parseInitialPhone = (lib: PhoneLib, value?: string, defaultCountry?: CountryCode) => {
  const text = value ? withPlus(value) : '';
  const parsed = lib.parsePhoneNumberFromString(text);

  return {
    country: findCountry(lib, parsed?.country ?? defaultCountry),
    text: formatPhoneNumber({ value: parsed?.formatInternational() ?? text }),
  };
};

const CountrySelect = ({
  countries,
  selected,
  onSelect,
  variant,
}: {
  /** Missing until the phone library loads: the picker's place stays empty. */
  countries?: PhoneCountry[];
  selected?: PhoneCountry;
  onSelect: (country: PhoneCountry) => void;
  variant: PhoneInputProps['variant'];
}) => {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation('ui', { keyPrefix: 'phone' });
  const regionNames = new Intl.DisplayNames([i18n.language], { type: 'region' });
  const nameOf = (country: PhoneCountry) => regionNames.of(country.code) ?? country.name;

  if (!countries) return <span className="w-8 shrink-0" aria-hidden="true" />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.TriggerBase
        variant={variant === 'secondary' ? 'secondary' : 'outline'}
        size="icon"
        aria-expanded={open}
        aria-label={t('country', 'Country code: {{country}}', {
          country: selected ? nameOf(selected) : '',
        })}
        className="w-8"
      >
        <span className="text-xl">{selected?.flag}</span>
      </Combobox.TriggerBase>
      <Popover.Content variant="flush" className="w-56" align="start">
        <Command>
          <Command.Input placeholder={t('search-country', 'Search country…')} className="h-9" />
          <Command.List className="max-h-75 overflow-auto">
            <Command.Group>
              {countries.map((country) => (
                <Command.Item
                  key={country.code}
                  value={`${nameOf(country)} ${country.name}`}
                  onSelect={() => {
                    onSelect(country);
                    setOpen(false);
                  }}
                  className="justify-between"
                >
                  <div className="flex items-center">
                    <span className="mr-2">{country.flag}</span>
                    <span className="text-sm">{nameOf(country)}</span>
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
  const { t } = useTranslation('ui', { keyPrefix: 'phone' });

  const messages: Partial<Record<string, string>> = {
    too_small: t('too-short', 'Phone number must be at least 8 characters'),
    too_big: t('too-long', 'Phone number must not exceed 16 characters'),
    invalid_format: t('format', 'Phone number can only contain digits and + prefix'),
  };

  const validate = (phone: string) => {
    const result = phoneSchema.safeParse({ phone: phone.replace(/[\s\-()]/g, '') });
    const code = result.error?.issues[0]?.code;

    const message = result.success
      ? ''
      : ((code && messages[code]) ?? t('invalid', 'Invalid phone number'));

    setValidationError(message);
    onValidationChange?.(result.success, message || undefined);
  };

  return { validationError, validate };
};

/**
 * The phone library, and the country and text the input shows: the stored number until the
 * library is in, then the number read with its country and formatting.
 */
const usePhoneText = (value?: string, defaultCountry?: CountryCode) => {
  const lib = usePhoneLib();
  const [parsedWith, setParsedWith] = useState<PhoneLib | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>();
  const [phoneNumber, setPhoneNumber] = useState(value ? withPlus(value) : '');

  if (lib && parsedWith !== lib) {
    const initial = parseInitialPhone(lib, value, defaultCountry);

    setParsedWith(lib);
    setSelectedCountry(initial.country);
    setPhoneNumber(initial.text);
  }

  return { lib, selectedCountry, setSelectedCountry, phoneNumber, setPhoneNumber };
};

/**
 * A phone input with a country flag picker that formats as you type.
 * It validates on change and blur and reports through `onValidationChange`; `onChange` gets
 * the number and its country code. The phone library loads with the first one shown: until it
 * has, for a moment, the input shows the number as stored and takes no typing, and the flag
 * picker appears beside it once it has.
 */
export const PhoneInput = ({
  ref,
  value,
  onChange,
  className,
  defaultCountry,
  placeholder,
  onEnter,
  onValidationChange,
  onKeyDown,
  onBlur,
  variant,
  ...props
}: PhoneInputProps & React.RefAttributes<HTMLInputElement>) => {
  const { lib, selectedCountry, setSelectedCountry, phoneNumber, setPhoneNumber } = usePhoneText(
    value,
    defaultCountry,
  );

  const { validationError, validate } = usePhoneValidation(onValidationChange);

  const handleSelect = (country: PhoneCountry) => {
    setSelectedCountry(country);
    setPhoneNumber(country.dial_code);

    if (ref && typeof ref === 'object') {
      ref.current?.focus();
    }
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!lib) return;
    const input = withPlus(event.target.value);

    const country =
      findCountry(lib, lib.parsePhoneNumberFromString(input)?.country) ?? selectedCountry;

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
    <div className={cn('flex items-center justify-start rounded gap-1', className)}>
      <CountrySelect
        countries={lib?.CountryPhoneCodes}
        selected={selectedCountry}
        onSelect={handleSelect}
        variant={variant}
      />
      <div className="flex-1">
        <Input
          {...props}
          readOnly={!lib || props.readOnly}
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          ref={ref}
          variant={variant}
          aria-invalid={!!validationError}
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
};
