import countryToCurrency from 'country-to-currency';
import { z } from 'zod';

const isCountry = (code: string): code is keyof typeof countryToCurrency =>
  Object.hasOwn(countryToCurrency, code);

/** An ISO 3166-1 alpha-2 country code (`MN`, `US`, `DE`). */
export const Country = z
  .string()
  .trim()
  .toUpperCase()
  .refine(isCountry, 'an ISO 3166 country code, like MN or US');

/** An ISO 4217 currency code (`MNT`, `USD`, `EUR`). */
export const Currency = z
  .string()
  .trim()
  .toUpperCase()
  .refine(
    (code) => Intl.supportedValuesOf('currency').includes(code),
    'an ISO 4217 currency code, like MNT or USD',
  );

export type Currency = z.infer<typeof Currency>;

/** The currency a country uses, to suggest one when an organisation picks its country. */
export const currencyOfCountry = (country: string): string | null =>
  isCountry(country) ? countryToCurrency[country] : null;

/**
 * How many decimals a currency has (USD and MNT 2, JPY 0, KWD 3). Amounts are
 * integers in the currency's smallest unit: $12.50 → 1250, ¥500 → 500.
 */
export const currencyDigits = (currency: string): number =>
  new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
    .maximumFractionDigits ?? 2;
