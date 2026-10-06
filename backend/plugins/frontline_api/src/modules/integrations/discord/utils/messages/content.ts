import {
  CHUNK_SIZE,
  MAX_CHUNKS,
} from '@/integrations/discord/constants/messages';

const isHighSurrogate = (code: number) => code >= 0xd800 && code <= 0xdbff;

const pickCut = (window: string, maxLen: number): number | null => {
  for (const sep of ['\n\n', '\n', ' ']) {
    const i = window.lastIndexOf(sep);
    if (i > maxLen * 0.5) return i + sep.length;
  }
  return null;
};

const balanceCodeFences = (chunks: string[]): string[] => {
  let open: string | null = null;
  return chunks.map((chunk) => {
    const prefix = open === null ? '' : `\`\`\`${open}\n`;
    for (const marker of chunk.match(/^[ \t]*```(\w*)/gm) || []) {
      open = open === null ? marker.trim().slice(3) : null;
    }
    const suffix = open === null ? '' : '\n```';
    return prefix + chunk + suffix;
  });
};

export const splitDiscordContent = (
  content: string,
  maxLen: number = CHUNK_SIZE,
): { chunks: string[]; truncated: boolean } => {
  if (!content) return { chunks: [], truncated: false };
  if (content.length <= maxLen) return { chunks: [content], truncated: false };

  const chunks: string[] = [];
  let rest = content;

  while (rest.length > maxLen && chunks.length < MAX_CHUNKS - 1) {
    let cut = pickCut(rest.slice(0, maxLen), maxLen);
    cut ??= isHighSurrogate(rest.charCodeAt(maxLen - 1)) ? maxLen - 1 : maxLen;
    const piece = rest.slice(0, cut).trimEnd();
    if (piece) chunks.push(piece);
    rest = rest.slice(cut);
  }

  let truncated = false;
  if (rest.length > maxLen) {
    truncated = true;
    let tail = rest.slice(0, maxLen - 1);
    if (isHighSurrogate(tail.charCodeAt(tail.length - 1))) {
      tail = tail.slice(0, -1);
    }
    chunks.push(`${tail.trimEnd()}…`);
  } else if (rest.trim()) {
    chunks.push(rest);
  }

  return { chunks: balanceCodeFences(chunks), truncated };
};
