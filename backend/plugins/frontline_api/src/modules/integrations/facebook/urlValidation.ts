const ALLOWED_FACEBOOK_HOSTNAME_PATTERNS: ReadonlyArray<RegExp> = [
  /^(.+\.)?fbcdn\.net$/,
  /^(.+\.)?facebook\.com$/,
  /^(.+\.)?fb\.com$/,
  /^(.+\.)?fbsbx\.com$/,
  /^(.+\.)?instagram\.com$/,
  /^(.+\.)?cdninstagram\.com$/,
];

const PRIVATE_IP_PATTERNS: ReadonlyArray<RegExp> = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

/** Converts hex-normalized IPv4-mapped IPv6 (e.g. ::ffff:7f00:1) to dotted IPv4. */
function extractIPv4FromMappedIPv6(ip: string): string | null {
  const match = ip.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (!match) return null;

  const hi = parseInt(match[1], 16);
  const lo = parseInt(match[2], 16);
  return `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
}

/** Checks whether a hostname is a private or reserved IP address. */
function isPrivateIp(hostname: string): boolean {
  const bare = hostname.replace(/^\[|\]$/g, '');
  const target = extractIPv4FromMappedIPv6(bare) ?? bare;
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(target));
}

/** Checks whether a hostname belongs to a known Facebook CDN domain. */
function isAllowedFacebookHost(hostname: string): boolean {
  return ALLOWED_FACEBOOK_HOSTNAME_PATTERNS.some((pattern) =>
    pattern.test(hostname.toLowerCase()),
  );
}

/**
 * Validates that a URL is safe to fetch server-side.
 * Enforces HTTPS-only, Facebook CDN hostname allowlist, and private IP blocking.
 * @throws {Error} if the URL fails any validation check
 */
export function validateMediaUrl(url: string): void {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL: unable to parse');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`Blocked non-HTTPS URL scheme: ${parsed.protocol}`);
  }

  if (isPrivateIp(parsed.hostname)) {
    throw new Error(`Blocked private/internal IP: ${parsed.hostname}`);
  }

  if (!isAllowedFacebookHost(parsed.hostname)) {
    throw new Error(`Blocked non-Facebook hostname: ${parsed.hostname}`);
  }
}
