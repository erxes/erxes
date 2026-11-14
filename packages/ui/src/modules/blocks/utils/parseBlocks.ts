import type { Block } from '@blocknote/core';
import { z } from 'zod';
import { jsonOf } from 'erxes-ui/utils/json';

/** BlockNote checks the rest of a block when it loads it; here only that each has an id and a type. */
const blockSchema = z.custom<Block>(
  (block) => typeof block === 'object' && block !== null && 'id' in block && 'type' in block,
);

const blocksSchema = z.array(blockSchema).min(1);

/** Stored editor content (blocks, or blocks as JSON); false when it is empty or not blocks. */
export const parseBlocks = (content: unknown) =>
  blocksSchema.or(jsonOf(blocksSchema)).safeParse(content).data ?? false;

/** The text inside a block tree in reading order; each block ends its line. */
const textOf = (node: unknown): string => {
  if (Array.isArray(node)) return node.map(textOf).join('');

  if (typeof node !== 'object' || node === null) return '';

  if ('text' in node && typeof node.text === 'string') return node.text;

  const inner = Object.values(node).map(textOf).join('');

  return 'id' in node ? `${inner}\n` : inner;
};

/** Stored editor content (block JSON, or HTML) as the plain text a reader sees. */
export const editorText = (content: string) => {
  const blocks = parseBlocks(content);

  return (blocks ? textOf(blocks) : content.replace(/<[^>]+>/g, ' ')).trim();
};
