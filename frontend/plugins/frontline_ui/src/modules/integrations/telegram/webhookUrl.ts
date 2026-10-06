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

    const path = url.pathname
      .replace(/\/telegram\/receive(?:\/[^/]+)?\/?$/, '')
      .replace(/\/+$/, '');
    return `${url.origin}${path}`;
  } catch {
    return undefined;
  }
};

export const getTelegramWebhookUrl = (
  address: string,
  botId: string,
): string | undefined => {
  const base = getTelegramServerAddress(address);
  return base ? `${base}/telegram/receive/${botId}` : undefined;
};
