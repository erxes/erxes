import {
  DATA_EXTENSION_ADDRESS_PARTS,
  DataExtensionValue,
  IDataExtensionCurrencyValue,
  IDataExtensionField,
  IDataExtensionFileValue,
  IDataExtensionLinkedRecord,
  IDataExtensionLinkValue,
} from '../types';

const formatNumber = (value: number, precision?: number, locale?: string) =>
  new Intl.NumberFormat(locale, {
    maximumFractionDigits: precision ?? 6,
    minimumFractionDigits: precision ?? 0,
  }).format(value);

/** One line of text for a value; used where a cell must stay compact. */
export const formatDataExtensionValue = (
  field: IDataExtensionField,
  value: DataExtensionValue,
  options: { locale?: string; links?: IDataExtensionLinkedRecord[] } = {},
): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const { locale, links } = options;
  const precision = field.settings?.precision;

  switch (field.type) {
    case 'number':
      return typeof value === 'number' ? formatNumber(value, precision, locale) : '';
    case 'percent':
      return typeof value === 'number'
        ? `${formatNumber(value, precision, locale)}%`
        : '';
    case 'currency': {
      const { amount, currency } = value as IDataExtensionCurrencyValue;

      if (typeof amount !== 'number') {
        return '';
      }

      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          maximumFractionDigits: precision ?? 2,
          minimumFractionDigits: precision ?? 0,
        }).format(amount);
      } catch {
        return `${formatNumber(amount, precision, locale)} ${currency}`;
      }
    }
    case 'rating':
      return typeof value === 'number'
        ? `${value}/${field.settings?.scale || 5}`
        : '';
    case 'date':
      return new Date(String(value)).toLocaleDateString(locale);
    case 'dateTime':
      return new Date(String(value)).toLocaleString(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    case 'boolean':
      return typeof value === 'boolean' ? (value ? '✓' : '—') : '';
    case 'select':
      return (
        field.options?.find((option) => option.value === value)?.label ||
        String(value)
      );
    case 'multiSelect':
      return (Array.isArray(value) ? value : [])
        .map(
          (item) =>
            field.options?.find((option) => option.value === item)?.label ||
            String(item),
        )
        .join(', ');
    case 'address': {
      const parts = value as Record<string, string>;

      return DATA_EXTENSION_ADDRESS_PARTS.map((part) => parts[part])
        .filter(Boolean)
        .join(', ');
    }
    case 'fullName': {
      const { firstName, lastName } = value as Record<string, string>;

      return [firstName, lastName].filter(Boolean).join(' ');
    }
    case 'links':
      return (value as IDataExtensionLinkValue[])
        .map((link) => link.label || link.url)
        .join(', ');
    case 'emails':
    case 'phones':
      return (value as string[]).join(', ');
    case 'files':
      return (value as IDataExtensionFileValue[])
        .map((file) => file.name)
        .join(', ');
    case 'member':
    case 'relation':
      return (links || []).map((linked) => linked.name).join(', ');
    case 'json':
      return JSON.stringify(value);
    default:
      return String(value);
  }
};

/**
 * Fields in their sections, in field order: ungrouped fields first, then
 * each group where its first field sits.
 */
export const groupFields = (fields: IDataExtensionField[]) => {
  const groups = new Map<string, IDataExtensionField[]>();

  for (const field of fields) {
    const group = field.settings?.group?.trim() || '';

    groups.set(group, [...(groups.get(group) || []), field]);
  }

  const ungrouped = groups.get('') || [];

  groups.delete('');

  return [
    ...(ungrouped.length ? [{ group: '', items: ungrouped }] : []),
    ...Array.from(groups, ([group, items]) => ({ group, items })),
  ];
};
