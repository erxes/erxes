/**
 * Phone number normalisation shared by every channel that identifies a contact
 * by phone number (call/SIP, WhatsApp, SMS, ...).
 *
 * Why this exists: contact de-duplication goes through
 * `receiveInboxMessage('get-create-update-customer', { primaryPhone })`, which
 * matches on an EXACT string. Providers disagree about formatting for the same
 * human — WhatsApp Cloud API sends bare E.164 digits (`919876543210`), a PBX may
 * send national format (`09876543210`), and users type `+91 98765-43210`. Without
 * a single canonical form each spelling creates a separate customer record.
 *
 * There is no unique index on `primaryPhone`, so nothing downstream will catch a
 * mismatch for us.
 */

/** Digits only, with an optional leading `+`. */
const NON_DIAL_CHARS = /[^\d+]/g;

/** `x123`, `ext 45`, `extension 45` — anything after this is not the subscriber. */
const EXTENSION_SEPARATOR = /\s*(?:ext(?:ension)?\.?|x|#|,|;)\s*\d/i;

/** A trunk `0` written in brackets inside an international number: `+44 (0)20`. */
const WRITTEN_TRUNK_PREFIX = /\(\s*0\s*\)/g;

/**
 * National (subscriber) number length for country codes with a single fixed
 * length. Used only to tell `<country code><number>` apart from a national
 * number that happens to begin with the same digits — an Indian mobile may
 * start `91`, which is also India's country code.
 *
 * Deliberately tiny: a country belongs here only when every national number has
 * one length. Countries with variable-length numbering plans (UK, Germany, ...)
 * are left out and keep the previous prefix-only behaviour, which is unchanged
 * for them.
 */
const NATIONAL_NUMBER_DIGITS: Record<string, number> = {
  91: 10, // India
  1: 10, // NANP (US, Canada, ...)
};

/**
 * Normalises a phone number to E.164 (`+` followed by digits).
 *
 * Deliberately dependency-free and conservative: it fixes the formatting
 * differences we actually see between providers (spaces, dashes, parentheses,
 * `00` international prefix, a national trunk `0`) and otherwise leaves the
 * number alone. It does NOT validate against per-country numbering plans — a
 * wrong-but-consistent value still de-duplicates correctly, whereas guessing
 * could merge two different people.
 *
 * @param raw - the number as the provider supplied it
 * @param defaultCountryCode - digits only, no `+` (e.g. `'91'`). Used only when
 *   the number carries no country code of its own; without it a national-format
 *   number is returned digits-only rather than being assigned a wrong country.
 * @returns the normalised number, or an empty string when there is nothing usable
 *
 * @example
 * normalizePhone('+91 98765-43210')       // '+919876543210'
 * normalizePhone('0091 9876543210')       // '+919876543210'
 * normalizePhone('09876543210', '91')     // '+919876543210'
 * normalizePhone('9876543210')            // '9876543210'  (no country code known)
 */
export const normalizePhone = (
  raw?: string | null,
  defaultCountryCode?: string,
): string => {
  if (!raw) {
    return '';
  }

  // An extension is a different endpoint behind the same subscriber number, and
  // providers rarely agree on whether to send it. Drop it so `+919876543210` and
  // `+919876543210 x123` do not become two contacts — keeping the digits would
  // instead glue them onto the subscriber number (`+919876543210123`).
  const withoutExtension = raw.trim().split(EXTENSION_SEPARATOR)[0];

  // A `(0)` written inside an international number is the national trunk prefix
  // shown for domestic dialling — `+44 (0)20 ...` is the same line as `+44 20
  // ...` and the `0` must not survive into E.164.
  const withoutWrittenTrunk = withoutExtension.replace(WRITTEN_TRUNK_PREFIX, '');

  // Keep a leading `+` but drop every other separator: spaces, dashes,
  // parentheses, dots, and any stray `+` that is not the first character.
  const cleaned = withoutWrittenTrunk.replace(NON_DIAL_CHARS, '');
  const hasPlus = cleaned.startsWith('+');
  const digits = cleaned.replace(/\+/g, '');

  // Nothing but zeroes (or nothing at all) identifies no one. Bail out before
  // any prefix handling, otherwise `'0'`/`'000'` would be turned into a bogus
  // `+<country>` that every such input would share.
  if (!digits || !/[1-9]/.test(digits)) {
    return '';
  }

  if (hasPlus) {
    return `+${digits}`;
  }

  // `00` is the international access prefix in much of the world — the digits
  // after it are already a country code.
  if (digits.startsWith('00')) {
    return `+${digits.slice(2)}`;
  }

  const country = (defaultCountryCode || '').replace(/\D/g, '');

  if (country) {
    // Exactly one leading `0` is the national trunk prefix and is dropped when
    // the number is written internationally. Only one: in several plans (Italy,
    // for instance) the digit after it belongs to the subscriber number.
    if (digits.startsWith('0')) {
      return `+${country}${digits.slice(1)}`;
    }

    // A number that merely STARTS WITH the country-code digits is not
    // necessarily international — plenty of national numbers legitimately do
    // (Indian mobiles beginning `91` are common, and `91` is also India's
    // country code). Stripping the prefix from one of those would store it a
    // country code short, so it would never match the same person's E.164 form.
    //
    // The two readings are told apart by length: a national number is
    // `nationalDigits` long, the same number with a country code is
    // `country.length + nationalDigits`. Only the latter is already
    // international.
    const nationalDigits = NATIONAL_NUMBER_DIGITS[country];
    const carriesCountryCode = nationalDigits
      ? digits.length === country.length + nationalDigits
      : digits.startsWith(country);

    if (digits.startsWith(country) && carriesCountryCode) {
      // Already carries its country code, just without the `+`.
      return `+${digits}`;
    }

    return `+${country}${digits}`;
  }

  // No country code available and none present in the number: return the bare
  // digits. Consistent, which is what de-duplication needs, even though it is
  // not strictly E.164.
  return digits;
};

/**
 * True when two phone numbers refer to the same subscriber once normalised.
 *
 * @param a - first number, in any format
 * @param b - second number, in any format
 * @param defaultCountryCode - see {@link normalizePhone}
 */
export const isSamePhone = (
  a?: string | null,
  b?: string | null,
  defaultCountryCode?: string,
): boolean => {
  const left = normalizePhone(a, defaultCountryCode);
  const right = normalizePhone(b, defaultCountryCode);

  return Boolean(left) && left === right;
};
