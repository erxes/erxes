import type { IBlockEditor } from 'erxes-ui';
import { z } from 'zod';

type DocumentBlocks = Parameters<IBlockEditor['replaceBlocks']>[1];

const legacyAttributeSchema = z.object({
  type: z.literal('attribute'),
  id: z.string().optional(),
  props: z.object({
    name: z.string().optional(),
    value: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
});

export const normalizeDocumentBlocks = (
  blocks: DocumentBlocks,
): DocumentBlocks =>
  blocks.map((block): DocumentBlocks[number] => {
    const legacy = legacyAttributeSchema.safeParse(block);
    const children = block.children
      ? normalizeDocumentBlocks(block.children)
      : undefined;

    if (legacy.success) {
      return {
        id: legacy.data.id,
        type: 'paragraph',
        content: [
          {
            type: 'attribute',
            props: {
              name: legacy.data.props.name ?? 'Unknown',
              value: legacy.data.props.value ?? '',
              width: legacy.data.props.width ?? 150,
              height: legacy.data.props.height ?? 50,
            },
          },
        ],
        children,
      };
    }

    return children ? { ...block, children } : block;
  });

export const loadDocumentBlocks = async (
  editor: IBlockEditor,
  content?: string | null,
): Promise<DocumentBlocks> => {
  if (!content) return [{ type: 'paragraph' }];

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    if (!/^\s*<(?:!doctype\b|[a-z][\w-]*(?:\s[^>]*|\/?)>)/i.test(content)) {
      return editor.tryParseMarkdownToBlocks(content);
    }
    try {
      return await editor.tryParseHTMLToBlocks(content);
    } catch {
      return editor.tryParseMarkdownToBlocks(content);
    }
  }

  if (!Array.isArray(parsed)) throw new Error('Invalid document content');
  return parsed.length
    ? normalizeDocumentBlocks(parsed)
    : [{ type: 'paragraph' }];
};
