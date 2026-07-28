import { getEnv } from 'erxes-api-shared/utils';

type Replacement = (replacer: any, path: string) => any;
type Transform = (block: any, text: any) => any | undefined;

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

  const processBlock = (
    block: any,
    parentBlocks?: any[],
    parentIndex?: number,
  ) => {
    if (!block) return;

    if (block.type === 'attribute') {
      const { props } = block;
      const replacedValue = replacement(replacer, props?.value);

      if (parentBlocks && parentIndex !== undefined) {
        parentBlocks[parentIndex] = processAttribute(block, replacedValue);
      }

      return;
    }

    for (const key in block) {
      const value = block[key];

      if (Array.isArray(value)) {
        value.forEach((item, childIndex) =>
          processBlock(item, value, childIndex),
        );
      } else if (value && typeof value === 'object') {
        processBlock(value);
      }
    }
  };

  blocks.forEach((block: any, index: number) =>
    processBlock(block, blocks, index),
  );

  return JSON.stringify(blocks);
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
