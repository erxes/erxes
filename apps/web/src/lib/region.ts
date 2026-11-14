import { COUNTRIES } from '@erxes/core-contract';

export interface RegionOption {
  value: string;
  label: string;
}

/** Names codes in `language` ("MN" → "Mongolia"); the code itself when the browser can't. */
const namer = (language: string, type: 'region' | 'currency') => {
  let names: Intl.DisplayNames | null = null;

  try {
    names = new Intl.DisplayNames(language, { type });
  } catch {
    // A language the browser has no names for.
  }

  return (code: string) => names?.of(code) ?? code;
};

/** "Mongolia and Kazakhstan": the countries' names as one phrase in `language`. */
export const countryNames = (codes: string[], language: string) =>
  new Intl.ListFormat(language, { type: 'conjunction' }).format(
    codes.map(namer(language, 'region')),
  );

/** Every country: Mongolia first, then by name. */
export const countryOptions = (language: string): RegionOption[] => {
  const name = namer(language, 'region');

  return COUNTRIES.map((code) => ({ value: code, label: name(code) })).toSorted(
    (a, b) =>
      Number(b.value === 'MN') - Number(a.value === 'MN') ||
      a.label.localeCompare(b.label, language),
  );
};

/** Every currency the browser knows, by code: "MNT · Mongolian Tugrik". */
export const currencyOptions = (language: string): RegionOption[] => {
  const name = namer(language, 'currency');

  return Intl.supportedValuesOf('currency').map((code) => ({
    value: code,
    label: `${code} · ${name(code)}`,
  }));
};
