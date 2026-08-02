import { getEnv, normalizeEmail, redis } from 'erxes-api-shared/utils';
import { promises as dns } from 'dns';

export type TIntakeReason =
  | 'syntax'
  | 'no_mx'
  | 'disposable'
  | 'role'
  | 'random';

export interface IIntakeVerdict {
  ok: boolean;
  reason?: TIntakeReason;
}

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

const looksRandom = (localPart: string) => {
  const value = localPart.toLowerCase().replace(/[._+-]/g, '');

  if (value.length < 8) {
    return false;
  }

  const vowels = (value.match(/[aeiouy]/g) || []).length;
  const digits = (value.match(/\d/g) || []).length;
  const longestConsonantRun = Math.max(
    ...(value.match(/[bcdfghjklmnpqrstvwxz]+/g) || ['']).map(
      (run) => run.length,
    ),
  );

  return (
    vowels === 0 || digits / value.length > 0.4 || longestConsonantRun >= 6
  );
};

const MX_CACHE_SECONDS = 24 * 60 * 60;

const hasMxRecord = async (domain: string): Promise<boolean> => {
  const key = `email:mx:${domain}`;
  const cached = await redis.get(key);

  if (cached !== null) {
    return cached === '1';
  }

  let found = false;

  try {
    found = (await dns.resolveMx(domain)).some((record) => !!record.exchange);
  } catch {
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

  if (!(await hasMxRecord(domain))) {
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
