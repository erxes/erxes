import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';
import type { TCountryCode } from 'erxes-ui/types/CountryCode';

export type PhoneCountry = TCountryCode & { code: CountryCode };

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

/** The flag emoji: each letter of the ISO 3166 code as a regional indicator symbol. */
const flagOf = (code: string) =>
  String.fromCodePoint(...Array.from(code, (letter) => 0x1f1a5 + letter.charCodeAt(0)));

/** Every country libphonenumber-js knows, with its English name and calling code, by name. */
export const CountryPhoneCodes: PhoneCountry[] = getCountries()
  .map((code) => ({
    code,
    name: regionNames.of(code) ?? code,
    flag: flagOf(code),
    dial_code: `+${getCountryCallingCode(code)}`,
  }))
  .toSorted((a, b) => a.name.localeCompare(b.name));
