/**
 * Converts empty string to undefined for optional fields
 * Prevents "Expected X, received null" errors in Zod validation
 */
export const toOptionalString = (
  value: string | undefined,
): string | undefined => {
  return value === '' ? undefined : value;
};

/**
 * Converts empty string or invalid input to undefined for optional number fields
 * Handles NaN and empty string cases
 */
export const toOptionalNumber = (
  value: string | number | undefined,
): number | undefined => {
  if (value === '' || value === undefined) {
    return undefined;
  }

  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isNaN(num) ? undefined : num;
};

/**
 * Converts empty string to undefined for required number fields
 * Returns number or undefined (let Zod handle validation)
 */
export const toRequiredNumber = toOptionalNumber;
