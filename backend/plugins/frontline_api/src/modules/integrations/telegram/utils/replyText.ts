// Keep every code point, including boundary whitespace, without a chunk-count cap.
export const splitTelegramReplyText = (
  text: string,
  firstPartLimit: 1024 | 4096,
): string[] => {
  const characters = Array.from(text);
  const parts: string[] = [];
  let offset = 0;
  while (offset < characters.length) {
    const limit = offset === 0 ? firstPartLimit : 4096;
    const part = characters.slice(offset, offset + limit).join('');
    if (!part.trim())
      throw new Error(
        'Telegram cannot send a message part containing only whitespace. Shorten the blank section before sending.',
      );
    parts.push(part);
    offset += limit;
  }
  return parts;
};
