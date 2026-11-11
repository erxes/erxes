import { AsYouType, CountryCode } from 'libphonenumber-js';

export const formatPhoneNumber = ({
  defaultCountry,
  value,
}: {
  defaultCountry?: CountryCode;
  value: string;
}): string => {
  return new AsYouType({ defaultCountry: defaultCountry }).input(value);
};
