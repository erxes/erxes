import { cleanDescription } from '~/utils/formatters';

export const defaultProjectFieldFormatter = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.join('; ');
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
};

export { cleanDescription };
