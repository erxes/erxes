export const getDiscordStickerAnimation = async (
  stickerId: string,
): Promise<Record<string, unknown>> => {
  if (!/^\d{1,20}$/.test(stickerId)) {
    throw new Error('Invalid Discord sticker ID');
  }
  const response = await fetch(
    `https://cdn.discordapp.com/stickers/${stickerId}.json`,
    { signal: AbortSignal.timeout(10000), redirect: 'error' },
  );
  if (!response.ok) throw new Error('Discord sticker is unavailable');
  const body = await response.text();
  if (Buffer.byteLength(body) > 2 * 1024 * 1024) {
    throw new Error('Discord sticker is too large');
  }
  const data: unknown = JSON.parse(body);
  if (
    !data ||
    typeof data !== 'object' ||
    !('layers' in data) ||
    !Array.isArray(data.layers)
  ) {
    throw new Error('Invalid Discord sticker animation');
  }
  return { ...data };
};
