import { isRecord } from '@/shared/utils/isRecord';
import type { IFormWidgetItem } from '@/inbox/types/FormWidget';

const TICKET_FIELD_LABELS: Record<string, string> = {
  'ticket:name': 'Ticket name',
  'ticket:description': 'Description',
};

export const normalizeFormWidgetData = (data: unknown): IFormWidgetItem[] => {
  if (Array.isArray(data)) {
    return data.flatMap((item: unknown) => {
      if (
        !isRecord(item) ||
        typeof item._id !== 'string' ||
        typeof item.type !== 'string' ||
        typeof item.text !== 'string'
      ) {
        return [];
      }

      return [
        {
          _id: item._id,
          type: item.type,
          text: item.text,
          value: item.value,
          column:
            typeof item.column === 'number' &&
            Number.isInteger(item.column) &&
            item.column >= 1 &&
            item.column <= 6
              ? item.column
              : 6,
        },
      ];
    });
  }

  if (!isRecord(data)) return [];

  return Object.entries(data).map(([key, value]) => ({
    _id: key,
    type: key === 'ticket:description' ? 'textarea' : 'input',
    text: Object.prototype.hasOwnProperty.call(TICKET_FIELD_LABELS, key)
      ? TICKET_FIELD_LABELS[key]
      : key,
    value,
    column: 6,
  }));
};

export const formatFormWidgetValue = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;

  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '';
  }
};

export const getFormWidgetResource = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.trim()) return undefined;

  let source = value.trim();
  // Public URLs may be signed; only stored keys need URI decoding.
  if (!/^https?:\/\//i.test(source) && !source.startsWith('/')) {
    try {
      source = decodeURIComponent(source);
    } catch {
      // Stored filenames may contain a literal percent sign.
    }
  }

  if (!source.trim()) return undefined;

  try {
    // readImage encodes storage keys and cannot accept unpaired UTF-16 surrogates.
    encodeURIComponent(source);
    const url = new URL(source, 'https://form-resource.invalid');
    if (url.protocol === 'http:' || url.protocol === 'https:') return source;
  } catch {
    return undefined;
  }

  return undefined;
};
