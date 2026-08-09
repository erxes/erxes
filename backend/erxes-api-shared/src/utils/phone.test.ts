import { isSamePhone, normalizePhone } from './phone';

describe('phone', () => {
  describe('normalizePhone', () => {
    test.each([
      // [raw, defaultCountryCode, expected, description]
      ['+919876543210', undefined, '+919876543210', 'already E.164'],
      ['+91 98765-43210', undefined, '+919876543210', 'strips spaces and dashes'],
      ['  +44 20 7946 0958 ', undefined, '+442079460958', 'trims surrounding space'],
      ['(987) 654-3210', '1', '+19876543210', 'strips parentheses'],
      ['0091 9876543210', undefined, '+919876543210', '00 international prefix'],
      ['09876543210', '91', '+919876543210', 'drops national trunk 0'],
      ['919876543210', '91', '+919876543210', 'country code present without +'],
      ['9876543210', '91', '+919876543210', 'applies default country code'],
      ['9876543210', undefined, '9876543210', 'no country code known'],
      [
        '+44 (0)20 7946 0958',
        undefined,
        '+442079460958',
        'drops a written (0) trunk prefix',
      ],
      [
        '+919876543210 x123',
        undefined,
        '+919876543210',
        'drops an x extension',
      ],
      [
        '+91 9876543210 ext. 45',
        undefined,
        '+919876543210',
        'drops an ext. extension',
      ],
      [
        '9123456789',
        '91',
        '+919123456789',
        'national number starting with the country code digits',
      ],
      ['06 1234 5678', '39', '+39612345678', 'drops only one trunk zero'],
      ['', '91', '', 'empty string'],
      [undefined, '91', '', 'undefined'],
      [null, '91', '', 'null'],
      ['not a phone', '91', '', 'no digits at all'],
    ])(
      'normalizePhone(%p, %p) === %p — %s',
      (raw, countryCode, expected, _description) => {
        expect(
          normalizePhone(raw as string | null | undefined, countryCode),
        ).toBe(expected);
      },
    );

    test('is idempotent', () => {
      const once = normalizePhone('09876543210', '91');

      expect(normalizePhone(once, '91')).toBe(once);
    });

    test('de-duplicates the same subscriber across providers', () => {
      // WhatsApp Cloud API sends bare E.164 digits, a PBX sends national format.
      // Both must resolve to one customer record.
      expect(normalizePhone('919876543210', '91')).toBe(
        normalizePhone('09876543210', '91'),
      );
    });

    test('de-duplicates a national number that starts with the country code', () => {
      // Indian mobiles beginning `91` are common, and `91` is also the country
      // code — the national and E.164 spellings must still be one contact.
      expect(normalizePhone('9123456789', '91')).toBe(
        normalizePhone('919123456789', '91'),
      );
    });

    test('does not merge different subscribers', () => {
      expect(normalizePhone('09876543210', '91')).not.toBe(
        normalizePhone('09876543211', '91'),
      );
    });
  });

  describe('isSamePhone', () => {
    test.each([
      ['+919876543210', '09876543210', '91', true, 'same number, both formats'],
      ['919876543210', '+91 98765 43210', '91', true, 'spacing differences'],
      ['09876543210', '09876543211', '91', false, 'different subscribers'],
      ['', '09876543210', '91', false, 'empty is never a match'],
      ['', '', '91', false, 'two empties are not a match'],
    ])(
      'isSamePhone(%p, %p, %p) === %p — %s',
      (a, b, countryCode, expected, _description) => {
        expect(isSamePhone(a, b, countryCode)).toBe(expected);
      },
    );
  });
});
