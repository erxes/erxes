import { Block } from '@blocknote/core';

export const isMarkdownDescription = (description?: string | null): boolean => {
  if (!description) return false;

  try {
    return !Array.isArray(JSON.parse(description));
  } catch {
    return true;
  }
};

/**
 * Operation descriptions (task / triage / project) are normally BlockNote JSON
 * (a Block[]), but legacy or API/script-created records can hold plain text.
 * Parsing defensively keeps a non-JSON description from crashing the page.
 * The task and triage detail editors then import that text as Markdown.
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
