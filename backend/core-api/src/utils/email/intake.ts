import { TEmailScreenReason } from 'erxes-api-shared/core-modules';
import { getEnv, normalizeEmail, redis } from 'erxes-api-shared/utils';
import { promises as dns } from 'dns';

export type IIntakeVerdict =
  | { ok: true; reason?: 'role' }
  | { ok: false; reason: TEmailScreenReason };

const ROLE_LOCAL_PARTS = new Set([
  'admin',
  'billing',
  'contact',
  'help',
  'hello',
  'info',
  'mail',
  'marketing',
  'noreply',
  'no-reply',
  'office',
  'postmaster',
  'sales',
  'support',
  'team',
  'webmaster',
]);

const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'maildrop.cc',
  'sharklasers.com',
  'temp-mail.org',
  'tempmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'yopmail.com',
]);

const disposableDomains = () =>
  new Set([
    ...DISPOSABLE_DOMAINS,
    ...(getEnv({ name: 'EMAIL_DISPOSABLE_DOMAINS' }) || '')
      .split(',')
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean),
  ]);

const SYNTAX = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

// Digits are ignored: name + phone number or birth date is a common real pattern.
const looksRandom = (localPart: string) => {
  const letters = localPart.toLowerCase().replace(/[^a-z]/g, '');

  if (letters.length < 8) {
    return false;
  }

  const vowels = (letters.match(/[aeiouy]/g) || []).length;
  const longestConsonantRun = Math.max(
    ...(letters.match(/[bcdfghjklmnpqrstvwxz]+/g) || ['']).map(
      (run) => run.length,
    ),
  );

  return vowels === 0 || longestConsonantRun >= 6;
};

const MX_CACHE_SECONDS = 24 * 60 * 60;
const MX_TIMEOUT_MS = 5000;

const AUTHORITATIVE_DNS_ERRORS = new Set(['ENOTFOUND', 'ENODATA']);

const hasMxRecord = async (domain: string): Promise<boolean | undefined> => {
  const key = `email:mx:${domain}`;
  const cached = await redis.get(key);

  if (cached !== null) {
    return cached === '1';
  }

  let found: boolean;

  try {
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('mx_timeout')), MX_TIMEOUT_MS),
      ),
    ]);

    found = records.some((record) => !!record.exchange);
  } catch (error) {
    if (!AUTHORITATIVE_DNS_ERRORS.has(error.code)) {
      return undefined;
    }

    found = false;
  }

  await redis.set(key, found ? '1' : '0', 'EX', MX_CACHE_SECONDS);

  return found;
};

export const screenAddress = async (email: string): Promise<IIntakeVerdict> => {
  const address = normalizeEmail(email || '');

  if (!SYNTAX.test(address)) {
    return { ok: false, reason: 'syntax' };
  }

  const [localPart, domain] = address.split('@');

  if (disposableDomains().has(domain)) {
    return { ok: false, reason: 'disposable' };
  }

  if ((await hasMxRecord(domain)) === false) {
    return { ok: false, reason: 'no_mx' };
  }

  if (looksRandom(localPart)) {
    return { ok: false, reason: 'random' };
  }

  if (ROLE_LOCAL_PARTS.has(localPart)) {
    return { ok: true, reason: 'role' };
  }

  return { ok: true };
};
