import * as path from 'path';
import * as net from 'net';
import * as dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

const Segmenter = (Intl as any).Segmenter;
const segmenter = new Segmenter(undefined, { granularity: 'grapheme' });

const truncate = (input: string, length: number): string => {
  const segItr = segmenter.segment(input);
  const segArr = Array.from(segItr, ({ segment }) => segment);
  return segArr.slice(0, length).join('');
};

// Use a non-backtracking approach to remove trailing spaces and dots
const removeTrailingSpacesAndDots = (str: string): string => {
  let end = str.length;
  while (end > 0 && (str[end - 1] === ' ' || str[end - 1] === '.')) {
    end--;
  }
  return str.substring(0, end);
};

const illegalRe = /[/?<>\\:*|"]/g;
// eslint-disable-next-line no-control-regex
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i;

export const sanitizeFilename = (input: string) => {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be string');
  }

  let sanitized = input
    .replaceAll(illegalRe, '')
    .replaceAll(controlRe, '')
    .replaceAll(reservedRe, '')
    .replaceAll(windowsReservedRe, '');

  sanitized = removeTrailingSpacesAndDots(sanitized);

  return truncate(sanitized, 255);
};

export const sanitizeKey = (key: string): string => {
  // Disallow empty keys
  if (!key) throw new Error('Key cannot be empty');

  // Disallow protocol schemes to prevent external URLs
  if (/^https?:\/\//i.test(key)) {
    throw new Error('Invalid key: protocol scheme not allowed');
  }

  // Disallow path traversal sequences
  if (key.includes('..')) {
    throw new Error('Invalid key: path traversal is not allowed');
  }

  // Allow only alphanumeric, slash, dash, underscore, space, parentheses and dot characters
  // Adjust this regex based on your expected key format
  if (!/^[a-zA-Z0-9/_\-. ()]+$/.test(key)) {
    throw new Error('Invalid key: contains disallowed characters');
  }

  // Normalize the key to remove redundant slashes or segments
  // This uses path.posix to ensure forward slash normalization regardless of OS
  const normalizedKey = path.posix.normalize(key);

  // After normalization, check again for path traversal
  if (normalizedKey.startsWith('..') || normalizedKey.includes('../')) {
    throw new Error('Invalid key: path traversal detected after normalization');
  }

  return normalizedKey;
};

/**
 * Checks if an IP address belongs to a private/reserved range.
 * Used to prevent SSRF attacks by blocking requests to internal networks.
 */
export const isPrivateIP = (ip: string): boolean => {
  // IPv4 private ranges
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 127.0.0.0/8 (loopback)
    if (parts[0] === 127) return true;
    // 169.254.0.0/16 (link-local / cloud metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0
    if (parts[0] === 0) return true;
  }

  // IPv6 private ranges
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    // ::1 (loopback)
    if (normalized === '::1') return true;
    // fe80::/10 (link-local)
    if (normalized.startsWith('fe80:')) return true;
    // fc00::/7 (unique local address)
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    // ::ffff:127.0.0.1 (IPv4-mapped)
    if (normalized.startsWith('::ffff:')) {
      const v4 = normalized.slice(7);
      return isPrivateIP(v4);
    }
  }

  return false;
};

/**
 * Validates that a URL does not point to a private/internal network address.
 * Resolves the hostname via DNS to catch DNS rebinding attempts.
 * Throws an error if the URL targets a private IP.
 */
export const validateUrlNotPrivate = async (url: URL): Promise<void> => {
  const hostname = url.hostname;

  // Direct IP check
  if (net.isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new Error(
        'SSRF protection: requests to private/internal IP addresses are not allowed',
      );
    }
    return;
  }

  // DNS resolution check
  try {
    const { address } = await dnsLookup(hostname);
    if (isPrivateIP(address)) {
      throw new Error(
        'SSRF protection: hostname resolves to a private/internal IP address',
      );
    }
  } catch (e) {
    if ((e as Error).message.startsWith('SSRF protection')) {
      throw e;
    }
    // DNS lookup failure - allow the request to proceed (will fail naturally)
  }
};
