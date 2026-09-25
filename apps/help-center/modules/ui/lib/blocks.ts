export type InlineStyles = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
};

export type InlineNode = {
  type?: string;
  text?: string;
  href?: string;
  styles?: InlineStyles;
  content?: InlineNode[];
};

export type Block = {
  id?: string;
  type?: string;
  props?: {
    level?: number;
    url?: string;
    name?: string;
    caption?: string;
    checked?: boolean;
  };
  content?: unknown;
  children?: Block[];
};

const isBlock = (value: unknown): value is Block =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Block).type === 'string';

export const parseBlocks = (raw: string): Block[] | null => {
  const text = raw.trim();

  if (!text.startsWith('[')) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(text);

    return Array.isArray(parsed) && parsed.every(isBlock) ? parsed : null;
  } catch {
    return null;
  }
};

export const inlineOf = (block: Block): InlineNode[] =>
  Array.isArray(block.content) ? (block.content as InlineNode[]) : [];

const inlineText = (nodes: InlineNode[]): string =>
  nodes
    .map((node) =>
      node.type === 'link'
        ? inlineText(node.content ?? []) || node.href || ''
        : (node.text ?? ''),
    )
    .join('');

export const blockText = (block: Block): string => inlineText(inlineOf(block));

const isEmpty = (block: Block): boolean =>
  !blockText(block).trim() && !block.props?.url && !block.children?.length;

export const trimTrailingEmpty = (blocks: Block[]): Block[] => {
  let end = blocks.length;

  while (end > 0 && isEmpty(blocks[end - 1])) {
    end -= 1;
  }

  return blocks.slice(0, end);
};
