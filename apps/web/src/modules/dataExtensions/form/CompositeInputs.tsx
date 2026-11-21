import {
  DataExtensionAddress,
  DataExtensionCurrency,
  DataExtensionFullName,
  DataExtensionLink,
} from '@erxes/core-contract/dataExtensionValues';
import { Input, StringArrayInput } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { numberOf, type ValueInputProps } from './inputProps';

/** An amount and its currency (the field's, or USD). */
export const CurrencyValueInput = ({ field, value, onChange, id, disabled }: ValueInputProps) => {
  const { t } = useTranslation('data', { keyPrefix: 'form' });
  const parsed = DataExtensionCurrency.safeParse(value);
  const [text, setText] = useState(parsed.data ? String(parsed.data.amount) : '');

  const [currency, setCurrency] = useState(
    parsed.data?.currency ?? field.settings.currency ?? 'USD',
  );

  const change = (amountText: string, code: string) => {
    setText(amountText);
    setCurrency(code.toUpperCase());

    const amount = numberOf(amountText);

    onChange(amount === null ? null : { amount, currency: code.toUpperCase() });
  };

  return (
    <div className="flex gap-2">
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        value={text}
        disabled={disabled}
        onChange={(event) => change(event.target.value, currency)}
      />
      <Input
        className="w-20"
        aria-label={t('currency', 'Currency')}
        value={currency}
        maxLength={3}
        disabled={disabled}
        onChange={(event) => change(text, event.target.value)}
      />
    </div>
  );
};

/** An object's text parts as inputs, side by side or stacked; empty when every part is. */
const PartsInput = <K extends string>({
  parts,
  labels,
  current,
  onChange,
  id,
  disabled,
  extra = {},
}: {
  parts: readonly K[];
  labels: Record<K, string>;
  current: Partial<Record<K, string | null>>;
  onChange: ValueInputProps['onChange'];
  id: string;
  disabled?: boolean;
  /** Parts kept as they are (an address's map point). */
  extra?: Record<string, number | null>;
}) => {
  const change = (part: K, text: string) => {
    const next = { ...current, [part]: text || null };
    const empty = parts.every((key) => !next[key]);

    onChange(
      empty
        ? null
        : { ...Object.fromEntries(parts.map((key) => [key, next[key] ?? null])), ...extra },
    );
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {parts.map((part, index) => (
        <Input
          key={part}
          id={index === 0 ? id : undefined}
          aria-label={labels[part]}
          placeholder={labels[part]}
          value={current[part] ?? ''}
          disabled={disabled}
          onChange={(event) => change(part, event.target.value)}
        />
      ))}
    </div>
  );
};

const NAME_PARTS = ['firstName', 'lastName'] as const;

export const FullNameValueInput = ({ value, onChange, id, disabled }: ValueInputProps) => {
  const { t } = useTranslation('data', { keyPrefix: 'form' });

  return (
    <PartsInput
      parts={NAME_PARTS}
      labels={{ firstName: t('first-name', 'First name'), lastName: t('last-name', 'Last name') }}
      current={DataExtensionFullName.safeParse(value).data ?? {}}
      onChange={onChange}
      id={id}
      disabled={disabled}
    />
  );
};

const ADDRESS_PARTS = ['street', 'street2', 'city', 'state', 'postalCode', 'country'] as const;

export const AddressValueInput = ({ value, onChange, id, disabled }: ValueInputProps) => {
  const { t } = useTranslation('data', { keyPrefix: 'form' });
  const address = DataExtensionAddress.safeParse(value).data;

  return (
    <PartsInput
      parts={ADDRESS_PARTS}
      labels={{
        street: t('street', 'Street'),
        street2: t('street2', 'Apartment, suite'),
        city: t('city', 'City'),
        state: t('state', 'State or province'),
        postalCode: t('postal-code', 'Postal code'),
        country: t('country', 'Country'),
      }}
      current={address ?? {}}
      onChange={onChange}
      id={id}
      disabled={disabled}
      extra={{ lat: address?.lat ?? null, lng: address?.lng ?? null }}
    />
  );
};

/** Emails, phones or links: the first is the primary one. Links keep their labels. */
const PrimaryAndMore = z.object({
  primary: z.unknown(),
  additional: z.array(z.unknown()),
});

const textItem = (item: unknown) => {
  const link = DataExtensionLink.safeParse(item).data;

  if (link) return link.url;

  return typeof item === 'string' ? item : '';
};

export const ListValueInput = ({ field, value, onChange, id, disabled }: ValueInputProps) => {
  const list = PrimaryAndMore.safeParse(value).data;
  const items = list ? [list.primary, ...list.additional].map(textItem).filter(Boolean) : [];
  const links = field.type === 'links';

  const change = (next: string[]) => {
    const [primary, ...additional] = next.map((text) =>
      links ? { url: text, label: null } : text,
    );

    onChange(primary === undefined ? null : { primary, additional });
  };

  return (
    <StringArrayInput
      id={id}
      value={items}
      placeholder={field.settings.placeholder}
      onValueChange={(next) => !disabled && change(next)}
    />
  );
};
