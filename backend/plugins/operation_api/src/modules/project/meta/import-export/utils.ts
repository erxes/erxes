import { cleanDescription } from '~/utils/formatters';

/**
 * Default formatter for project fields during export.
 * 
 * @param value - The raw field value.
 * @returns The formatted string representation of the value.
 */
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
