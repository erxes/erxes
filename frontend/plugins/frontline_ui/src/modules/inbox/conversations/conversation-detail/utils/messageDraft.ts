/** Trim empty trailing paragraphs without dropping text or mutating the editor. */
export const getMessageDraftBlocks = <
  T extends {
    type: string;
    content?: unknown;
    children?: unknown[];
  },
>(
  document: T[],
): T[] => {
  const blocks = [...document];
  while (blocks.length) {
    const last = blocks[blocks.length - 1];
    const empty =
      last.content == null ||
      (Array.isArray(last.content) &&
        last.content.every(
          (item: unknown) =>
            typeof item === 'object' &&
            item !== null &&
            'type' in item &&
            item.type === 'text' &&
            'text' in item &&
            typeof item.text === 'string' &&
            !item.text.trim(),
        ));
    if (last.type !== 'paragraph' || !empty || last.children?.length) break;
    blocks.pop();
  }
  return blocks;
};
