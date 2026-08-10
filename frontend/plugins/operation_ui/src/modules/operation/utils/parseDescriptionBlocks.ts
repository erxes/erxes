import { Block } from '@blocknote/core';

/**
 * Operation descriptions (task / triage / project) are normally BlockNote JSON
 * (a Block[]), but legacy or API/script-created records can hold plain text.
 * Parsing defensively keeps a non-JSON description from throwing during render
 * and crashing the page — the text is rendered as a single paragraph instead.
 */
export const parseDescriptionBlocks = (
  description?: string | null,
): Block[] | undefined => {
  if (!description) return undefined;
  try {
    const parsed = JSON.parse(description);
    return Array.isArray(parsed) && parsed.length > 0
      ? (parsed as Block[])
      : undefined;
  } catch {
    return [{ type: 'paragraph', content: description } as unknown as Block];
  }
};
