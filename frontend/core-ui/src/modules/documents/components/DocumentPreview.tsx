import { BlockEditor, toast, useBlockEditor } from 'erxes-ui';
import { useEffect } from 'react';
import type { IDocument } from '@/documents/types';
import {
  normalizeDocumentBlocks,
  StoredDocumentBlock,
} from '@/documents/utils/normalizeDocumentBlocks';

export const DocumentPreview = ({
  document,
}: {
  document: Pick<IDocument, '_id' | 'content'>;
}) => {
  const editor = useBlockEditor();

  useEffect(() => {
    const content = document.content || '[]';
    let cancelled = false;

    const loadInitialContent = async () => {
      let blocks: StoredDocumentBlock[];

      try {
        blocks = JSON.parse(content);
      } catch {
        try {
          blocks = await editor.tryParseHTMLToBlocks(content);
        } catch {
          blocks = await editor.tryParseMarkdownToBlocks(content);
        }
      }

      if (cancelled) return;
      editor.replaceBlocks(
        editor.document,
        blocks.length
          ? normalizeDocumentBlocks(blocks)
          : [{ type: 'paragraph' }],
      );
    };

    loadInitialContent().catch(() => {
      if (cancelled) return;
      editor.replaceBlocks(editor.document, [{ type: 'paragraph' }]);
      toast({
        title: 'Could not load document preview',
        variant: 'destructive',
      });
    });
    return () => {
      cancelled = true;
    };
  }, [document._id, document.content, editor]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="scale-[0.7] origin-top-left w-[333%] h-auto pointer-events-none select-none">
        <BlockEditor editor={editor} readonly className="py-8 px-4" />
      </div>
    </div>
  );
};
