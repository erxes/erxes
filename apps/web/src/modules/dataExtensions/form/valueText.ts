import type { DataExtensionField } from '@erxes/core-contract';
import {
  DataExtensionAddress,
  DataExtensionCurrency,
  DataExtensionFile,
  DataExtensionFullName,
  DataExtensionLink,
} from '@erxes/core-contract/dataExtensionValues';
import { useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { Value } from '../values';

type Format = ReturnType<typeof useFormat>;

/** What a value reads as needs its field's type, and a select's option labels. */
type FieldOfValue = Pick<DataExtensionField, 'type'> & Partial<Pick<DataExtensionField, 'options'>>;

const List = z.object({ primary: z.unknown(), additional: z.array(z.unknown()) });

const itemText = (item: unknown) => {
  const link = DataExtensionLink.safeParse(item).data;

  if (link) return link.label ?? link.url;

  return typeof item === 'string' ? item : '';
};

const optionLabel = (field: FieldOfValue, value: string) =>
  field.options?.find((option) => option.value === value)?.label ?? value;

const ADDRESS_PARTS = ['street', 'street2', 'city', 'state', 'postalCode', 'country'] as const;

/** Composite values (currency, names, addresses, lists, files) as one line; '' when unknown. */
const compositeText = (field: FieldOfValue, value: Value, format: Format): string => {
  const currency = DataExtensionCurrency.safeParse(value).data;

  if (field.type === 'currency' && currency) {
    return format.currency(currency.amount, currency.currency);
  }

  const name = DataExtensionFullName.safeParse(value).data;

  if (field.type === 'fullName' && name) {
    return [name.firstName, name.lastName].filter(Boolean).join(' ');
  }

  const address = DataExtensionAddress.safeParse(value).data;

  if (field.type === 'address' && address) {
    return ADDRESS_PARTS.map((part) => address[part])
      .filter(Boolean)
      .join(', ');
  }

  const list = List.safeParse(value).data;

  if (list) return [list.primary, ...list.additional].map(itemText).filter(Boolean).join(', ');

  const files = z.array(DataExtensionFile).safeParse(value).data;

  if (files) return files.map((file) => file.name).join(', ');

  return JSON.stringify(value);
};

const valueText = (
  field: FieldOfValue,
  value: Value | undefined,
  format: Format,
  words: { yes: string; no: string },
): string => {
  if (value === null || value === undefined || value === '') return '—';

  if (typeof value === 'boolean') return value ? words.yes : words.no;

  if (typeof value === 'number') {
    if (field.type === 'percent') return `${format.number(value)}%`;

    if (field.type === 'rating') return '★'.repeat(value);

    return format.number(value);
  }

  if (typeof value === 'string') {
    if (field.type === 'select') return optionLabel(field, value);

    if (field.type === 'date') return format.date(value);

    if (field.type === 'dateTime') return format.dateTime(value);

    return value;
  }

  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value.length ? value.map((item) => optionLabel(field, item)).join(', ') : '—';
  }

  return compositeText(field, value, format) || '—';
};

/** A value as text, in the member's language: `—` when empty. */
export const useValueText = () => {
  const format = useFormat();
  const { t } = useTranslation('data', { keyPrefix: 'form' });
  const words = { yes: t('yes', 'Yes'), no: t('no', 'No') };

  return (field: FieldOfValue, value: Value | undefined) => valueText(field, value, format, words);
};
