import { domainToASCII } from 'node:url';
import { isIP } from 'node:net';
import { RESERVED_SUFFIXES } from '@/customdomain/constants';

const LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;

/**
 * Reduces what a user typed ("https://Help.Acme.com/", "help.acme.com:443")
 * to the bare lowercase ASCII hostname Cloudflare and DNS work with.
 */
export const normalizeHostname = (input?: string | null): string => {
  const raw = (input ?? '').trim().toLowerCase();

  if (!raw) {
    return '';
  }

  const withoutScheme = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
  const host = withoutScheme.split(/[/?#]/)[0].split('@').pop() ?? '';
  const withoutPort = host.replace(/:\d+$/, '').replace(/\.$/, '');

  return domainToASCII(withoutPort);
};

export const validateHostname = (hostname: string): string | null => {
  if (!hostname) {
    return 'Enter a domain such as help.example.com';
  }

  if (hostname.length > 253 || isIP(hostname)) {
    return 'Enter a domain name, not an IP address';
  }

  const labels = hostname.split('.');

  if (labels.length < 2 || !labels.every((label) => LABEL.test(label))) {
    return `"${hostname}" is not a valid domain name`;
  }

  if (/^\d+$/.test(labels[labels.length - 1])) {
    return `"${hostname}" is not a valid domain name`;
  }

  const reserved = RESERVED_SUFFIXES.find(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
  );

  if (reserved) {
    return `Domains under ${reserved} cannot be used as a custom domain`;
  }

  return null;
};
