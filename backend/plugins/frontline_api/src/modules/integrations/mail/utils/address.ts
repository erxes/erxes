import { customAlphabet } from 'nanoid';
import { getEnv } from 'erxes-api-shared/utils';

const TAG_SEPARATOR = '+';

const TENANT_SEPARATOR = '--';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]+$/;

const LOCAL_PART_LIMIT = 64;

const TAG_LENGTH = 10;

const SUFFIX_LENGTH = 6;

const MAX_SLUG_LENGTH = 24;

const MIN_SLUG_LENGTH = 3;

const nextTag = customAlphabet('abcdefghijkmnpqrstuvwxyz23456789', TAG_LENGTH);

const nextSuffix = customAlphabet(
  'abcdefghijkmnpqrstuvwxyz23456789',
  SUFFIX_LENGTH,
);

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'j',
  з: 'z',
  и: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  ө: 'u',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ү: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

const transliterate = (value: string) =>
  value
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join('');

export const slugify = (value: string) =>
  transliterate(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const isEmailAddress = (value: string) => EMAIL_PATTERN.test(value);

export const addressDomain = (value: string) => value.split('@').pop() ?? '';

export const createReplyTag = () => nextTag();

const readConfiguredTenant = (subdomain: string) => {
  if (getEnv({ name: 'VERSION' }) === 'saas') {
    return '';
  }

  return getEnv({ name: 'MAIL_TENANT', defaultValue: '', subdomain }).trim();
};

export const resolveMailTenant = (subdomain: string) => {
  const configured = readConfiguredTenant(subdomain);
  const tenant = slugify(configured || subdomain);

  if (!tenant) {
    throw new Error(
      'Could not determine the mail tenant — set MAIL_TENANT for this deployment',
    );
  }

  if (!configured && tenant !== subdomain.toLowerCase()) {
    throw new Error(
      `The subdomain "${subdomain}" cannot be used as a mail tenant — a tenant must be a plain DNS label with single hyphens`,
    );
  }

  return tenant;
};

export const buildOwnDomainAddress = (name: string, domain: string) => {
  const budget = LOCAL_PART_LIMIT - TAG_LENGTH - TAG_SEPARATOR.length;

  const slug =
    slugify(name).slice(0, Math.min(MAX_SLUG_LENGTH, budget)) || 'inbox';

  return `${slug}@${domain}`.toLowerCase();
};

export const buildInboxAddress = (
  tenant: string,
  name: string,
  domain: string,
) => {
  const budget =
    LOCAL_PART_LIMIT -
    tenant.length -
    TENANT_SEPARATOR.length -
    SUFFIX_LENGTH -
    1 -
    TAG_LENGTH -
    TAG_SEPARATOR.length;

  if (budget < MIN_SLUG_LENGTH) {
    throw new Error(
      `The tenant name "${tenant}" is too long for a mail address — shorten the subdomain or set MAIL_TENANT to a shorter value`,
    );
  }

  const slug =
    slugify(name).slice(0, Math.min(MAX_SLUG_LENGTH, budget)) || 'inbox';

  return `${tenant}${TENANT_SEPARATOR}${slug}-${nextSuffix()}@${domain}`.toLowerCase();
};

export const buildTaggedAddress = (address: string, tag: string) => {
  const [local, domain] = address.split('@');

  if (!local || !domain) {
    return address;
  }

  return `${local}${TAG_SEPARATOR}${tag}@${domain}`;
};

export const parseTaggedAddress = (value?: string) => {
  const normalized = (value || '').trim().toLowerCase();
  const [local, domain] = normalized.split('@');

  if (!local || !domain) {
    return { address: normalized };
  }

  const separator = local.indexOf(TAG_SEPARATOR);

  if (separator === -1) {
    return { address: normalized };
  }

  return {
    address: `${local.slice(0, separator)}@${domain}`,
    tag: local.slice(separator + 1) || undefined,
  };
};
