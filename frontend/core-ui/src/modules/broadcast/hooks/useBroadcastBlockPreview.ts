import { useBlockEditor } from 'erxes-ui';
import { useEffect } from 'react';

/**
 * A read-only editor holding block content saved before the email editor.
 * Content that is not a block document is read as html.
 */
export const useBroadcastBlockPreview = (content: string) => {
  const editor = useBlockEditor();

  useEffect(() => {
    const load = async () => {
      let blocks;

      try {
        blocks = JSON.parse(content);
      } catch {
        blocks = await editor.tryParseHTMLToBlocks(content);
      }

      editor.replaceBlocks(editor.document, blocks);
    };

    load();
  }, [content, editor]);

  return editor;
};
