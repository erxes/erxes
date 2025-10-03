import React, { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { Combobox, Command, Input, Popover } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';
import { CountryPhoneCodes } from 'erxes-ui/constants/CountryPhoneCodes';
import { TCountryCode } from 'erxes-ui/types';
import { formatPhoneNumber } from 'erxes-ui/utils/format';
import { phoneSchema } from 'erxes-ui/modules/inputs/validations/phoneValidation';

interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange'
  > {
  value?: string;
  onChange?: (value: string, defaultCountryCode: CountryCode) => void;
  className?: string;
  defaultCountry?: CountryCode;
  placeholder?: string;
  onEnter?: (phone: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

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
      ...props
    },
    ref,
  ) => {
    const defaultCountryCode =
      defaultCountry || (CountryPhoneCodes[0].code as CountryCode);

    let parsedNumber;
    try {
      parsedNumber = parsePhoneNumberFromString(value || '', {
        defaultCountry: defaultCountryCode,
      });
    } catch {
      parsedNumber = null;
    }

    const initialCountry = parsedNumber?.country || defaultCountryCode;
    const [selectedCountry, setSelectedCountry] = useState<TCountryCode>(
      CountryPhoneCodes.find((c) => c.code === initialCountry) ||
        CountryPhoneCodes[0],
    );

    const initialValue = value
      ? parsedNumber
        ? parsedNumber.formatInternational()
        : value
      : selectedCountry.dial_code;
    const [phoneNumber, setPhoneNumber] = useState<string>(() =>
      formatPhoneNumber({ value: initialValue || selectedCountry.dial_code }),
    );

    const [open, setOpen] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<string>('');

    const validatePhone = (phone: string) => {
      const cleanPhone = phone.replace(/[\s\-\()]/g, '');

      try {
        phoneSchema.parse({ phone: cleanPhone });
        setValidationError('');
        onValidationChange?.(true);
        return true;
      } catch (error: any) {
        const errorMessage =
          error.errors?.[0]?.message || 'Invalid phone number';
        setValidationError(errorMessage);
        onValidationChange?.(false, errorMessage);
        return false;
      }
    };

    const handleSelect = (phoneCode: string) => {
      const country = CountryPhoneCodes.find((c) => c.dial_code === phoneCode);
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(country.dial_code);
      }
      setOpen(false);
      if (ref && typeof ref !== 'function' && 'current' in ref) {
        ref.current?.focus();
      }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;
      if (!input.startsWith('+')) {
        input = '+' + input;
      }

      let parsedNumber;
      try {
        parsedNumber = parsePhoneNumberFromString(input);
      } catch {
        parsedNumber = null;
      }

      let countryToUse = selectedCountry;
      const countryCode = parsedNumber?.country;
      if (countryCode) {
        const newCountry = CountryPhoneCodes.find(
          (c) => c.code === countryCode,
        );
        if (newCountry) {
          setSelectedCountry(newCountry);
          countryToUse = newCountry;
        }
      }

      const formattedPhone = formatPhoneNumber({
        defaultCountry: countryToUse.code as CountryCode,
        value: input,
      });

      setPhoneNumber(formattedPhone);

      const cleanInput = input.replace(/[a-zA-Z\s]/g, '');
      validatePhone(cleanInput);

      onChange?.(cleanInput, countryToUse.code as CountryCode);
    };
    const handleBlur = () => {
      if (!phoneNumber.startsWith('+')) {
        const updatedNumber = '+' + phoneNumber;
        setPhoneNumber(updatedNumber);
        const cleanNumber = updatedNumber.replace(/[a-zA-Z\s]/g, '');
        validatePhone(cleanNumber);
        onChange?.(cleanNumber, selectedCountry.code as CountryCode);
      } else {
        validatePhone(phoneNumber.replace(/[a-zA-Z\s]/g, ''));
      }
    };
    return (
      <div className={'flex items-center justify-start rounded gap-1'}>
        <Popover open={open} onOpenChange={setOpen}>
          <Combobox.TriggerBase
            variant="secondary"
            aria-expanded={open}
            className={cn(
              'text-xl w-8 px-0 justify-center shadow-xs',
              className,
            )}
          >
            {selectedCountry.flag}
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
                      onSelect={() => handleSelect(country.dial_code)}
                      className="flex items-center justify-between px-2 py-1.5"
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{country.flag}</span>
                        <span className="text-sm">{country.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {country.dial_code}
                        </span>
                      </div>
                      {selectedCountry.code === country.code && (
                        <IconCheck className="size-4" />
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover>
        <div className="flex-1">
          <Input
            value={phoneNumber}
            onChange={handlePhoneChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            ref={ref}
            className={cn(
              'bg-accent',
              validationError &&
                'border-destructive focus-visible:ring-destructive',
              className,
            )}
            type="tel"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onEnter?.(value || '');
                e.preventDefault();
              }
              if (props.onKeyDown) {
                props.onKeyDown(e);
              }
            }}
            {...props}
          />
        </div>
      </div>
    );
  },
);

PhoneInput.displayName = 'PhoneInput';
