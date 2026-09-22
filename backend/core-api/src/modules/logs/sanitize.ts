/**
 * Sanitizes log values before they leave the API: masks secrets, ids, emails,
 * IPs and phone numbers. Shared by the logs queries (log detail) and the
 * point-in-time revert resolver (conflict snapshots returned to the client).
 */

const SECRET_KEY_PATTERNS = [
  /password/i,
  /passcode/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /cookie/i,
  /api[-_]?key/i,
  /private[-_]?key/i,
];

const EMAIL_KEY_PATTERNS = [/email/i];
const IP_KEY_PATTERNS = [/(^|[_-])ip$/i, /ipAddress/i];
const PHONE_KEY_PATTERNS = [/phone/i, /mobile/i];
const NAME_KEY_PATTERNS = [
  /^firstName$/i,
  /^lastName$/i,
  /^middleName$/i,
  /fullName/i,
];
// Denormalized search blobs concatenate names/emails/phones for indexing. They
// are PII magnets and meaningless as a merge value, so redact them wholesale.
const DERIVED_BLOB_KEY_PATTERNS = [/^searchText$/i];

// Value-level fallback: an email embedded ANYWHERE in a string (e.g. a search
// blob, a note, a username field) is masked regardless of its key name, so the
// masking can't be defeated by PII hiding in an unexpected field.
//
// ReDoS-safe by construction: the local and domain parts are two SINGLE, bounded
// character-class quantifiers separated by the mandatory literal `@`. There is no
// nested or overlapping quantifier and an upper bound on each run, so the matcher
// is linear and cannot be driven into super-linear backtracking by hostile input.
const EMBEDDED_EMAIL_REGEX = /[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,255}/g;

/** True when the key names a secret (password, token, api key, …). */
const isSecretKey = (key: string) =>
  SECRET_KEY_PATTERNS.some((pattern) => pattern.test(key));

/** True when the key holds an identifier (`_id`, `*Id`, `createdBy`, …). */
const isIdLikeKey = (key: string) =>
  key === '__v' ||
  /^_id$/i.test(key) ||
  /^id$/i.test(key) ||
  /Id(s)?$/.test(key) ||
  /[_-]id(s)?$/i.test(key) ||
  /^(createdBy|updatedBy)$/i.test(key);

/** True when the key holds an email address. */
const isEmailKey = (key: string) =>
  EMAIL_KEY_PATTERNS.some((pattern) => pattern.test(key));

/** True when the key holds an IP address. */
const isIpKey = (key: string) =>
  IP_KEY_PATTERNS.some((pattern) => pattern.test(key));

/** True when the key holds a phone/mobile number. */
const isPhoneKey = (key: string) =>
  PHONE_KEY_PATTERNS.some((pattern) => pattern.test(key));

/** True when the key holds a personal name component. */
const isNameKey = (key: string) =>
  NAME_KEY_PATTERNS.some((pattern) => pattern.test(key));

/** True when the key is a derived/denormalized search blob (e.g. `searchText`). */
const isDerivedBlobKey = (key: string) =>
  DERIVED_BLOB_KEY_PATTERNS.some((pattern) => pattern.test(key));

/** Mask an identifier, keeping only the first/last 4 chars for long values. */
const maskIdentifier = (value: string) => {
  if (!value) {
    return '••••••';
  }

  if (value.length <= 8) {
    return '••••••';
  }

  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
};

/** Mask an email, keeping up to 2 leading local chars and the full domain. */
const maskEmail = (value: string) => {
  const [local = '', domain = ''] = value.split('@');

  if (!local || !domain) {
    return '••••••';
  }

  const visibleLocal = local.slice(0, Math.min(2, local.length));
  return `${visibleLocal}••••@${domain}`;
};

/** Mask an IPv4/IPv6 address, keeping only the leading octet(s)/group. */
const maskIpAddress = (value: string) => {
  if (value.includes('.')) {
    const [first = '*', second = '*'] = value.split('.');
    return `${first}.${second}.***.***`;
  }

  if (value.includes(':')) {
    const [head = '****'] = value.split(':');
    return `${head}:****:****`;
  }

  return '••••••';
};

/** Mask a phone number, revealing only the last 2 digits. */
const maskPhone = (value: string) => {
  if (value.length <= 4) {
    return '••••';
  }

  return `${'•'.repeat(Math.max(4, value.length - 2))}${value.slice(-2)}`;
};

/** Mask a personal name, revealing only the first character. */
const maskName = (value: string) => {
  if (value.length <= 1) {
    return '•';
  }

  return `${value.slice(0, 1)}${'•'.repeat(Math.max(3, value.length - 1))}`;
};

/** Replace every email embedded anywhere in a string with its masked form. */
const redactEmbeddedEmails = (value: string) =>
  value.replace(EMBEDDED_EMAIL_REGEX, (match) => maskEmail(match));

export type SanitizeLogOptions = {
  exposeEmail?: boolean;
};

/**
 * Recursively sanitize a log value. Arrays/objects are walked; leaf strings are
 * masked per their key (secret/id/email/ip/phone/name/derived-blob) with an
 * email-anywhere fallback. `options.exposeEmail` opts a caller out of email
 * masking. Non-string leaves and Dates are returned untouched.
 */
export const sanitizeLogValue = (
  value: unknown,
  key?: string,
  options: SanitizeLogOptions = {},
): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    if (key && isIdLikeKey(key)) {
      return value.map((item) =>
        typeof item === 'string'
          ? maskIdentifier(item)
          : sanitizeLogValue(item, undefined, options),
      );
    }

    return value.map((item) => sanitizeLogValue(item, key, options));
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<
      Record<string, unknown>
    >((acc, [childKey, childValue]) => {
      acc[childKey] = sanitizeLogValue(childValue, childKey, options);
      return acc;
    }, {});
  }

  if (!key || typeof value !== 'string') {
    return value;
  }

  if (isSecretKey(key)) {
    return '••••••';
  }

  if (key === '__v') {
    return '[hidden]';
  }

  if (isIdLikeKey(key)) {
    return maskIdentifier(value);
  }

  if (isEmailKey(key)) {
    if (options.exposeEmail) {
      return value;
    }

    return maskEmail(value);
  }

  if (isIpKey(key)) {
    return maskIpAddress(value);
  }

  if (isPhoneKey(key)) {
    return maskPhone(value);
  }

  if (isNameKey(key)) {
    return maskName(value);
  }

  if (isDerivedBlobKey(key)) {
    return '[redacted]';
  }

  // Value-level fallback: mask any email embedded in an otherwise-unremarkable
  // field, unless the caller has explicitly opted to expose emails.
  return options.exposeEmail ? value : redactEmbeddedEmails(value);
};
