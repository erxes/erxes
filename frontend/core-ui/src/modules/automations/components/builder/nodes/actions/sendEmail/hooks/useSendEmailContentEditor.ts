import { useBlockEditor } from 'erxes-ui';
import { useEffect } from 'react';

/**
 * Block editor instance for the email content sheet, kept in sync with the
 * stored config value: blocks-JSON is loaded directly, anything else is
 * parsed as HTML (e.g. content that originated from an email template).
 */
export const useSendEmailContentEditor = (content: string) => {
  const editor = useBlockEditor({});

  useEffect(() => {
    if (!content || !editor) {
      return;
    }

    const loadContent = async () => {
      let blocks;

      try {
        blocks = JSON.parse(content);
      } catch (_error) {
        blocks = await editor.tryParseHTMLToBlocks(content);
      }

      editor.replaceBlocks(editor.document, blocks);
    };

    loadContent();
  }, [editor, content]);

  return editor;
};
