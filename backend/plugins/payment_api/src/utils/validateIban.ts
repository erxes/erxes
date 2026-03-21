import IBAN from 'iban';

export const validateIban = (iban?: string) => {
  if (!iban) return false;

  const normalized = iban.replace(/\s+/g, '').toUpperCase();

  // 1. Basic format
  if (!/^[A-Z0-9]+$/.test(normalized)) {
    return false;
  }

  // 2. Length check
  if (normalized.length < 15 || normalized.length > 34) {
    return false;
  }

  // 3. Real IBAN validation (checksum + country rules)
  return IBAN.isValid(normalized);
};
