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
  /^::ffff:(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|0\.)/i,
];

function isPrivateIp(hostname: string): boolean {
  const bare = hostname.replace(/^\[|\]$/g, '');
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(bare));
}

function isAllowedFacebookHost(hostname: string): boolean {
  return ALLOWED_FACEBOOK_HOSTNAME_PATTERNS.some((pattern) =>
    pattern.test(hostname.toLowerCase()),
  );
}

export function validateMediaUrl(url: string): void {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: unable to parse`);
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
