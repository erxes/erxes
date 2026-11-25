import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { MONGOLIAN_BANKS } from '@erxes/core-contract/mongolianBanks';
import { ChoiceSelect } from './ChoiceSelect';
import options from './quickQrOptions.json';

/** QuickQR's codes for a merchant: business (MCC), city or aimag (erxes 3.x's lists), and bank. */
const LISTS: Record<string, { value: string; label: string }[]> = {
  mccCode: options.mcc.map((item) => ({
    value: item.value,
    label: `${item.value} · ${item.label}`,
  })),
  city: options.cities,
  bankCode: MONGOLIAN_BANKS.map((bank) => ({ value: bank.code, label: bank.name })),
};

/** Whether the setting is picked from a list rather than typed. */
export const isQuickQrChoice = (key: string) => key in LISTS || key === 'district';

/** The names a merchant must give, by its type: never shown as optional. */
export const isQuickQrName = (key: string) =>
  key === 'businessName' || key === 'firstName' || key === 'lastName';

/** As in 3.x: a company's name, or a person's first and last name, for the merchant type picked. */
export const quickQrHides = (key: string, values: Record<string, string | boolean>) =>
  values.merchantType === 'company'
    ? key === 'firstName' || key === 'lastName'
    : values.merchantType === 'person'
      ? key === 'businessName'
      : key === 'businessName' || key === 'firstName' || key === 'lastName';

/** The city's districts, from QuickQR (through core's vendor account). */
const DistrictSelect = ({
  id,
  city,
  value,
  onChange,
}: {
  id: string;
  city: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });

  const districts = useQuery({
    ...orpc.payments.quickQrDistricts.queryOptions({ input: { city } }),
    enabled: city !== '',
  });

  const choices = (districts.data?.data ?? []).map((item) => ({
    value: item.code,
    label: item.name,
  }));

  return (
    <>
      <ChoiceSelect
        searchable
        id={id}
        choices={choices}
        value={value}
        disabled={city === '' || districts.isPending}
        placeholder={
          city === ''
            ? t('quickqr-city-first', 'Choose the city first')
            : t('quickqr-district', 'Choose the district')
        }
        onChange={onChange}
      />
      {districts.isError && (
        <p className="text-xs text-destructive">
          {t('quickqr-districts-failed', 'Could not load the districts from QuickQR.')}{' '}
          {messageOf(districts.error)}
        </p>
      )}
    </>
  );
};

/** A QuickQR code picked from its list; districts follow the chosen city. */
export const QuickQrChoice = ({
  id,
  field,
  values,
  onChange,
}: {
  id: string;
  field: string;
  values: Record<string, string | boolean>;
  onChange: (key: string, value: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const text = (key: string) => (typeof values[key] === 'string' ? values[key] : '');

  if (field === 'district')
    return (
      <DistrictSelect
        id={id}
        city={text('city')}
        value={text('district')}
        onChange={(value) => onChange('district', value)}
      />
    );

  return (
    <ChoiceSelect
      searchable
      id={id}
      choices={LISTS[field] ?? []}
      value={text(field)}
      placeholder={t('choose', 'Choose')}
      onChange={(value) => {
        onChange(field, value);

        // Another city's districts differ.
        if (field === 'city') onChange('district', '');
      }}
    />
  );
};
