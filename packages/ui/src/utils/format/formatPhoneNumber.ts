import type { CountryCode } from 'libphonenumber-js';
import { AsYouType } from 'libphonenumber-js';

/**
 * A phone number formatted as people write it, even half typed.
 * `defaultCountry` decides how a number without a `+` code reads.
 */
export const formatPhoneNumber = ({
  defaultCountry,
  value,
}: {
  defaultCountry?: CountryCode;
  value: string;
}): string => {
  return new AsYouType({ defaultCountry: defaultCountry }).input(value);
};
