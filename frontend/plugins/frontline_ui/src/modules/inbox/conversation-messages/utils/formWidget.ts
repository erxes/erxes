import { isRecord } from '@/shared/utils/isRecord';
import type { IFormWidgetItem } from '@/inbox/types/FormWidget';

const TICKET_FIELD_LABELS: Record<string, string> = {
  'ticket:name': 'Ticket name',
  'ticket:description': 'Description',
};

/** Retains submitted values and supplies optional display metadata for legacy rows. */
export const normalizeFormWidgetData = (data: unknown): IFormWidgetItem[] => {
  if (Array.isArray(data)) {
    return data.flatMap((item: unknown) => {
      if (!isRecord(item) || typeof item._id !== 'string') {
        return [];
      }

      return [
        {
          _id: item._id,
          type: typeof item.type === 'string' ? item.type : 'input',
          text: typeof item.text === 'string' ? item.text : item._id,
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

/** Displays text and choice arrays readably, safely serializing other JSON values. */
export const formatFormWidgetValue = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (
    Array.isArray(value) &&
    value.every((answer: unknown) => typeof answer === 'string')
  ) {
    return value.join(', ');
  }

  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '';
  }
};

/** Validates raw storage keys and HTTP(S) URLs without rewriting their contents. */
export const getFormWidgetResource = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.trim()) return undefined;

  const source = value;

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
