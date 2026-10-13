/** Accept a server address or a previously generated Telegram webhook URL. */
export const getTelegramServerAddress = (value: string): string | undefined => {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return undefined;

    const path = url.pathname.replace(
      /\/telegram\/receive(?:\/[^/]+)?\/?$/,
      '',
    );
    let end = path.length;
    while (end > 0 && path[end - 1] === '/') end--;
    return `${url.origin}${path.slice(0, end)}`;
  } catch {
    return undefined;
  }
};

/** Appends the bot callback path to a validated public server address. */
export const getTelegramWebhookUrl = (
  address: string,
  botId: string,
): string | undefined => {
  const base = getTelegramServerAddress(address);
  return base ? `${base}/telegram/receive/${botId}` : undefined;
};

/** Use the same public gateway proxy as the other Frontline integrations. */
export const getTelegramDefaultServerAddress = (
  apiUrl: string,
): string | undefined => {
  const base = getTelegramServerAddress(apiUrl);
  if (!base) return undefined;
  const hostname = new URL(base).hostname.toLowerCase().replace(/\.$/, '');
  if (
    !hostname.includes('.') ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    /^(0|10|127)\./.test(hostname) ||
    hostname.startsWith('169.254.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    hostname.startsWith('192.168.')
  )
    return undefined;
  return `${base}/pl:frontline`;
};
