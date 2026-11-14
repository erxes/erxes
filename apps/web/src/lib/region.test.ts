import { CountryPhoneCodes } from 'erxes-ui/constants/CountryPhoneCodes';
import { describe, expect, it } from 'vite-plus/test';
import { countryOptions } from './region';

describe('country lists', () => {
  it('put Mongolia first, then every other country by name', () => {
    for (const language of ['en', 'mn']) {
      const [first, ...rest] = countryOptions(language);

      expect(first?.value).toBe('MN');
      expect(rest.map((option) => option.label)).toEqual(
        rest.map((option) => option.label).toSorted((a, b) => a.localeCompare(b, language)),
      );
    }

    const [firstPhone, ...restPhone] = CountryPhoneCodes;

    expect(firstPhone?.code).toBe('MN');
    expect(restPhone.map((country) => country.name)).toEqual(
      restPhone.map((country) => country.name).toSorted((a, b) => a.localeCompare(b)),
    );
  });
});
