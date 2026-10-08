import type { IBlockEditor } from 'erxes-ui';

type DocumentBlock = Parameters<IBlockEditor['replaceBlocks']>[1][number];

type AttributeBlock = {
  id?: string;
  type: 'attribute';
  props?: {
    name?: string;
    value?: string;
    width?: number;
    height?: number;
  };
  children?: StoredDocumentBlock[];
};

export type StoredDocumentBlock = DocumentBlock | AttributeBlock;

export const normalizeDocumentBlocks = (
  blocks: StoredDocumentBlock[],
): DocumentBlock[] =>
  blocks.map((block): DocumentBlock => {
    const children = block.children
      ? normalizeDocumentBlocks(block.children)
      : undefined;

    if (block.type === 'attribute') {
      return {
        id: block.id,
        type: 'paragraph',
        content: [
          {
            type: 'attribute',
            props: {
              name: block.props?.name ?? 'Unknown',
              value: block.props?.value ?? '',
              width: block.props?.width ?? 150,
              height: block.props?.height ?? 50,
            },
          },
        ],
        children,
      };
    }

    return { ...block, children };
  });
