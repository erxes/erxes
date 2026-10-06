import type { IMessageSticker } from '@/inbox/types/Conversation';

export const getStickerImageUrl = (
  sticker: IMessageSticker,
): string | undefined => {
  if (sticker.formatType === 3 && /^\d+$/.test(sticker.id)) {
    return `https://cdn.discordapp.com/stickers/${sticker.id}.json`;
  }

  if (sticker.url) return sticker.url;
  if (!/^\d+$/.test(sticker.id)) return undefined;

  const extension = sticker.formatType === 4 ? 'gif' : 'png';
  return `https://media.discordapp.net/stickers/${sticker.id}.${extension}`;
};
