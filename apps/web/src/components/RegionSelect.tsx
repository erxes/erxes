import { cn, Combobox, Command, Popover } from 'erxes-ui';
import { type ComponentProps, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { countryOptions, currencyOptions, type RegionOption } from '~/lib/region';
import { timeZoneOptions } from '~/lib/timeZones';

interface SelectProps {
  id?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  /** The trigger's look, e.g. `ghost` for a side panel cell. */
  variant?: ComponentProps<typeof Combobox.Trigger>['variant'];
  className?: string;
  /** Only the code in the trigger ("MNT"), for a narrow field beside an amount. */
  short?: boolean;
}

/** A searchable list of options (by name or code), one of them chosen. */
const SearchSelect = ({
  id,
  value,
  disabled,
  onChange,
  variant,
  className,
  short,
  options,
  placeholder,
}: SelectProps & { options: RegionOption[]; placeholder: string }) => {
  const { t } = useTranslation('common', { keyPrefix: 'region' });
  const [open, setOpen] = useState(false);
  const chosen = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger
        id={id}
        variant={variant}
        className={cn('w-full', className)}
        disabled={disabled}
        title={short ? chosen?.label : undefined}
      >
        <Combobox.Value
          value={short ? value : (chosen?.label ?? value)}
          placeholder={placeholder}
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder={t('search', 'Search')} variant="secondary" focusOnMount />
          <Command.List className="max-h-72 overflow-y-auto">
            <Command.Empty>{t('no-match', 'Nothing matches')}</Command.Empty>
            {options.map((option) => (
              <Command.Item
                key={option.value}
                value={option.value}
                keywords={[option.label]}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="truncate">{option.label}</span>
                <Combobox.Check checked={option.value === value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

/** Every country, named in the UI's language. */
export const CountrySelect = (props: SelectProps) => {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'region' });

  return (
    <SearchSelect
      {...props}
      options={countryOptions(i18n.language)}
      placeholder={t('choose-country', 'Choose a country')}
    />
  );
};

/** Every IANA time zone, with today's UTC offset. */
export const TimeZoneSelect = (props: SelectProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'region' });
  const options = useMemo(() => timeZoneOptions(props.value), [props.value]);

  return (
    <SearchSelect
      {...props}
      options={options}
      placeholder={t('choose-time-zone', 'Choose a time zone')}
    />
  );
};

/** Every currency, by code with its name in the UI's language. */
export const CurrencySelect = (props: SelectProps) => {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'region' });

  return (
    <SearchSelect
      {...props}
      options={currencyOptions(i18n.language)}
      placeholder={t('choose-currency', 'Choose a currency')}
    />
  );
};
