import { getEnv } from 'erxes-api-shared/utils';

type Replacement = (replacer: any, path: string) => any;
type Transform = (block: any, text: any) => any | undefined;

const BLOCK_LEVEL_TYPES = ['table', 'image'];

const isBlankInline = (item: any) =>
  (!item?.type || item.type === 'text') && !String(item?.text ?? '').trim();

const isEmptiedBlock = (block: any) =>
  Array.isArray(block?.content) &&
  block.content.every(isBlankInline) &&
  !(Array.isArray(block?.children) && block.children.length);

export const replaceBlocks = ({
  replacer,
  content,
  replacement,
  transform,
}: {
  replacer: any;
  content: string;
  replacement: Replacement;
  transform?: Transform;
}): string => {
  let blocks: any[];
  try {
    blocks = JSON.parse(content);
  } catch (e) {
    console.error(
      `[deal-document] failed to parse document content as block JSON: ${
        (e as Error).message
      }`,
    );
    return content;
  }

  if (!Array.isArray(blocks)) {
    console.error('[deal-document] document content is not a block array');
    return content;
  }

  const processAttribute = (block: any, text: any) => {
    const { props, ...rest } = block;

    if (typeof text === 'string' && /\.(png|jpe?g|gif|webp|svg)$/i.test(text)) {
      const DOMAIN = getEnv({
        name: 'DOMAIN',
        defaultValue: 'http://localhost:4000',
      });

      return {
        ...rest,
        type: 'image',
        props: {
          ...props,
          name: text || '-',
          url: `${DOMAIN}/read-file?key=${text}`,
        },
      };
    }

    if (transform) {
      const transformedBlock = transform(block, text);

      if (transformedBlock) {
        return transformedBlock;
      }
    }

    return {
      ...rest,
      type: 'text',
      text: text || '-',
    };
  };

  const replaceAttribute = (node: any) =>
    processAttribute(node, replacement(replacer, node?.props?.value));

  const processContainer = (node: any, hoisted: any[]) => {
    if (!node || typeof node !== 'object') return;

    for (const key of Object.keys(node)) {
      const value = node[key];

      if (Array.isArray(value)) {
        node[key] = processNodes(value, hoisted);
        continue;
      }

      if (value && typeof value === 'object') {
        processContainer(value, hoisted);
      }
    }
  };

  const processNodes = (nodes: any[], hoisted: any[]): any[] => {
    const result: any[] = [];

    for (const node of nodes) {
      if (node?.type === 'attribute') {
        const replaced = replaceAttribute(node);

        if (BLOCK_LEVEL_TYPES.includes(replaced?.type)) {
          hoisted.push(replaced);
          continue;
        }

        result.push(replaced);
        continue;
      }

      processContainer(node, hoisted);
      result.push(node);
    }

    return result;
  };

  const replacedBlocks: any[] = [];

  for (const block of blocks) {
    if (block?.type === 'attribute') {
      replacedBlocks.push(replaceAttribute(block));
      continue;
    }

    const hoisted: any[] = [];
    processContainer(block, hoisted);

    if (!hoisted.length || !isEmptiedBlock(block)) {
      replacedBlocks.push(block);
    }

    replacedBlocks.push(...hoisted);
  }

  return JSON.stringify(replacedBlocks);
};

export const buildTableBlock = (rows: string[][]) => ({
  id: Math.random().toString(36).slice(2),
  type: 'table',
  props: {},
  content: {
    type: 'tableContent',
    rows: rows.map((cells) => ({
      cells: cells.map((cell) => ({
        content: [{ type: 'text', text: cell ?? '-', styles: {} }],
      })),
    })),
  },
  children: [],
});
